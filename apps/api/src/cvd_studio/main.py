import json
import logging
import time
import uuid
from collections import OrderedDict
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException
from pydantic import ValidationError
from jsonschema import Draft202012Validator, FormatChecker
from cvd_studio.api.models import ScenarioRequest, SimulationResponse, Capabilities, ParameterRegistry
from cvd_studio.services.simulation import load, REGISTRY, scalar
from cvd_studio.domain.errors import ScienceError
from cvd_studio.services.executor import BoundedExecutor

SCHEMA = load("schemas/cvd-studio.schema.json")
CONTRACT = load("contracts/openapi.json")
VALIDATOR = Draft202012Validator(SCHEMA, format_checker=FormatChecker())
log = logging.getLogger("cvd")


@asynccontextmanager
async def lifespan(app):
    app.state.executor = BoundedExecutor()
    app.state.rates = OrderedDict()
    yield


app = FastAPI(
    title="CVD Studio",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    openapi_url="/api/v1/openapi.json",
)


def fail(code, message, rid, status=422, issues=None, retryable=False):
    return JSONResponse(
        {
            "error": {
                "code": code,
                "message": message,
                "request_id": rid,
                "issues": issues or [],
                "retryable": retryable,
            }
        },
        status_code=status,
        headers={"Retry-After": "2"} if retryable else None,
    )


def request_id(request):
    return getattr(request.state, "request_id", str(uuid.uuid4()))


@app.middleware("http")
async def policy(request: Request, call_next):
    rid = str(uuid.uuid4())
    request.state.request_id = rid
    started = time.monotonic()
    try:
        if request.method == "POST" and request.url.path == "/api/v1/simulations":
            if request.headers.get("content-type", "").split(";")[0] != "application/json":
                response = fail("UNSUPPORTED_MEDIA_TYPE", "Use application/json.", rid, 415)
            else:
                response = await call_next(request)
        else:
            response = await call_next(request)
    except Exception:
        log.exception("Unhandled request failure id=%s", rid)
        response = fail("INTERNAL_ERROR", "The request could not be completed.", rid, 500)
    response.headers.update(
        {
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "X-Request-ID": request_id(request),
            "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        }
    )
    log.info(
        "request_id=%s path=%s status=%s latency_ms=%.1f",
        request_id(request),
        request.url.path,
        response.status_code,
        1000 * (time.monotonic() - started),
    )
    return response


@app.exception_handler(HTTPException)
async def http_error(request, exc):
    return fail("HTTP_ERROR", "Request method or resource unavailable.", request_id(request), exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error(request, exc):
    return fail("VALIDATION_ERROR", "Invalid request.", request_id(request), 422)


@app.get("/api/v1/health/live")
async def live():
    return {"status": "live"}


@app.get("/api/v1/health/ready")
async def ready():
    ParameterRegistry.model_validate(REGISTRY)
    if abs(scalar(2, 3, 5)["flux"]["value"] - 6) >= 1e-12:
        return fail("NOT_READY", "Numerical self-check failed.", str(uuid.uuid4()), 503, retryable=True)
    return {"status": "ready"}


@app.get("/api/v1/capabilities", response_model=Capabilities)
async def capabilities():
    value = load("examples/capabilities.json")
    value.update(application_version="0.1.0", commit="local-development")
    return value


@app.get("/api/v1/parameters", response_model=ParameterRegistry)
async def parameters():
    return REGISTRY


def reject_constant(value):
    raise ValueError("Nonfinite JSON number")


def no_duplicates(pairs):
    obj = {}
    for key, value in pairs:
        if key in obj:
            raise ValueError("Duplicate JSON key")
        obj[key] = value
    return obj


def quota(app, address):
    now = time.monotonic()
    rates = app.state.rates
    tokens, last = rates.pop(address, (10.0, now))
    tokens = min(10, tokens + now - last)
    rates[address] = (tokens - 1 if tokens >= 1 else tokens, now)
    while len(rates) > 10000:
        rates.popitem(last=False)
    return tokens >= 1


@app.post("/api/v1/simulations", response_model=SimulationResponse)
async def simulations(request: Request):
    rid = request_id(request)
    if not quota(request.app, request.client.host if request.client else "local"):
        return fail("RATE_LIMIT", "Simulation quota exceeded; retry shortly.", rid, 429, retryable=True)
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 1048576:
            return fail("PAYLOAD_TOO_LARGE", "Simulation requests are limited to 1 MiB.", rid, 413)
    try:
        obj = json.loads(body, parse_constant=reject_constant, object_pairs_hook=no_duplicates)
    except (ValueError, UnicodeDecodeError, RecursionError):
        return fail(
            "MALFORMED_JSON",
            "Use strict UTF-8 JSON without duplicate keys, excessive nesting or nonfinite numbers.",
            rid,
            400,
        )
    if isinstance(obj, dict):
        try:
            rid = str(uuid.UUID(obj.get("request_id", "")))
            request.state.request_id = rid
        except (ValueError, TypeError, AttributeError):
            pass
    errors = list(VALIDATOR.iter_errors(obj))
    if errors:
        issues = [
            {
                "path": "/" + "/".join(str(v) for v in e.absolute_path),
                "code": "SCHEMA_VIOLATION",
                "message": f"Field does not satisfy {e.validator}; check required values, allowed units and limits.",
            }
            for e in errors[:100]
        ]
        return fail("VALIDATION_ERROR", "Check the highlighted fields and units.", rid, 422, issues)
    try:
        scenario = ScenarioRequest.model_validate(obj)
    except ValidationError:
        return fail("VALIDATION_ERROR", "Values must have strict finite types.", rid, 422)
    try:
        result = await request.app.state.executor.run(scenario.model_dump())
        SimulationResponse.model_validate(result)
        return result
    except ValidationError:
        return fail("INTERNAL_ERROR", "The calculation produced an invalid response.", rid, 500)
    except ScienceError as exc:
        status = {
            "SATURATED": 503,
            "CALCULATION_TIMEOUT": 504,
            "WORKER_FAILURE": 500,
            "INTERNAL_ERROR": 500,
        }.get(exc.code, 422)
        return fail(
            exc.code,
            exc.message,
            rid,
            status,
            [{"path": exc.path, "code": exc.code, "message": exc.message}],
            status in (503, 504),
        )


# Components, response codes and nullable semantics are reviewed contract artifacts.
# Route/model drift is tested independently, rather than trusting generated metadata.
def reviewed_openapi():
    return CONTRACT


app.openapi = reviewed_openapi

import copy
import asyncio
import time
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from jsonschema import Draft202012Validator, FormatChecker
from cvd_studio.main import app, SCHEMA
from cvd_studio.api.models import ScenarioRequest, SimulationResponse
from cvd_studio.services.simulation import load, simulate, constraints, REGISTRY
from cvd_studio.services.executor import execute, BoundedExecutor
from cvd_studio.domain.errors import ScienceError

ROOT = Path(__file__).resolve().parents[3]


def validator(name):
    return Draft202012Validator(
        {"$ref": f"#/$defs/{name}", "$defs": SCHEMA["$defs"]}, format_checker=FormatChecker()
    )


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def scenario():
    return load("examples/scalar-request.synthetic.json")


def test_health_contract_and_registry(client):
    for path in ("health/live", "health/ready", "capabilities", "parameters"):
        response = client.get("/api/v1/" + path)
        assert response.status_code == 200, response.text
        assert response.headers["x-content-type-options"] == "nosniff"
    validator("Capabilities").validate(client.get("/api/v1/capabilities").json())
    registry = client.get("/api/v1/parameters").json()
    assert all(p["value"] is None for p in registry["parameters"])
    validator("ParameterRegistry").validate(registry)
    contract = load("contracts/openapi.json")
    assert client.get("/api/v1/openapi.json").json() == contract
    for path in contract["paths"]:
        assert any(r.path == path for r in app.routes), path
    for key in ("ScenarioRequest", "SimulationResponse"):
        model = ScenarioRequest if key == "ScenarioRequest" else SimulationResponse
        actual = model.model_json_schema()
        assert set(actual["required"]) == set(SCHEMA["$defs"][key]["required"])
        assert actual["additionalProperties"] is False


@pytest.mark.parametrize("fixture", ["scalar", "spatial", "zero-flux", "arrhenius-ideal-gas"])
def test_example_computation_and_response_schema(fixture):
    scenario = load("examples/" + fixture + "-request.synthetic.json")
    ScenarioRequest.model_validate(scenario)
    r = simulate(scenario)
    SimulationResponse.model_validate(r)
    validator("SimulationResponse").validate(r)
    if fixture != "arrhenius-ideal-gas":
        oracle = load("examples/" + fixture + "-response.synthetic.json")
        for key in ("ks", "hg", "Cg", "Cs", "keff", "flux", "growth", "growth_nm_min", "thickness"):
            if oracle["scalar"][key] is None:
                assert r["scalar"][key] is None
            else:
                assert r["scalar"][key]["value"] == pytest.approx(oracle["scalar"][key]["value"], rel=1e-12)
        if r["spatial"]:
            for key in ("mean", "population_sigma", "cv_percent", "half_range_percent"):
                assert r["spatial"]["metrics"][key] == pytest.approx(
                    oracle["spatial"]["metrics"][key], rel=1e-12
                )


def test_browser_api_vertical_flow(client, scenario):
    response = client.post("/api/v1/simulations", json=scenario)
    assert response.status_code == 200, response.text
    value = response.json()
    validator("SimulationResponse").validate(value)
    assert value["request_id"] == scenario["request_id"]
    assert value["scalar"]["flux"]["value"] == pytest.approx(6)
    assert all(c["status"] == "unknown" for c in value["constraints"])
    assert value["runtime"]["fixture_only"] is False


@pytest.mark.parametrize(
    "change",
    [
        "unknown",
        "numeric_string",
        "boolean",
        "negative",
        "zero_hg",
        "temperature",
        "unit",
        "version",
        "registry",
        "literature",
        "beta",
        "grid",
        "edge",
        "full_disk",
    ],
)
def test_strict_domain_failures(client, scenario, change):
    if change == "unknown":
        scenario["unexpected"] = 1
    if change == "numeric_string":
        scenario["temperature"]["value"] = "600"
    if change == "boolean":
        scenario["temperature"]["value"] = True
    if change == "negative":
        scenario["concentration"]["Cg"]["value"] = -1
    if change == "zero_hg":
        scenario["mass_transfer_coefficient"]["value"] = 0
    if change == "temperature":
        scenario["temperature"]["value"] = 599
    if change == "unit":
        scenario["kinetics"]["ks"]["unit"] = "kg"
    if change == "version":
        scenario["schema_version"] = "2.0.0"
    if change == "registry":
        scenario["registry_snapshot"]["sha256"] = "0" * 64
    if change == "literature":
        scenario.update(
            basis="literature",
            material="polysilicon",
            registry_snapshot={k: REGISTRY[k] for k in ("id", "version", "sha256")},
        )
    if change == "beta":
        scenario["growth_conversion"]["value"] = 0
    if change in ("grid", "edge", "full_disk"):
        scenario["spatial"] = load("examples/spatial-request.synthetic.json")["spatial"]
        if change == "grid":
            scenario["spatial"]["nr"] = 257
        if change == "edge":
            scenario["spatial"]["edge_exclusion"] = scenario["spatial"]["radius"]
        if change == "full_disk":
            scenario["spatial"]["delta_T_edge_K"] = -200
    response = client.post("/api/v1/simulations", json=scenario)
    assert response.status_code == 422, response.text
    validator("ErrorEnvelope").validate(response.json())
    assert response.json()["error"]["request_id"] == scenario["request_id"]


@pytest.mark.parametrize("body", [b"{", b'{"x":1,"x":2}', b'{"x":NaN}', b'{"x":Infinity}', b"\xff"])
def test_malformed(client, body):
    r = client.post("/api/v1/simulations", content=body, headers={"Content-Type": "application/json"})
    assert r.status_code == 400
    validator("ErrorEnvelope").validate(r.json())


def test_media_size_and_method(client):
    assert client.post("/api/v1/simulations", content="{}").status_code == 415
    r = client.post(
        "/api/v1/simulations", content="x" * 1048577, headers={"Content-Type": "application/json"}
    )
    assert r.status_code == 413
    assert client.delete("/api/v1/simulations").status_code == 405
    assert client.get("/missing").status_code == 404


def sleeper(connection, request):
    time.sleep(10)


def test_process_deadline_kills_worker():
    started = time.monotonic()
    with pytest.raises(ScienceError, match="deadline"):
        execute({}, timeout=0.15, target=sleeper)
    assert time.monotonic() - started < 2


def test_rate_limit(client, scenario):
    for _ in range(10):
        client.post("/api/v1/simulations", json={})
    response = client.post("/api/v1/simulations", json=scenario)
    assert response.status_code == 429
    assert response.headers["retry-after"] == "2"


def test_constraint_states(scenario):
    n = copy.deepcopy(scenario)
    n["material"] = "polysilicon"
    registry = {
        "constraints": [
            {
                "id": "test",
                "material": "polysilicon",
                "kind": "pressure",
                "status": "reviewed",
                "min": 1,
                "max": 10,
            }
        ]
    }
    assert constraints(n, registry)[0]["status"] == "not_provided"
    n["process_pressure"] = {"value": 5, "unit": "Pa"}
    assert constraints(n, registry)[0]["status"] == "within_declared_bounds"
    n["process_pressure"]["value"] = 11
    with pytest.raises(ScienceError):
        constraints(n, registry)


def test_executor_saturation():
    executor = BoundedExecutor(active=1, queued=0)
    executor.inflight = 1
    with pytest.raises(ScienceError, match="capacity"):
        asyncio.run(executor.run({}))


@pytest.mark.parametrize(
    "code,status", [("SATURATED", 503), ("CALCULATION_TIMEOUT", 504), ("WORKER_FAILURE", 500)]
)
def test_executor_error_envelopes(client, scenario, monkeypatch, code, status):
    async def failure(_):
        raise ScienceError(code, "Controlled test failure.")

    monkeypatch.setattr(client.app.state.executor, "run", failure)
    response = client.post("/api/v1/simulations", json=scenario)
    assert response.status_code == status
    validator("ErrorEnvelope").validate(response.json())
    assert response.json()["error"]["request_id"] == scenario["request_id"]


def test_invalid_worker_response_is_server_failure(client, scenario, monkeypatch):
    async def invalid(_):
        return {}

    monkeypatch.setattr(client.app.state.executor, "run", invalid)
    response = client.post("/api/v1/simulations", json=scenario)
    assert response.status_code == 500
    validator("ErrorEnvelope").validate(response.json())

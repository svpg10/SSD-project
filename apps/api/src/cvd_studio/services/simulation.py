import copy
from datetime import datetime, timezone
import hashlib
from importlib.metadata import version
import json
import os
from pathlib import Path
import platform
import uuid
import numpy as np
from cvd_studio.domain.core import scalar, kinetics, radial, quantity, product, R
from cvd_studio.domain.errors import require
from cvd_studio.domain.units import normalize

ROOT = Path(__file__).resolve().parents[5]
SPEC = ROOT / "specs/cvd-studio"
MODEL = "cvd-resistance-v1"


def load(path):
    return json.loads((SPEC / path).read_text(encoding="utf-8"))


def digest(obj):
    return hashlib.sha256(
        json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode()
    ).hexdigest()


REGISTRY = load("registry/parameters.json")
SYNTHETIC = load("examples/synthetic-registry.json")
for _registry in (REGISTRY, SYNTHETIC):
    require(
        digest({key: value for key, value in _registry.items() if key != "sha256"}) == _registry["sha256"],
        "REGISTRY_INTEGRITY",
        "Registry content hash mismatch.",
    )


def snapshot_ref(registry):
    return {k: registry[k] for k in ("id", "version", "sha256")}


def constraints(n, registry):
    out = []
    for kind in ("pressure", "flow"):
        record = next(
            (c for c in registry["constraints"] if c["material"] == n["material"] and c["kind"] == kind), None
        )
        status = "unknown"
        reason = f"Numeric {kind} limits are not supplied in PS-64."
        observation = (
            n["flow"]
            if kind == "flow"
            else (
                n["concentration"]["total_pressure"]
                if n["concentration"]["mode"] == "ideal_gas"
                else n["process_pressure"]
            )
        )
        if (
            record
            and record["status"] == "reviewed"
            and (record["min"] is not None or record["max"] is not None)
        ):
            if observation is None:
                status = "not_provided"
                reason = "Observation not supplied."
            elif kind == "flow" and (
                observation["standard_temperature"]["value"] != record["standard_temperature_K"]
                or observation["standard_pressure"]["value"] != record["standard_pressure_Pa"]
            ):
                reason = "Flow standard conditions are not compatible."
            else:
                value = observation["value"]
                within = (record["min"] is None or value >= record["min"]) and (
                    record["max"] is None or value <= record["max"]
                )
                status = "within_declared_bounds" if within else "outside_declared_bounds"
                reason = "Compared with reviewed declared applicability; does not certify safety."
                require(within, "OUTSIDE_DECLARED_CONSTRAINT", reason, "/" + kind)
        out.append(
            {
                "kind": kind,
                "status": status,
                "constraint_id": None if record is None else record["id"],
                "reason": reason,
            }
        )
    return out


def simulate(request):
    original = copy.deepcopy(request)
    n = normalize(request)
    reg = SYNTHETIC if n["basis"] == "synthetic" else REGISTRY
    require(
        n["registry_snapshot"] == snapshot_ref(reg),
        "REGISTRY_MISMATCH",
        "Use the currently advertised registry snapshot.",
        "/registry_snapshot",
    )
    require(
        n["basis"] != "literature",
        "UNREVIEWED_PARAMETER",
        "No reviewed material coefficients exist in the trusted registry.",
        "/basis",
    )
    require(
        (n["basis"] == "synthetic") == (n["material"] == "synthetic"),
        "INVALID_PROVENANCE",
        "Synthetic basis must use synthetic context.",
        "/material",
    )
    t = n["temperature"]["value"]
    require(
        873.15 <= t <= 1023.15,
        "OUTSIDE_STUDY_WINDOW",
        "Substrate temperature must be 600–750°C.",
        "/temperature",
    )
    k = n["kinetics"]
    hg = n["mass_transfer_coefficient"]["value"]
    c = n["concentration"]
    require(
        c["mode"] != "ideal_gas" or n["process_pressure"] is None,
        "AMBIGUOUS_PRESSURE",
        "Ideal-gas pressure is authoritative.",
        "/process_pressure",
    )
    cg = (
        c["Cg"]["value"]
        if c["mode"] == "direct"
        else product(c["mole_fraction"], c["total_pressure"]["value"]) / R / c["gas_temperature"]["value"]
    )
    require(
        cg != 0 or c["mode"] == "direct" or c["mole_fraction"] == 0,
        "NUMERIC_UNDERFLOW",
        "Ideal-gas concentration underflow.",
        "/concentration",
    )
    beta = None if n["growth_conversion"] is None else n["growth_conversion"]["value"]
    duration = None if n["duration"] is None else n["duration"]["value"]
    result = scalar(kinetics(k, t), hg, cg, beta, duration)
    warnings = []

    def warn(code, message, path=""):
        warnings.append({"code": code, "message": message, "path": path})

    warn(
        "SYNTHETIC_DATA" if n["basis"] == "synthetic" else "USER_SUPPLIED_UNVERIFIED",
        "Synthetic numerical demonstration; not material or process data."
        if n["basis"] == "synthetic"
        else "User supplied, unverified; experimental validation pending.",
    )
    if beta is None:
        warn(
            "GROWTH_CONVERSION_MISSING",
            "Growth unavailable: add explicit positive beta.",
            "/growth_conversion",
        )
    if n["material"] == "silicon_nitride":
        warn(
            "EFFECTIVE_SINGLE_PRECURSOR",
            "Single limiting-precursor first-order simplification; multireactant kinetics unresolved.",
        )
    if k["mode"] == "direct":
        warn(
            "DIRECT_KS_TEMPERATURE_INDEPENDENT",
            "Direct ks is temperature independent; substrate temperature does not change flux.",
            "/kinetics",
        )
    warn("FLOW_METADATA_ONLY", "Flow does not determine hg or Cg in this model.", "/flow")
    evaluated = constraints(n, reg)
    warn("PROCESS_LIMITS_UNKNOWN", "Pressure/flow compliance is unknown where sourced limits are absent.")
    sweep = None
    if n["sweep"]:
        s = n["sweep"]
        start = s["start"]["value"]
        stop = s["stop"]["value"]
        require(
            873.15 <= start < stop <= 1023.15,
            "OUTSIDE_STUDY_WINDOW",
            "Sweep must increase within 600–750°C.",
            "/sweep",
        )
        sweep = {
            "gas_temperature_policy": "fixed",
            "points": [
                {"temperature": quantity(ts, "K"), "result": scalar(kinetics(k, ts), hg, cg, beta, duration)}
                for ts in np.linspace(start, stop, s["count"])
            ],
        }
    spatial = None if n["spatial"] is None else radial(n["spatial"], t, k, hg, cg, beta, duration)
    if spatial:
        warn("PRESCRIBED_LOCAL_FIELDS", spatial["disclosure"], "/spatial")
        if spatial["metrics"]["mean"] == 0:
            warn(
                "ZERO_MEAN_UNIFORMITY_UNDEFINED", "CV and half-range are undefined for zero mean.", "/spatial"
            )
    hash_inputs = {key: value for key, value in n.items() if key not in ("request_id", "notes")}
    lock = ROOT / "uv.lock"
    return {
        "schema_version": "1.0.0",
        "request_id": n["request_id"],
        "run_id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "model_id": MODEL,
        "canonicalization_version": "python-json-v1",
        "input_sha256": digest(
            {"normalized_inputs": hash_inputs, "model_id": MODEL, "registry_snapshot": n["registry_snapshot"]}
        ),
        "original_request": original,
        "normalized_inputs": n,
        "registry_snapshot": copy.deepcopy(reg),
        "runtime": {
            "application_version": "0.1.0",
            "commit": os.getenv("CVD_COMMIT", "local-development"),
            "python": platform.python_version(),
            **{name: version(name) for name in ("numpy", "scipy", "pint")},
            "lockfile_sha256": hashlib.sha256(lock.read_bytes()).hexdigest() if lock.exists() else None,
            "fixture_only": False,
        },
        "scalar": result,
        "sweep": sweep,
        "spatial": spatial,
        "warnings": warnings,
        "constraints": evaluated,
    }

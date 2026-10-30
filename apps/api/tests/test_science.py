"""Independent mathematical checks. All numbers here are synthetic, never material data."""

import copy
import json
import math
from pathlib import Path

import numpy as np
import pytest
from scipy.integrate import quad

from cvd_studio.domain.core import scalar, kinetics
from cvd_studio.domain.units import normalize
from cvd_studio.services.simulation import simulate
from cvd_studio.domain.errors import ScienceError

ROOT = Path(__file__).resolve().parents[3]


@pytest.fixture
def scenario():
    return json.loads((ROOT / "specs/cvd-studio/examples/scalar-request.synthetic.json").read_text())


def test_independent_scalar_oracle():
    r = scalar(2, 3, 5, 0.01, 2)
    for k, v in {
        "keff": 1.2,
        "Cs": 3,
        "flux": 6,
        "growth": 0.06,
        "growth_nm_min": 3.6e9,
        "thickness": 0.12,
    }.items():
        assert r[k]["value"] == pytest.approx(v, rel=1e-12)
    assert r["Da"] == pytest.approx(2 / 3)
    assert r["surface_resistance_fraction"] == pytest.approx(0.6)
    assert r["gas_resistance_fraction"] == pytest.approx(0.4)
    assert r["regime"] == "mixed"


@pytest.mark.parametrize("ks,hg", [(1e-8, 1), (1, 1e-8), (1e200, 1e200), (2, 3)])
def test_bounds_symmetry_and_limits(ks, hg):
    r = scalar(ks, hg, 5, None, None)
    swapped = scalar(hg, ks, 5, None, None)
    assert r["flux"] == swapped["flux"]
    assert r["flux"]["value"] <= min(ks, hg) * 5
    assert 0 <= r["Cs"]["value"] <= 5
    assert r["surface_resistance_fraction"] + r["gas_resistance_fraction"] == pytest.approx(1)
    if min(ks, hg) / max(ks, hg) == 1e-8:
        assert r["flux"]["value"] == pytest.approx(min(ks, hg) * 5, rel=1e-7)


@pytest.mark.parametrize(
    "da,regime",
    [(0.099, "reaction_limited"), (0.1, "mixed"), (10, "mixed"), (10.01, "mass_transfer_limited")],
)
def test_regime_boundaries(da, regime):
    assert scalar(da, 1, 1, None, None)["regime"] == regime


def test_units_and_hash_equivalence(scenario):
    n = normalize(scenario)
    assert n["temperature"]["value"] == pytest.approx(873.15)
    alternate = copy.deepcopy(scenario)
    alternate["temperature"] = {"value": 873.15, "unit": "K"}
    alternate["kinetics"]["ks"] = {"value": 200, "unit": "cm/s"}
    alternate["notes"] = "different notes"
    assert simulate(scenario)["input_sha256"] == simulate(alternate)["input_sha256"]


def test_arrhenius_and_fixed_gas(scenario):
    assert kinetics({"mode": "arrhenius", "A": {"value": 2}, "Ea": {"value": 0}}, 900) == 2
    scenario["kinetics"] = {
        "mode": "arrhenius",
        "A": {"value": 2, "unit": "m/s"},
        "Ea": {"value": 50, "unit": "kJ/mol"},
    }
    scenario["concentration"] = {
        "mode": "ideal_gas",
        "total_pressure": {"value": 100, "unit": "Pa"},
        "gas_temperature": {"value": 500, "unit": "K"},
        "mole_fraction": 0.2,
    }
    scenario["sweep"] = {
        "start": {"value": 600, "unit": "degC"},
        "stop": {"value": 750, "unit": "degC"},
        "count": 151,
        "gas_temperature_policy": "fixed",
    }
    r = simulate(scenario)
    points = r["sweep"]["points"]
    assert len(points) == 151
    assert points[-1]["temperature"]["value"] == pytest.approx(1023.15)
    assert all(
        a["result"]["flux"]["value"] < b["result"]["flux"]["value"] for a, b in zip(points, points[1:])
    )
    assert len({p["result"]["Cg"]["value"] for p in points}) == 1


def test_flat_sweep_and_missing_conversion(scenario):
    scenario.update(
        growth_conversion=None,
        duration=None,
        sweep={
            "start": {"value": 600, "unit": "degC"},
            "stop": {"value": 750, "unit": "degC"},
            "count": 2,
            "gas_temperature_policy": "fixed",
        },
    )
    r = simulate(scenario)
    assert r["scalar"]["growth"] is None and r["scalar"]["thickness"] is None
    assert r["sweep"]["points"][0]["result"] == r["sweep"]["points"][1]["result"]
    assert "DIRECT_KS_TEMPERATURE_INDEPENDENT" in [w["code"] for w in r["warnings"]]


def spatial_config(nr=64):
    return {
        "model_id": "prescribed-radial-v1",
        "radius": {"value": 0.1, "unit": "m"},
        "edge_exclusion": {"value": 0.01, "unit": "m"},
        "nr": nr,
        "ntheta": 64,
        "delta_T_edge_K": 0,
        "concentration_edge_fraction": 0.2,
        "transport_edge_fraction": 0,
    }


def test_area_quadrature_oracle(scenario):
    scenario["spatial"] = spatial_config()
    r = simulate(scenario)["spatial"]
    a = 0.9**2
    assert r["metrics"]["mean"] == pytest.approx(6 * (1 + 0.2 * a / 2), rel=1e-12)
    exact_sigma = abs(6 * 0.2 * a) / math.sqrt(12)
    assert r["metrics"]["population_sigma"] == pytest.approx(exact_sigma, rel=0.0002)
    edges = np.array(r["radial_cell_edges_m"])
    assert np.diff(edges**2) * np.pi == pytest.approx(np.full(64, np.pi * 0.09**2 / 64))
    assert sum(p["area_weight"] for p in r["points"]) == pytest.approx(1)
    scenario["spatial"]["ntheta"] = 256
    assert simulate(scenario)["spatial"]["metrics"] == r["metrics"]


def test_zero_uniform_and_zero_mean(scenario):
    scenario["spatial"] = spatial_config()
    scenario["spatial"]["concentration_edge_fraction"] = 0
    r = simulate(scenario)["spatial"]["metrics"]
    assert r["cv_percent"] == 0 and r["half_range_percent"] == 0
    scenario["concentration"]["Cg"]["value"] = 0
    r = simulate(scenario)
    assert r["spatial"]["metrics"]["cv_percent"] is None
    assert r["spatial"]["metrics"]["half_range_percent"] is None
    assert r["scalar"]["flux"]["value"] == 0


def test_nonlinear_scipy_reference_and_convergence(scenario):
    scenario["kinetics"] = {
        "mode": "arrhenius",
        "A": {"value": 2, "unit": "m/s"},
        "Ea": {"value": 50000, "unit": "J/mol"},
    }
    scenario["spatial"] = spatial_config()
    scenario["spatial"]["delta_T_edge_K"] = 40
    means = []
    for n in (64, 128, 256):
        scenario["spatial"]["nr"] = n
        means.append(simulate(scenario)["spatial"]["metrics"]["mean"])

    def independent(u):
        ts = 873.15 + 40 * 0.81 * u
        ks = 2 * math.exp(-50000 / (8.31446261815324 * ts))
        return 1 / (1 / ks + 1 / 3) * 5 * (1 + 0.2 * 0.81 * u)

    oracle = quad(independent, 0, 1, epsabs=1e-14)[0]
    assert means[-1] == pytest.approx(oracle, rel=1e-6)
    assert abs(means[2] - means[1]) / means[2] < 1e-4


@pytest.mark.parametrize("change", ["edge", "temperature", "sweep", "registry", "literature"])
def test_semantic_failures(scenario, change):
    scenario["spatial"] = spatial_config()
    if change == "edge":
        scenario["spatial"]["edge_exclusion"]["value"] = 0.1
    if change == "temperature":
        scenario["spatial"]["delta_T_edge_K"] = -1
    if change == "sweep":
        scenario["sweep"] = {
            "start": {"value": 750, "unit": "degC"},
            "stop": {"value": 600, "unit": "degC"},
            "count": 2,
            "gas_temperature_policy": "fixed",
        }
    if change == "registry":
        scenario["registry_snapshot"]["sha256"] = "0" * 64
    if change == "literature":
        scenario.update(basis="literature", material="polysilicon")
    with pytest.raises(ScienceError):
        simulate(scenario)


@pytest.mark.parametrize(
    "args",
    [(1e308, 1e308, 1e308, None, None), (1e-300, 1e300, 1, None, None), (1e-300, 1e-300, 1e-300, None, None)],
)
def test_extreme_values_fail_explicitly(args):
    with pytest.raises((ScienceError, ValueError)):
        scalar(*args)

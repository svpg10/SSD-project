"""Pure SI numerical domain. No HTTP or persistence dependencies."""

import math
import numpy as np
from .errors import require

R = 8.31446261815324
REGIMES = ("reaction_limited", "mixed", "mass_transfer_limited")


def quantity(value, unit):
    require(math.isfinite(value), "NONFINITE_VALUE", "Numerical result exceeds finite range.")
    return {"value": float(value), "unit": unit}


def product(a, b):
    value = a * b
    require(math.isfinite(value), "NUMERIC_OVERFLOW", "Numerical multiplication overflow.")
    require(value != 0 or a == 0 or b == 0, "NUMERIC_UNDERFLOW", "Numerical multiplication underflow.")
    return value


def kinetics(k, t):
    if k["mode"] == "direct":
        return k["ks"]["value"]
    value = product(k["A"]["value"], math.exp(-k["Ea"]["value"] / R / t))
    require(value > 0, "NUMERIC_UNDERFLOW", "Arrhenius coefficient underflow.", "/kinetics")
    return value


def scalar(ks, hg, cg, beta=None, duration=None):
    require(
        beta is None or math.isfinite(beta) and beta > 0,
        "INVALID_CONVERSION",
        "Beta must be positive and finite.",
    )
    require(
        duration is None or math.isfinite(duration) and duration >= 0,
        "INVALID_DURATION",
        "Duration must be nonnegative and finite.",
    )
    require(
        all(math.isfinite(v) for v in (ks, hg, cg)) and ks > 0 and hg > 0 and cg >= 0,
        "INVALID_COEFFICIENT",
        "Expected finite positive coefficients and nonnegative concentration.",
    )
    low, high = min(ks, hg), max(ks, hg)
    ratio = low / high
    require(ratio > 0, "NUMERIC_UNDERFLOW", "Coefficient ratio underflow.")
    keff = low / (1 + ratio)
    da = ks / hg
    require(math.isfinite(da) and da > 0, "NUMERIC_RANGE", "Da is outside the finite response range.")
    sf = (1 / (1 + ratio)) if ks <= hg else ratio / (1 + ratio)
    gf = ratio / (1 + ratio) if ks <= hg else 1 / (1 + ratio)
    flux = product(keff, cg)
    cs = product(sf, cg)
    growth = None if beta is None else product(beta, flux)
    thickness = None if growth is None or duration is None else product(growth, duration)
    regime = "reaction_limited" if da < 0.1 else "mass_transfer_limited" if da > 10 else "mixed"
    return {
        "ks": quantity(ks, "m/s"),
        "hg": quantity(hg, "m/s"),
        "Cg": quantity(cg, "mol/m^3"),
        "Cs": quantity(cs, "mol/m^3"),
        "keff": quantity(keff, "m/s"),
        "flux": quantity(flux, "mol/(m^2*s)"),
        "Da": da,
        "surface_resistance_fraction": sf,
        "gas_resistance_fraction": gf,
        "regime": regime,
        "growth": None if growth is None else quantity(growth, "m/s"),
        "growth_nm_min": None if growth is None else quantity(product(growth, 6e10), "nm/min"),
        "thickness": None if thickness is None else quantity(thickness, "m"),
    }


def radial(config, t, k, hg, cg, beta, duration):
    radius = config["radius"]["value"]
    edge = config["edge_exclusion"]["value"]
    require(
        0 <= edge < radius,
        "INVALID_LOCAL_FIELD",
        "Edge exclusion must be smaller than radius.",
        "/spatial/edge_exclusion",
    )
    dt = config["delta_T_edge_K"]
    ac = config["concentration_edge_fraction"]
    ah = config["transport_edge_fraction"]
    require(
        873.15 <= t + dt <= 1023.15,
        "OUTSIDE_STUDY_WINDOW",
        "Full physical-edge temperature must be 600–750°C.",
        "/spatial/delta_T_edge_K",
    )
    require(
        1 + ac >= 0 and 1 + ah > 0,
        "INVALID_LOCAL_FIELD",
        "Full disk fields require nonnegative Cg and positive hg.",
        "/spatial",
    )
    nr = config["nr"]
    nt = config["ntheta"]
    ru = radius - edge
    require(nr * nt <= 65536, "WORKLOAD_LIMIT", "Grid exceeds 65,536 cells.", "/spatial")
    edges = ru * np.sqrt(np.arange(nr + 1, dtype=float) / nr)
    rho = ru * np.sqrt((np.arange(nr, dtype=float) + 0.5) / nr)
    points = []
    for r in rho:
        q = (float(r) / radius) ** 2
        local_t = t + dt * q
        require(
            873.15 <= local_t <= 1023.15,
            "INVALID_LOCAL_FIELD",
            "Local temperature outside window.",
            "/spatial",
        )
        points.append(
            {
                "rho": quantity(r, "m"),
                "area_weight": 1 / nr,
                "temperature": quantity(local_t, "K"),
                "result": scalar(
                    kinetics(k, local_t), product(hg, 1 + ah * q), product(cg, 1 + ac * q), beta, duration
                ),
            }
        )
    z = np.array([p["result"]["flux"]["value"] for p in points])
    peak = float(np.max(z))
    scaled = z / peak if peak else z
    sm = float(np.mean(scaled))
    mean = product(peak, sm)
    sigma = product(peak, float(np.sqrt(np.mean((scaled - sm) ** 2))))
    cv = None if mean == 0 else 100 * (sigma / mean)
    half = None if mean == 0 else 50 * ((float(np.max(z)) - float(np.min(z))) / mean)
    metrics = {
        "observable": "flux",
        "unit": "mol/(m^2*s)",
        "mean": mean,
        "minimum_sampled": float(np.min(z)),
        "maximum_sampled": peak,
        "population_sigma": sigma,
        "cv_percent": cv,
        "half_range_percent": half,
    }
    require(
        all(v is None or not isinstance(v, float) or math.isfinite(v) for v in metrics.values()),
        "NUMERIC_OVERFLOW",
        "Uniformity statistics exceed finite range.",
        "/spatial",
    )
    return {
        "model_id": "prescribed-radial-v1",
        "nr": nr,
        "ntheta": nt,
        "usable_radius": quantity(ru, "m"),
        "usable_area": quantity(product(math.pi, product(ru, ru)), "m^2"),
        "radial_cell_edges_m": edges.tolist(),
        "points": points,
        "metrics": metrics,
        "regime_area_fractions": {
            name: sum(p["result"]["regime"] == name for p in points) / nr for name in REGIMES
        },
        "disclosure": "Prescribed radial fields; no flow or mass-balance solution. Equal-area cell centers; angular sectors are rendering only. Extrema are sampled.",
    }

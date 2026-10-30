"""Allowlisted Pint boundary conversion; numerical domain receives SI floats only."""

import math
from pint import UnitRegistry
from .errors import require

UREG = UnitRegistry()
CANONICAL = {
    "degC": "K",
    "K": "K",
    "cm/s": "m/s",
    "m/s": "m/s",
    "mol/m^3": "mol/m^3",
    "Torr": "Pa",
    "Pa": "Pa",
    "kJ/mol": "J/mol",
    "J/mol": "J/mol",
    "m^3/mol": "m^3/mol",
    "min": "s",
    "s": "s",
    "mm": "m",
    "m": "m",
}


def normalize(value, path=""):
    if isinstance(value, dict):
        if set(value) == {"value", "unit"}:
            unit = value["unit"]
            require(unit in CANONICAL, "INCOMPATIBLE_UNIT", "Unsupported quantity unit.", path)
            result = UREG.Quantity(value["value"], unit).to(CANONICAL[unit]).magnitude
            require(math.isfinite(result), "NONFINITE_VALUE", "Quantity conversion is not finite.", path)
            require(
                result != 0 or value["value"] == 0 or unit == "degC",
                "NUMERIC_UNDERFLOW",
                "Unit conversion underflow.",
                path,
            )
            return {"value": 0.0 if result == 0 else float(result), "unit": CANONICAL[unit]}
        return {k: normalize(v, path + "/" + k) for k, v in value.items()}
    if isinstance(value, list):
        return [normalize(v, path + "/" + str(i)) for i, v in enumerate(value)]
    if isinstance(value, float) and value == 0:
        return 0.0
    return value

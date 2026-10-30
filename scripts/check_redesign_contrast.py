"""Check text, primary actions and input borders for the selected visual system."""

import json
from pathlib import Path


def luminance(value):
    parts = [int(value[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [p / 12.92 if p <= 0.04045 else ((p + 0.055) / 1.055) ** 2.4 for p in parts]
    return sum(c * p for c, p in zip((0.2126, 0.7152, 0.0722), linear))


pairs = [
    ("light text / ground", "#202725", "#f5f4f0", 4.5),
    ("light secondary / ground", "#5d645e", "#f5f4f0", 4.5),
    ("light secondary / raised", "#5d645e", "#eeece5", 4.5),
    ("light accent / surface", "#9b431f", "#fffefa", 4.5),
    ("light primary action", "#fffdfa", "#9b431f", 4.5),
    ("light input border", "#858b80", "#fffefa", 3),
    ("dark text / ground", "#f1f1e9", "#171d1b", 4.5),
    ("dark secondary / raised", "#bdc5ba", "#2d3630", 4.5),
    ("dark accent / surface", "#efac82", "#212925", 4.5),
    ("dark primary action", "#302014", "#efac82", 4.5),
    ("dark input border", "#7f8c7a", "#212925", 3),
    ("sidebar secondary", "#b4c0af", "#222c26", 4.5),
    ("sidebar active", "#263a29", "#e8ecdf", 4.5),
]
results = []
for label, foreground, background, minimum in pairs:
    first, second = sorted((luminance(foreground), luminance(background)))
    ratio = (second + 0.05) / (first + 0.05)
    results.append({"pair": label, "ratio": round(ratio, 2), "minimum": minimum, "pass": ratio >= minimum})
Path("outputs/redesign-contrast.json").write_text(json.dumps(results, indent=2) + "\n")
assert all(result["pass"] for result in results), results
print(f"{len(results)} text/action/border contrast pairs passed.")

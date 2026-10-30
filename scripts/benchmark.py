"""Local numerical-service timings, explicitly not the specified staging/API benchmark."""

import copy
import json
import os
import platform
from pathlib import Path
import statistics
import time
from cvd_studio.services.simulation import load, simulate


def main():
    scalar = load("examples/scalar-request.synthetic.json")
    sweep = copy.deepcopy(scalar)
    sweep["sweep"] = {
        "start": {"value": 600, "unit": "degC"},
        "stop": {"value": 750, "unit": "degC"},
        "count": 151,
        "gas_temperature_policy": "fixed",
    }
    spatial = load("examples/spatial-request.synthetic.json")
    spatial["spatial"].update(nr=128, ntheta=128)
    report = {
        "environment": {
            "platform": platform.platform(),
            "python": platform.python_version(),
            "logical_cpus": os.cpu_count(),
        },
        "scope": "100 serial warm direct service calls; excludes HTTP, validation, process startup and queue waiting. Not a 2-vCPU/4-GiB staging certification.",
        "results": {},
    }
    for name, request in [("scalar", scalar), ("sweep_151", sweep), ("radial_128x128", spatial)]:
        simulate(request)
        samples = []
        for _ in range(100):
            start = time.perf_counter()
            simulate(request)
            samples.append(1000 * (time.perf_counter() - start))
        report["results"][name] = {
            "requests": 100,
            "concurrency": 1,
            "median_ms": statistics.median(samples),
            "p95_ms": sorted(samples)[94],
            "maximum_ms": max(samples),
        }
    Path("outputs/local-benchmark.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

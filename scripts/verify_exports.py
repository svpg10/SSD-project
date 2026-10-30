"""Independent check of the files downloaded in the browser workflow."""

import csv
import io
import json
import math
from pathlib import Path
import zipfile

p = json.loads(Path("outputs/qa/browser-export.synthetic.json").read_text(encoding="utf-8"))
with zipfile.ZipFile("outputs/qa/browser-csv.synthetic.zip") as archive:
    metadata = json.loads(archive.read("metadata.json"))
    rows = list(csv.DictReader(io.StringIO(archive.read("scalar.csv").decode())))
    assert metadata["input_sha256"] == p["snapshots"][0]["input_sha256"]
    assert math.isclose(float(rows[0]["flux_mol_m2_s"]), 6, rel_tol=1e-12)
    assert metadata["original_request"]["basis"] == "synthetic"
    assert metadata["original_request"]["kinetics"]["ks"]["value"] == 2
    assert "no flow or mass-balance solution" in metadata["disclosure"]
    print("Browser JSON and CSV ZIP independently verified:", archive.namelist())

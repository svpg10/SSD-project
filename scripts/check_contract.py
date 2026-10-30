"""Read-only manifest + contract/example drift check, no network resolution."""

from pathlib import Path
import hashlib
import json
import subprocess
import sys
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "specs/cvd-studio"
schema = json.loads((SPEC / "schemas/cvd-studio.schema.json").read_text())
manifest = json.loads((SPEC / "MANIFEST.json").read_text())
archive = ROOT / "reference/CVD-Studio-Documentation.zip"
assert (
    hashlib.sha256(archive.read_bytes()).hexdigest() == Path(str(archive) + ".sha256").read_text().split()[0]
)
for item in manifest["files"]:
    data = (SPEC / item["path"]).read_bytes()
    assert len(data) == item["bytes"] and hashlib.sha256(data).hexdigest() == item["sha256"], item["path"]
for path in (SPEC / "examples").glob("*.json"):
    name = (
        "SimulationResponse"
        if "-response." in path.name
        else "ScenarioRequest"
        if "-request." in path.name
        else {
            "capabilities.json": "Capabilities",
            "synthetic-registry.json": "ParameterRegistry",
            "project-export.synthetic.json": "ProjectExport",
            "validation-error.json": "ErrorEnvelope",
        }.get(path.name)
    )
    if name:
        Draft202012Validator(
            {"$defs": schema["$defs"], "$ref": f"#/$defs/{name}"}, format_checker=FormatChecker()
        ).validate(json.loads(path.read_text()))
target = ROOT / "apps/api/src/cvd_studio/api/models.py"
before = target.read_bytes()
subprocess.run([sys.executable, str(ROOT / "scripts/generate_models.py")], check=True)
assert before == target.read_bytes(), "Pydantic model drift"
print("Manifest, contract fixtures and generated Pydantic models verified.")

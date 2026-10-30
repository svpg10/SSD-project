"""Limited high-confidence source scan. Not an entropy/history scanner or certification."""

from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
patterns = {
    "private_key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "aws_access_key": re.compile(r"\bAKIA[A-Z0-9]{16}\b"),
    "github_token": re.compile(r"\bgh[pousr]_[A-Za-z0-9]{36,}\b"),
}
findings = []
scanned = 0
for base in ("apps/api/src", "apps/web/src", "scripts", "infra"):
    for path in (ROOT / base).rglob("*"):
        if not path.is_file() or "__pycache__" in path.parts:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        scanned += 1
        for label, pattern in patterns.items():
            for match in pattern.finditer(text):
                findings.append(
                    {
                        "path": str(path.relative_to(ROOT)),
                        "line": text[: match.start()].count("\n") + 1,
                        "kind": label,
                    }
                )
report = {
    "scope": "High-confidence patterns in source/config; no git-history or entropy analysis. Not equivalent to a comprehensive secrets audit.",
    "files_scanned": scanned,
    "findings": findings,
}
(ROOT / "outputs/security-source-scan.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
raise SystemExit(bool(findings))

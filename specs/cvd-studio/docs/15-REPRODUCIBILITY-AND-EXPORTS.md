# Reproducibility and exports

## Immutable snapshot

Keep original request, normalized SI inputs, server result, input hash/canonicalization version, model/schema/registry snapshot, runtime version fingerprint, warnings and constraint evaluation. run_id and timestamp identify an execution, not different physics. Repeated normalized inputs under the same model/registry yield the same scientific arrays within documented numerical tolerances; execution metadata can differ.

## Formats

- **Project JSON:** `ProjectExport` schema, project_id/name, exported_at, application version and ≤4 complete result snapshots. Include original inputs and registry snapshot for each run. No credentials or unrelated local storage. Reimport validates and recomputes before asserting reproducibility.
- **CSV:** separate scalar, sweep and radial files; first row contains unit-bearing column names. Download `metadata.json` alongside CSV containing input hash, units map, assumptions, source status, versions, warnings, field definitions and synthetic designation. Never rely on CSV filename alone for provenance.
- **Plot PNG:** optional convenience export, title/axes/legend and visible provenance caption. Plot images are not a substitute for numerical data. PDF report is later scope and must be rendered/verified if added.

CSV example headers: `temperature_K,flux_mol_m2_s,growth_m_s,Da,regime`; radial headers `rho_m,cell_inner_radius_m,cell_outer_radius_m,area_weight,flux_mol_m2_s,regime`. Use empty cells for nullable missing output and define this in metadata. Format numbers with roundtrip-safe significant digits, decimal point and no thousands separator. CSV text fields starting with =,+,-,@ (including after leading whitespace/control characters) must be safely escaped for spreadsheet consumption; numeric values remain numeric. Preserve canonical originals in JSON.

## Result provenance display

On-screen and exported captions include “synthetic”, “user supplied, unverified” or “reviewed parameter transcription; experimental validation pending”, as applicable. Every spatial export states the prescribed-field/no-conservation limitation. A comparison includes each run's versions and assumptions; do not average models or rank “best process” from synthetic cases.

## Scientific change record

Record equations, parameter changes, applicability changes and numerical method changes separately from UI changes. Keep previous snapshots readable. Mark original imported result as “saved snapshot”; only a successful new backend execution becomes “recomputed”. Hashes detect changes but are not proof of trustworthy scientific origin.

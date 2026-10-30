# CVD Studio — project documentation and agent handoff

Version 1.0 · Prepared 18 October 2026 · Problem statement PS-64

CVD Studio is a scientific web application for exploring the resistance-in-series deposition model, temperature-dependent kinetics, limiting regimes, and explicitly assumed spatial uniformity profiles for polysilicon and Si₃N₄ LPCVD.

**This archive contains specifications, contracts, templates, and verification fixtures. It is not the implemented application.** No material-specific kinetic or transport parameter has been invented. A coding agent can build and demonstrate the complete workflow with the clearly labeled synthetic fixtures while real material presets remain incomplete.

## Start here

1. Read [the supplied problem and evidence](docs/01-SOURCE-BRIEF.md).
2. Give a coding agent [MASTER_BUILD_PROMPT.md](MASTER_BUILD_PROMPT.md) and access to this whole folder.
3. Use [the roadmap](docs/17-ROADMAP.md) for build order and [the acceptance checklist](docs/18-ACCEPTANCE-CHECKLIST.md) as the completion gate.
4. Resolve material data using [the parameter registry](docs/09-PARAMETER-REGISTRY.md); never replace nulls with plausible-looking numbers.

## What is included

| Area | Files |
|---|---|
| Product and implementation | `docs/02-PRD.md`, `03-SOFTWARE-REQUIREMENTS.md`, `05-ARCHITECTURE.md` |
| Interface and accessibility | `docs/04-UI-UX.md`, `16-ACCESSIBILITY.md`, `design/tokens.css`, `design/contrast-report.json` |
| Scientific specification | `docs/07-SCIENTIFIC-MODEL-AND-UNITS.md`, `08-SIMULATION-ASSUMPTIONS.md`, `09-PARAMETER-REGISTRY.md` |
| Contracts and data | `docs/06-API-CONTRACT.md`, `10-DATA-SCHEMAS.md`, `contracts/openapi.json`, `schemas/`, `examples/` |
| Quality and operations | `docs/11-TESTING-AND-VALIDATION.md`, `12-SECURITY.md`, `13-DEPLOYMENT.md`, `14-OPERATIONS.md`, `15-REPRODUCIBILITY-AND-EXPORTS.md` |
| Delivery management | `docs/17-ROADMAP.md` through `23-OPEN-QUESTIONS.md`, `AGENTS.md` |
| Evidence and integrity | `references/`, `registry/`, `MANIFEST.json`, `BUNDLE-VALIDATION.md` |

## Locked stack

Next.js App Router, TypeScript, Tailwind CSS and shadcn/ui; FastAPI, NumPy, SciPy and Pint; Plotly.js for interactive browser charts; pytest, Vitest and Playwright. PostgreSQL is optional for a later authenticated persistence release. Use npm with a committed lockfile and uv with a committed lockfile. Select compatible supported versions at implementation time, then pin them; this package does not assert an untested version matrix.

## Evidence and limits

The recovered user-supplied PS-64 image is included with a transcription and hash. It specifies **600–750°C**, not numeric gas-flow or pressure limits. Material precursors, geometry, A, Ea, hg, density, molar mass, stoichiometric conversion and experimental validation data are not supplied. The spatial model is a transparent educational extension, not a CFD or reactor calibration result. Source links distinguish scientific definitions, supplied facts, and product design choices.

## First useful build

Ship a local, stateless workbench: choose a material template or synthetic demonstration, enter explicit parameters and units, validate, run one backend calculation, view flux and regime, sweep temperature, add a disclosed spatial profile, inspect data tables, and export reproducible JSON/CSV. No account or database is needed for this release. A manual scientific run can use documented user values; it must say “user supplied, unverified” and show unknown flow/pressure compliance.

## Authority and conflicts

Current user instructions outrank this package. Within it: original PS-64 facts → scientific specification → strict machine contracts → software requirements → UX → roadmap. Any contradiction must be recorded and reconciled before implementing the affected behavior. New physical claims require evidence; new product limits may be chosen with an explicit decision record. See [decisions](docs/20-DECISIONS.md).

## Verify the download

Extract the ZIP and inspect `MANIFEST.json` for SHA-256 hashes of every payload file. `BUNDLE-VALIDATION.md` records checks performed on this documentation package. Application test plans are requirements for the future build, not claims of tests already passed.

To repeat the contract/fixture checks, install `scripts/requirements-validation.txt` in an isolated standard Python environment and run `python scripts/verify_bundle.py` from this folder. The verifier resolves schema references locally and also checks the manifest when present.

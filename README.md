# CVD Studio

A local scientific workbench for PS-64 LPCVD precursor flux, regimes, temperature sweeps and a disclosed prescribed radial extension. **Synthetic examples are arbitrary mathematical fixtures, not material or process data.** Real polysilicon and Si₃N₄ templates deliberately retain missing constants. Experimental validation is pending.

## Quick start

Requirements: Node.js 24, Python 3.13 and uv 0.13.1. No account, API key, database or paid service.

```text
npm ci --ignore-scripts
uv sync --frozen
npm run build
npm start
```

Open http://127.0.0.1:3000. Choose **Enter the studio** on the 3D landing page, then **Use synthetic demo** and **Run simulation** in `/workbench`. The page calls the Python scientific service through the same-origin `/api/v1` route. For development use `npm run dev`; it starts both services together. Stop with Ctrl+C. The backend listens only on loopback port 8000 and the web service on 3000.

On Windows, if `uv` is not on PATH, create the environment with `python -m venv .venv`, install uv using `.venv\Scripts\python -m pip install uv==0.13.1`, then run `.venv\Scripts\uv sync --frozen`. On macOS/Linux the equivalent executable is `.venv/bin/uv`. Both run scripts select the platform's local virtual-environment Python automatically. The lockfile is authoritative; do not replace missing material constants during setup.

## What to try

1. Start with an incomplete real-material template. Enter your documented values or switch to the synthetic demonstration.
2. Run direct kₛ; observe its flat substrate-temperature sweep. Switch to Arrhenius with explicit A and Eₐ to study temperature dependence.
3. Use direct concentration or ideal-gas concentration with independent gas temperature. Flow is metadata; pressure affects concentration only in ideal-gas mode.
4. Add β for film growth and duration for thickness. Without β those outputs stay unavailable.
5. Enable prescribed radial fields, enter geometry and gradients, and inspect map/table, CV and half-range. No flow or mass-balance solution is implied.
6. Keep up to four snapshots for comparison. Download JSON to preserve work. Import asks before replacing the comparison list and marks imported data as untrusted until recomputed.

State stays in tab memory. Reloading or closing the tab clears it. There is no server project storage, automatic browser storage or analytics. Project JSON contains notes, inputs and results; share it deliberately.

## Verification commands

```text
npm test
npm run typecheck
npm run lint
npm run contract-check
npm run build
npm run test:e2e
npm run verify
```

Browser checks use installed Chrome by default (`CVD_BROWSER_CHANNEL=msedge` is an alternative). Playwright starts both production services itself if no service is running. Do not run the development server during production-browser verification. Browser outputs are saved under `outputs/qa`.

`npm run verify` runs Python lint, TypeScript checks, frontend lint, backend/frontend tests, contract checks and the production build. Browser and network-dependent security scans are separate. `npm run typegen` regenerates API types. `python scripts/generate_models.py` regenerates strict Pydantic models; `node scripts/generate_project_validator.mjs` generates the standalone browser import validator, avoiding runtime code evaluation under CSP.

## Source layout

The GitHub repository contains the frontend, scientific backend, local image/font assets, source specifications, exact dependency lockfiles, tests and setup scripts. Installed dependencies (`node_modules`, `.venv`), generated Next.js builds, recovery backups, temporary work folders and delivery/report outputs are excluded. Setup commands recreate the installed and generated files. The Plotly browser bundle is copied from its pinned dependency during the build. The Windows build helper creates its required directories directly and does not require a backup folder.

```text
apps/api/src/cvd_studio/domain/    pure SI equations and Pint boundaries
apps/api/src/cvd_studio/services/ snapshots, constraints, killable execution
apps/api/src/cvd_studio/main.py   strict stateless API and resource policy
apps/web/src/features/           draft, results, charts, projects
apps/web/src/app/                landing, workbench, compare, parameters, learn, model
specs/cvd-studio/                unchanged complete specification package
reference/                      original ZIP and checksum
infra/                          local container and reverse-proxy templates
docs/                           decisions and operational notes
outputs/                        user-facing evidence and delivery artifacts
```

## Scientific and operational limits

The equation returns precursor molar flux in mol m⁻² s⁻¹. β explicitly converts it to film growth. Da thresholds 0.1 and 10 are classification conventions. The assignment's 600–750°C interval does not certify a safe or feasible recipe. Pressure/flow bounds, real material constants and independent measurements were not supplied; they remain unresolved.

Requests are capped at 1 MiB, notes at 2,000 characters, sweeps at 501 samples, and grids at 65,536 display cells. Four calculations can be active with sixteen waiting. Each calculation runs in a spawned killable process with a five-second calculation deadline. The API ignores forwarded IP headers and uses a bounded token bucket; a public deployment needs the reviewed reverse-proxy policy and an appropriate trusted-client configuration.

Nonce-backed production scripts, strict Plotly, local fonts, strict JSON, no URL retrieval, inert text rendering, standalone import validation and CSV text escaping reduce risk. They are not a certification of security. See `docs/OPERATIONS.md` and the delivery evidence for uncompleted public-release checks.

The Windows sandbox required the supported Babel/Webpack fallback because native SWC path canonicalization was denied. Production and development both use that exercised path. Dependency versions are pinned in package files and lockfiles. Font assets retain their bundled OFL licenses; no new license is assigned to the user's project.

No public deployment was requested or performed. Container/TLS/staging procedures are preparation until actually exercised and recorded.

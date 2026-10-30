# Implemented requirements and evidence

The supplied specifications stay immutable under `specs/cvd-studio`. This ledger points to the actual implementation. `outputs/TEST-REPORT.md` and `outputs/acceptance-evidence.json` distinguish local passes from remaining review/release gates.

| Requirement | Actual implementation | Evidence |
|---|---|---|
| F-01 material contexts | `apps/web/src/app/parameters/page.tsx`; trusted `registry/parameters.json` in specs | API null-registry assertions; browser incomplete-template and manual-material flows |
| F-02 unit-tagged branches | generated `api/models.py`; `domain/units.py`; `features/scenario/request.ts` | strict API tests, unit/hash equivalence, ideal-gas and Arrhenius tests |
| F-03 strict scientific inputs | JSON Schema + strict Pydantic; `main.py`; simulation and radial validators | numeric strings, bools, extras, invalid units/window/gradients and overflow tests |
| F-04 backend flux/regimes | `apps/api/src/cvd_studio/domain/core.py` | independent scalar oracle, symmetry, asymptotes, Cs/flux bounds and threshold tests |
| F-05 beta/time conversion | `core.py`; result summary and scalar table | conversion oracle, null beta/time tests, browser missing-beta case |
| F-06 temperature study | `services/simulation.py`; result sweep plot/table | endpoint/count/trend/flat-sweep and fixed independent gas temperature checks |
| F-07 radial extension | `core.radial`; spatial map/table | equal-area analytic oracle, independent SciPy quadrature, nr convergence, ntheta invariance and full-disk failure tests |
| F-08 evidence/nulls | warnings, constraints, full registry snapshots; source library and result disclosures | schema-validated responses, visible caveats and browser-downloaded metadata |
| F-09 immutable/stale results | `features/projects/state.ts` and provider-level run guard | clone/stale/late-ticket unit tests; edited-input immutable browser export |
| F-10 project/CSV workflows | strict standalone import validator; `state.ts`; comparison import/recompute/load-inputs | JSON/CSV ZIP browser downloads and independent Python verification; import confirmation and recomputation |
| F-11 compatible comparisons | max-four snapshot retention; shared flux observable and scale; complete sweep table | limit unit test and browser two-study comparison, saved-data watermark |
| F-12 API/contracts | five `/api/v1` endpoints; reviewed contract; generated models/types | route/schema/error checks, examples, manifest and generation drift checks |
| F-13 nonvisual data | scalar, sweep, radial and complete comparison tables; semantic controls | automated axe checks and keyboard path; real screen-reader/full zoom review remains pending |
| F-14 process limits | trusted registry `constraints`; explicit unknown statuses | missing/known/missing-observation/outside synthetic tests and result disclosures |
| N-01/02 correctness/reproducibility | isolated SI domain, normalized hashes, original units/requests, runtime versions | independent numerical checks and real browser exports |
| N-03 performance | bounded synchronous process execution | local 100-call direct-service timings only; specified staging/field targets remain pending |
| N-04 accessibility | both themes, labels/focus, tables, reduced-motion CSS | automated checks at 375/768/1440; manual assistive-technology review remains pending |
| UX redesign / rotating landing | `/` landing, `/workbench` scientific workspace, `features/landing/wafer.tsx`, `styles/redesign.css`, transparent local illustrations | 13 production browser checks: landing at 320/375/768/1440, both themes, pause/top-view/reduced-motion and studio entry; existing scientific workflows pass |
| N-05/07 security/failure behavior | strict parser, bounded body/quota/queue/deadline, killed workers, no URL fetching/eval, nonce CSP | parser/API/deadline/error tests; npm/pip/Bandit/source scans; public proxy/TLS/image/DAST gates remain pending |
| N-06/08 maintainability/privacy | generated boundaries; stateless API; ephemeral tab state; local downloads | generation drift, snapshot tests, privacy copy and operations notes |

No account, database, reactor controller, literature-calibrated preset or experimental accuracy claim is included. Optional persistence requirements are not applicable to this release.

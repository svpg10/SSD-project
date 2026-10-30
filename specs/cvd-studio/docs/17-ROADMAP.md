# Project roadmap and implementation backlog

Order is dependency-based, not a promised calendar. Start with a thin complete vertical flow; parallel work is optional, not required.

| Stage | Tasks and output | Exit gate |
|---|---|---|
| 0 — Evidence | Read package, inspect repo, lock versions, preserve PS-64 and unresolved registry | Decisions and environment recorded |
| 1 — Scientific core | Units; direct/Arrhenius ks; stable flux; regimes; beta/duration; independent tests | Scalar synthetic oracle passes |
| 2 — Vertical slice | Strict API; generated TS; one form; result/table; JSON export | Browser-to-backend run and reproducible export |
| 3 — Temperature study | Inclusive sweep, fixed-Tg policy, chart/table, missing-beta handling | Sweep limits and trend tests pass |
| 4 — Spatial extension | Equal-area radial fields; metrics; explicit assumptions; map/table | Analytic spatial oracle and convergence evidence |
| 5 — Complete workflow | Registry inspector, import, compare, stale-state handling, empty/errors | Full journey incl. incomplete material presets |
| 6 — Quality | Responsive themes, accessibility, caps/security, CI, benchmarks | Acceptance gate with evidence |
| 7 — Release | Tested local/production commands, containers, staging, operations/rollback | Authorized deployment and smoke tests, if requested |
| Later — Scientific evidence | Review actual material sources, populate bounds, calibrate/validate independently | Narrow applicability and validation report |
| Later — Persistence | OIDC, PostgreSQL, ownership, retention, backup/restore | Auth/security/privacy gates |

## Small coding-agent work items

T-01 scaffold monorepo and pin tools. T-02 encode strict schemas and semantic validator. T-03 implement SI quantity adapters. T-04 implement scalar core and independent tests. T-05 implement bounded API execution/error mapper. T-06 generate client types and form. T-07 bind immutable results and JSON export. T-08 add sweep/core/API/chart/table. T-09 add radial core/metrics/API. T-10 implement spatial visualization/disclosures. T-11 implement registry and learning views. T-12 add project import/compare and CSV metadata. T-13 complete responsive/accessibility/theme states. T-14 enforce security/compute caps and load checks. T-15 build CI/containers/config. T-16 finish acceptance evidence and handoff.

Each work item must state requirements covered, files changed, tests executed and remaining gaps. Do not build optional accounts/database while core scientific behaviors are unfinished. Missing physical data does not block the synthetic workflow; it blocks unsupported material presets and experimental claims.

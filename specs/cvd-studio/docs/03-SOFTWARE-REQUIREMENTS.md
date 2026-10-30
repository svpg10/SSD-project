# Software requirements specification

All “shall” statements below are baseline requirements. Product limits are deliberately separate from process limits.

| ID | Requirement | Verification |
|---|---|---|
| F-01 | Shall offer polysilicon, Si₃N₄ and synthetic test context without fabricated constants | Registry/UI inspection |
| F-02 | Shall accept unit-tagged direct ks or Arrhenius A/Ea, direct hg, and direct or ideal-gas Cg | Schema and unit tests |
| F-03 | Shall validate finite values, positive coefficients, nonnegative concentration and 600–750°C substrate window | Boundary tests |
| F-04 | Shall compute flux, Da, resistance fractions and regime from the backend scientific core | Analytic fixtures |
| F-05 | Shall show growth and optional thickness only with beta and, for thickness, duration | UI/API tests |
| F-06 | Shall sweep substrate temperature with a fixed stated gas-temperature policy | Sweep tests |
| F-07 | Shall evaluate explicit prescribed radial fields with area-weighted metrics | Quadrature tests |
| F-08 | Shall expose all assumptions, provenance, nulls and constraint statuses | Export and UI inspection |
| F-09 | Shall preserve immutable result snapshots and detect stale results | Vitest/Playwright |
| F-10 | Shall export/import JSON and export UTF-8 CSV with units and metadata | Roundtrip tests |
| F-11 | Shall compare ≤4 snapshots only with compatible observables and display assumptions | Browser tests |
| F-12 | Shall publish versioned OpenAPI and structured errors | Contract tests |
| F-13 | Shall provide accessible data tables and keyboard alternatives to plots | Manual/automated review |
| F-14 | Shall report unknown rather than pass when process limits are absent | Constraint tests |

## Nonfunctional requirements

- **N-01 correctness:** scientific calculations are pure, deterministic and independently verified; no broad “experimental accuracy” assertion without data.
- **N-02 reproducibility:** preserve original units, normalized SI values, model/schema versions, parameters, environment fingerprint and input hashes.
- **N-03 performance targets:** on a documented 2-vCPU, 4-GiB staging instance, warm API p95 ≤500 ms for scalar, ≤1 s for a 151-point sweep and ≤2 s for a 128×128 radial grid over 100 serial requests. Record concurrency separately. Browser target p75 LCP ≤2.5 s and INP ≤200 ms under declared test conditions; these are release targets, not guarantees.
- **N-04 accessibility:** WCAG 2.2 AA target, including nonvisual access to numerical outputs. Test both themes and 200%/400% zoom.
- **N-05 security:** strict schemas, bounded compute, no code evaluation, no server URL retrieval from imported citations, same-origin routing and a staged security gate.
- **N-06 maintainability:** generated TS API types, isolated scientific core, documented model version policy and backwards-compatible minor schemas.
- **N-07 failure behavior:** no partial successful response for invalid numerical cells. Return one structured failure, preserve last valid client snapshot, never leak stacks.
- **N-08 privacy:** no server storage in baseline; disclose browser persistence and export contents. No analytics by default.

## Workload caps (product policy)

Simulation request size 1 MiB; local project import/export size 16 MiB (checked before parsing or download, so supported exports remain importable); max sweep samples 501; radial nr≤256, ntheta≤256 and total cells≤65,536; max four snapshots compared client-side; max text note 2,000 characters; sync wall-clock budget 5 s; max four concurrent calculations per instance plus 16 waiting slots. Reject overload with 429 or 503 and Retry-After. Enforce cancellation/timeout at a killable worker boundary, not just an awaited coroutine. Caps are configurable downward within the schema ceilings, published by capabilities, and tested.

## Numerical and semantic rules

Strict JSON forbids NaN/infinity; strict types reject strings pretending to be numbers, unknown fields and booleans as numbers. beta, A, ks, hg and radius must be positive; Ea≥0; Cg≥0; duration≥0; ideal-gas pressure and gas temperature positive; mole fraction in [0,1]; edge exclusion satisfies 0≤e<R. Every local substrate temperature stays in the study window. Unit mismatch and overflow fail with field-level errors.

Physical flow/pressure compliance is a separate evaluation against versioned registry bounds. Missing bounds produce `unknown`; known out-of-range bounds produce `outside_declared_bounds` and block the affected run until inputs or declared applicability are corrected. No “safe” or “approved recipe” status is permitted.

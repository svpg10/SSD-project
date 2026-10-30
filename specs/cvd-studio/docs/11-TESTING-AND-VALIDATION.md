# Testing and scientific validation

Tests below are required for the future application. Bundle checks are separately recorded in `BUNDLE-VALIDATION.md`. Verification of formulas does not establish experimental validity.

## Test layers

| Layer | Tool | Required coverage |
|---|---|---|
| Scientific unit/reference | pytest, NumPy; SciPy reference integration | units, formula, asymptotes, sweep, quadrature, metrics |
| Schema/API | pytest + FastAPI test client | request/response contracts, errors, caps and registry semantics |
| Client behavior | Vitest + Testing Library | draft vs snapshot, units, states, import/export, accessible labels |
| End-to-end | Playwright | full workflows, screenshots, responsive and keyboard checks |
| Security/operations | chosen scanners + pytest + staging probes | headers, limits, dependencies, timeout, overload, optional authorization |

## Independent numerical oracles

Values here are arbitrary mathematical test quantities, never real material data. `examples/` identifies them as synthetic. Do not copy production functions into tests.

- ks=2 m/s, hg=3 m/s, Cg=5 mol/m³ → keff=1.2 m/s, Cs=3 mol/m³, J=6 mol/(m² s), Da=2/3, surface fraction=0.6, gas fraction=0.4, mixed regime. beta=0.01 m³/mol → growth=0.06 m/s and 3.6e9 nm/min. Duration=2 s → thickness=0.12 m. These intentionally nonphysical magnitudes make arithmetic transparent and must never be offered as real material presets.
- Swapping ks and hg preserves keff and J, but exchanges resistance fractions and inverts Da. At ks=hg, keff=ks/2.
- Reaction-limited oracle: ks/hg=1e-8, relative error between J and ks Cg <1e-7. Transport-limited: hg/ks=1e-8, analogous error. Test ratios without overflowing products.
- Multiply Cg by c≥0 → J multiplied by c. J never exceeds min(ks,hg)Cg. Verify Cs bounds and J=ks Cs=hg(Cg−Cs) where representable.
- 600°C→873.15 K; 750°C→1023.15 K; use exact decimal reference plus tolerance. Reject absolute/delta confusion. J↔nm/min conversion tested against independently derived factors.
- Ea=0 → ks=A. Positive Ea produces increasing ks over the window with fixed A. Zero Cg produces zero flux and null normalized spatial metrics. Direct ks produces a flat Ts-only sweep and an explicit warning.
- At Da exactly 0.1 and 10 class=mixed; adjacent values classify correctly. Sum of resistance fractions and sum of spatial regime area fractions equal one within tolerance.

## Spatial tests

Zero gradients recover scalar field at every cell, CV=half-range=0 when mean>0. Check cell-edge areas telescope to pi Ru², each weight=1/nr and weights sum to 1. Check changing ntheta does not change statistics.

Independent analytic oracle: prescribe direct ks, constant hg and `Cg(r)=C0[1+aC(r/R)²]`. With a=(Ru/R)², exact disk-area mean is `J0(1+aC a/2)` and population sigma is `abs(J0 aC a)/sqrt(12)`. Equal-area midpoint quadrature gives the mean exactly to rounding; sigma converges with nr. Sample extrema differ from physical-edge extrema and must be labeled. Use SciPy integration independently for additional valid nonlinear temperature profiles. Compare nr=64,128,256; require relative change in positive mean ≤1e-4 for selected smooth fixtures, and report rather than universalize the result. Edge exclusion, invalid physical-edge gradients and local Ts violations need explicit tests.

## Tolerances and error cases

Ordinary algebra fixture defaults: relative tolerance 1e-12, absolute tolerance chosen per unit (e.g. 1e-14 mol/(m² s) for the stated J fixture). Never use a single dimensionless absolute tolerance for every observable. Extremely small/large values get scale-aware tolerances and explicit underflow/overflow policy tests. Semantic validation covers null/zero, negative inputs, numeric strings, booleans, duplicate keys, unknown fields, mismatched units, unsupported model/schema/registry version, grid caps, oversized JSON, malformed JSON and nonfinite constants.

## End-to-end acceptance flows

Open incomplete real material template → see missing values → switch to synthetic → run → inspect table → sweep → enable spatial extension → compare → export → import → recompute. Verify watermark persists throughout. Also test a documented user-entered material run, beta absent, duration absent, zero Cg, stale result, rapid repeated runs, late response, offline/network error, timeout and interrupted download. Real-material literature mode is rejected when registry is unresolved. No import may grant itself reviewed status.

## Experimental validation protocol (blocked on data)

1. Before fitting, register geometry, precursor/co-reactants, conditions, measurement method, spatial sample locations and uncertainty.
2. Separate calibration and held-out validation runs; never score the fit on the same data and call it independent validation.
3. Predeclare targets for rate bias, MAE/RMSE, relative error only where nonzero, and uniformity residuals. Thresholds are null in `registry/validation-plan.json` until agreed with the scientific reviewer.
4. Compare equivalent observables and units, including edge exclusion and measurement sampling; account for reported measurement uncertainty.
5. Report residual plots, systematic failure modes, applicability envelope, sample count and exclusions. Preserve raw data and provenance.
6. Only then describe validated conditions narrowly. Until completed, UI says “Mathematically verified model; experimental validation pending” only after numerical verification has actually passed.

## Evidence policy

Record test command, environment/commit, result, screenshots and measured benchmarks. Every acceptance item is pending by default. Do not substitute a high test count, coverage percentage or attractive plot for independent scientific evidence.

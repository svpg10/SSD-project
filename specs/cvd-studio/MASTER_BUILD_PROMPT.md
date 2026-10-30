# Master build prompt — CVD Studio

You are implementing CVD Studio, a polished scientific web app grounded in user-supplied PS-64, Chemical Vapor Deposition (CVD) Thin-Film Uniformity Modeling. Read this entire documentation package before changing code. Deliver working software, tests, an honest scientific interface and reproducible outputs. Do not stop after scaffolding or a visual mockup.

## Product outcome

Help students, instructors and early research users understand how surface reaction and gas-side transport jointly control deposition. Support polysilicon / Si₃N₄ LPCVD in the supplied 600–750°C study window. Show the equation `r = ks*hg/(ks+hg)*Cg`, reaction-limited and mass-transfer-limited behavior, temperature sweeps, and a separately identified spatial extension. Make provenance, units, assumptions and validation status visible at every interpretation point.

## Read in this order

`README.md`; `docs/01-SOURCE-BRIEF.md`; `docs/07-SCIENTIFIC-MODEL-AND-UNITS.md`; `docs/08-SIMULATION-ASSUMPTIONS.md`; `docs/02-PRD.md`; `docs/03-SOFTWARE-REQUIREMENTS.md`; `docs/06-API-CONTRACT.md`; `contracts/openapi.json`; all `schemas/`; `docs/04-UI-UX.md`; `docs/05-ARCHITECTURE.md`; testing, security, accessibility and deployment docs; roadmap and acceptance checklist. Inspect examples and unresolved registry entries.

## Non-negotiable scientific rules

1. Interpret r as precursor-consumption molar flux J in mol m⁻² s⁻¹ when ks and hg are m/s and Cg is mol/m³. Preserve the PS-64 symbol and explain this dimensional convention. Film growth in nm/min is available only with an explicit positive conversion factor beta in m³/mol of precursor, tied to the deposited film's composition and stoichiometry. Never relabel flux as thickness rate.
2. Convert absolute Celsius to kelvin before Arrhenius evaluation. Distinguish gas temperature from substrate temperature. Use Pint at boundaries and SI floats in the numerical core.
3. Material-specific registry values begin as null. Do not infer missing values from a material name, generate citations, or borrow a kinetic constant from incompatible chemistry. Synthetic fixture numbers are software tests, not literature or material properties.
4. Numeric flow and pressure constraints are absent in the supplied brief. Store null bounds and report unknown compliance. A manual hg is explicit; flow does not determine hg without an adopted geometry-specific closure. Flow is metadata in version 1. Pressure changes Cg only in the selected ideal-gas branch. UI labels must state these dependencies.
5. The baseline model is first order, steady state and local. Regime boundaries Da=0.1 and 10 are configurable **classification conventions**, not source facts. Classify from ks/hg, not from temperature alone.
6. Implement the spatial extension exactly as specified: prescribed radial local fields on equal-area cells. It does not solve reactor flow or species conservation. Show its limitations beside every map and in every export. Never present the map as an inferred physical wafer prediction.
7. Do not silently clip, smooth, normalize, fabricate confidence bands, or discard invalid inputs. Return structured errors. Missing data must leave an actionable incomplete state. A zero mean makes normalized uniformity metrics null, not NaN or infinity.
8. All results must contain normalized inputs, model and schema versions, parameter registry snapshot, warnings and provenance. Editing inputs makes previous results visibly stale; exports stay bound to the snapshot that produced them.

## Stack and design

Use Next.js App Router + TypeScript + Tailwind + shadcn/ui; FastAPI + Pydantic + NumPy + SciPy + Pint; Plotly.js in client-side chart components. Use pytest, Vitest and Playwright. Use the supplied neutral/teal design tokens and typography specification. Meet WCAG 2.2 AA with accessible chart data tables and keyboard operation. Prefer a dense, calm scientific workbench with disciplined spacing, readable axes, sensible empty states and one obvious Run action. Implement loading, success, incomplete, validation-error, network-error and stale-result states.

Start with stateless synchronous bounded calculations and local downloadable projects. PostgreSQL and managed authentication are optional later scope; do not create a database dependency for the baseline product. Do not put the physics in the browser or duplicate authoritative calculations in React. Load Plotly lazily. Reuse OpenAPI-generated TS types; validate forms with generated or aligned schemas and enforce validation again on the server.

## Work sequence

1. Inspect the repository and existing instructions. Record versions and decisions; create the recommended monorepo structure without deleting unrelated work. Create a requirements traceability ledger from this package.
2. Implement the pure scientific core first: SI conversion, coefficients, stable flux, Da, growth conversion, sweep evaluation and radial extension. Write independent numerical reference tests and domain failures before adding charts.
3. Implement Pydantic models and the `/api/v1` endpoints from OpenAPI. Validate semantic constraints not expressible in JSON Schema. Normalize error envelopes, resource caps and request IDs. Verify generated OpenAPI against the committed contract.
4. Build one complete vertical flow from manual input to backend result, table and reproducible export. Then add sweeps, spatial mode, compare and parameter registry views. Keep incomplete material presets visible and honest.
5. Add UI polish, responsive views at 375/768/1440 CSS pixels, dark mode, focus handling, table alternatives and reduced motion. Include the assumptions and provenance drawers in the actual workflow.
6. Complete pytest, Vitest, Playwright, accessibility, contract, security and performance checks described in this package. Review screenshots and numerical export files. Fix failures; record measured limits and residual issues.
7. Add reproducible local setup, containers, staging instructions, operational limits, CI and rollback guidance. Build and run the production configurations locally. Deploy only to an authorized target; deployment credentials and vendor account choices are not supplied by this package.

## Avoid scope drift

Do not add AI predictions, real-time reactor controls, billing, social sharing, unsourced optimal recipes, automatic literature scraping, calibration claims, arbitrary expression evaluation or upload execution. Do not replace absent scientific values with attractive defaults. Optional advanced features must not delay the defined release gate.

## Required handoff

Deliver application source, pinned lockfiles, setup/run commands that were actually exercised, `.env.example`, model version and change log, completed traceability/acceptance records with evidence, screenshots of key states, test output summary, remaining scientific data gaps and deployment instructions. Explicitly distinguish software correctness, mathematical verification and experimental validation. Report what remains incomplete; do not mark experimental validation passed without independent data and predeclared criteria.

Work autonomously on reversible implementation choices within this scope. Ask only when a missing answer blocks the affected work, and continue independent tasks. Missing scientific data must block the unsupported physical claim, not the rest of the application.

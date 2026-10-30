# Assumptions, applicability and limitations

| ID | Assumption | Consequence / disclosure |
|---|---|---|
| A-01 | Steady state and first-order effective surface sink | No transient chemistry, saturation or nucleation |
| A-02 | One limiting precursor and one effective film conversion | Multispecies nitride kinetics are unresolved |
| A-03 | Gas-film resistance and surface resistance in series | No gas-phase reactions or homogeneous particle formation |
| A-04 | Direct hg fixed across a sweep | Flow and pressure do not secretly alter transport |
| A-05 | Tg fixed independently of swept Ts | Ideal-gas Cg remains fixed during a Ts-only sweep |
| A-06 | beta, when supplied, fixed in temperature and space | No density/composition changes with temperature |
| A-07 | Duration multiplies a constant local rate | No incubation, changing film properties or gas depletion |
| A-08 | Prescribed radial local fields | No solved reactor conservation; gradients are hypotheses |
| A-09 | Axisymmetry | Angular sectors are rendering only |
| A-10 | Equal-area cell-center sampling | Sample extrema and numerical discretization must be disclosed |
| A-11 | 600–750°C is the assignment window | Not a universal process safety or deposition feasibility window |
| A-12 | No measured validation set or distributions supplied | No experimental accuracy, uncertainty interval or optimal recipe claims |

## Input authority

The app may accept explicit user coefficients with `user_supplied` provenance even while material templates remain incomplete. Their presence establishes calculability, not scientific validity. `literature` inputs must refer to a registry record with source and applicability metadata. A template selection is not evidence for any coefficient. `synthetic` inputs must retain the synthetic watermark in UI, exports and comparisons.

## Constraint behavior

Each process constraint has status `unknown`, `within_declared_bounds`, `outside_declared_bounds`, or `not_provided`. Missing bounds → unknown. Known bounds with missing observation → not_provided. Known compatible bounds and supplied observation → numeric check. If reference conditions or units make a flow comparison ambiguous, return unknown with a reason; do not compare raw sccm values across standards. `within_declared_bounds` only describes the registered range and does not certify safety or model validity.

## Limitations shown on results

Always show: provenance basis, model version, growth conversion availability and unknown process constraints. On spatial results show: “Prescribed radial fields; no flow or mass-balance solution.” On nitride show the one-precursor effective-model limitation. On synthetic results show: “Synthetic numerical demonstration; not material or process data.” Keep these in reports and data downloads.

## Change discipline

A new gas chemistry, reaction order, transport closure, geometric extension, coupling policy or metric definition requires a model-version change, scientific review, new applicability record and independent reference tests. A UI-only formatting change does not change model version. Do not silently reinterpret an old saved run.

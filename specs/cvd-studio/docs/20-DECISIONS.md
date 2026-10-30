# Decisions and change log

| ID | Decision | Reason / reconsideration trigger |
|---|---|---|
| D-01 | Preserve PS equation as precursor flux with explicit growth conversion | Dimensions must be honest; revisit only with source clarification |
| D-02 | No populated real material constants | No material-specific evidence supplied |
| D-03 | Manual hg; direct/ideal-gas Cg; flow metadata | Avoid unsupported reactor transport closure |
| D-04 | Fixed independent Tg during Ts sweep | Explicit reproducible dependency policy |
| D-05 | Prescribed axisymmetric radial extension | Transparent uniformity study without pretending CFD |
| D-06 | Stateless synchronous bounded baseline | Simpler deployment and no unnecessary accounts/database |
| D-07 | Python scientific authority; browser Plotly rendering | Avoid inconsistent duplicate numerical engines |
| D-08 | Da thresholds 0.1 and 10 | Educational convention, versioned and disclosed |
| D-09 | No automatic uncertainty or optimal recipe | No distributions, calibration or validation data |
| D-10 | Local exports and optional later PostgreSQL | Reproducibility first; persistence when justified |

Change record template: date, author, decision id, evidence, affected requirements/schema/model, alternatives, migration and verification. Initial package version 1.0 on 18 October 2026. Product caps and design targets are choices, not experimentally derived quantities. This package does not lock an unsupported dependency version matrix.

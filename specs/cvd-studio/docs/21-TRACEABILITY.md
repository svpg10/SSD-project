# Requirements traceability

| Origin / requirement | Implementation area | Required evidence | Acceptance |
|---|---|---|---|
| PS-64 equation, P-01/F-02–04 | domain/flux, kinetics, units | analytic oracle/asymptotes | AC-03–05 |
| PS-64 study window/regimes, P-02/F-03,06 | validation, sweep | endpoints, trend, Da boundaries | AC-05–06 |
| PS-64 flow/pressure constraints, F-08,14 | registry + constraints | null/known/outside cases | AC-01–02 |
| Uniformity extension, P-03/F-07 | spatial + metrics | area/analytic/convergence tests | AC-07–08 |
| Growth-rate plot, F-05 | conversion + chart | beta/duration/units tests | AC-04,06 |
| Reproducibility, P-04/F-09–12 | API, snapshot, project | contract + roundtrip + stale-state | AC-09–13 |
| Honest evidence, P-05/F-01,08 | registry + UI disclosures | missing material/synthetic journeys | AC-01–02,13,22 |
| Inclusive use, P-06/F-13 | UI and tables | manual/automated a11y and screenshots | AC-14–16 |
| Performance/security, N-03,05 | proxy + executor + CI | benchmark and abuse reports | AC-10,17–18 |
| Operations, N-02,06–08 | infra + runbooks | build/staging/rollback evidence | AC-19–21 |
| Optional persistence | auth + DB | two-user tests and restore drill | AC-23 |

The coding agent replaces implementation-area placeholders with actual code/test paths and records commit/evidence. Coverage here describes the plan; it is not a passed-test report.

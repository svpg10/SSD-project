# Acceptance checklist

All items are **pending for the future application**. Check only with recorded evidence. Bundle integrity checks do not complete application requirements.

- [ ] AC-01 Source image/transcription retained; missing pressure/flow limits shown honestly.
- [ ] AC-02 Material templates contain no invented A/Ea/hg/beta/density or citations.
- [ ] AC-03 Scalar independent oracle, unit conversions, finite checks and limiting tests pass.
- [ ] AC-04 Flux is never labeled thickness rate; beta/duration null behavior is correct.
- [ ] AC-05 Regimes use Da with documented thresholds and resistance fractions.
- [ ] AC-06 600–750°C temperature sweeps honor fixed Tg and explicit coefficient policies.
- [ ] AC-07 Radial extension uses equal-area quadrature, validates full-disk fields and discloses no conservation solution.
- [ ] AC-08 CV/half-range defined separately; zero mean gives null normalized metrics.
- [ ] AC-09 JSON schemas/examples validate; generated API matches reviewed contract.
- [ ] AC-10 All API failures use tested error envelope; resource/deadline caps enforced.
- [ ] AC-11 Input edits mark results stale; late responses cannot overwrite newer snapshots.
- [ ] AC-12 JSON import/recompute and CSV/metadata preserve provenance, units and versions.
- [ ] AC-13 Synthetic designations persist in results, comparisons and exports.
- [ ] AC-14 Incomplete, loading, invalid, offline, timeout and successful states work.
- [ ] AC-15 Responsive screenshots at 375/768/1440; both themes reviewed.
- [ ] AC-16 WCAG automated/manual review complete incl. charts/tables, keyboard, screen reader and zoom.
- [ ] AC-17 Performance targets measured on declared hardware and workload.
- [ ] AC-18 Security scans and abuse tests complete; high/critical findings resolved or release blocked.
- [ ] AC-19 Production build, local setup, container routing and staging smoke run exercised.
- [ ] AC-20 Deployment/rollback instructions, contacts, config and observability complete.
- [ ] AC-21 Requirements traceability includes actual test/evidence links.
- [ ] AC-22 Experimental validation remains pending unless independent data/protocol completed; no fabricated accuracy claim.
- [ ] AC-23 Optional persistence, if shipped, passes cross-user authorization, migration, retention and restore checks.

## Release evidence record

For every item store: id, status (`pending/pass/fail/not_applicable`), commit, environment, method/command, evidence path, reviewer, date, issue link and limitation. `not_applicable` needs rationale. Scientific reviewer signs any claim beyond verified mathematical behavior. Release owner signs software readiness. Neither is implied by this documentation archive.

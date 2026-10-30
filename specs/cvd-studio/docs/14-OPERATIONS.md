# Operations and incident response

## Health and observability

Liveness checks process response only. Readiness checks numerical core self-test and registry load; optional DB is checked only when configured. Neither endpoint leaks filesystem paths, credentials or internal network details. Capabilities exposes public versions and computational limits.

Structured logs: request_id, endpoint, status/error code, latency, mode, sample/cell count, schema/model/registry version, application commit. No request body or notes by default. Metrics: request/error counts, p50/p95/p99 latency, active/queued calculations, deadline kills, worker restarts, rate-limit events, memory/CPU and registry readiness. Alert on sustained error spikes, repeated timeout kills and queue saturation; thresholds are set after staging baselines, not invented from scientific claims.

## Incident playbook

1. Identify impact and recent deployment/config/registry changes. Preserve redacted operational evidence.
2. Contain abuse with quotas or disable affected calculation mode; keep health and useful static documentation available.
3. For numerical defects, mark affected model version, display a clear result warning, stop new affected runs and identify impacted snapshots if persistence exists.
4. Roll back immutable deployment/config; never silently rewrite saved scientific results. Publish a corrected model version and recomputation path.
5. For secrets exposure, rotate/revoke and audit access. For registry tampering, restore reviewed signed-off artifacts and compare hashes.
6. Verify recovery with synthetic references, capabilities, normal and overload requests. Record cause, user impact and follow-up tests.

## Data retention

Baseline: no server project database; inputs exist in memory during computation and are not logged. Operational log retention is a deployment setting (initial proposal 14 days), disclosed at launch. Local browser storage and exports are controlled by the user. Optional persistence requires explicit retention/deletion policy, encrypted backup configuration and a measured restore drill. Proposed RPO≤24 h and RTO≤4 h are operational targets only, pending hosting choice and restore evidence.

## Support and maintenance

Add real support/security contacts before public release; placeholders must not become invented email addresses. Schedule dependency/security review, lockfile updates and model/registry review separately. A dependency update that changes numerical results requires investigation and model/reference evidence before release.

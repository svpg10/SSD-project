# Local operation and future release

Start both loopback services with `npm start` after `npm run build`. Development uses `npm run dev`. Readiness: `/api/v1/health/ready`; liveness: `/api/v1/health/live`. Capabilities exposes exact model/schema/registry and workload policies. No database or credential is required.

`API_ORIGIN` is server-only. Browser calls use relative URLs. Never add private configuration under NEXT_PUBLIC. `CVD_COMMIT` should identify a reviewed source revision in a packaged release. Runtime responses include actual scientific dependency versions and the uv lock hash.

The provided Docker templates are optional: `docker compose -f infra/compose.yaml up --build`. Local proxy binds only 127.0.0.1:8080. Do not expose it publicly without completing the release gate. Image base tags must be resolved to reviewed immutable digests, scanned and recorded before deployment. The production host, domain, support contacts and TLS ownership remain unspecified.

Before public launch: exercise Compose routing and error envelopes; configure strict proxy size limits and global/per-client quotas; verify forwarded-header trust; measure queue deadlines and overload; configure HTTPS and domain-appropriate HSTS; perform image, dependency, secrets and DAST scans; complete screen-reader review and target-hardware benchmarks. Nginx's own size/quota failures currently use its default error pages and need the documented API error-envelope integration before public release. This is a known template limitation, not an API behavior claim.

Logs contain request id, path, response status and latency, not request bodies or notes. The local runner prints logs to the terminal and does not install a log collector. Set a disclosed retention period at deployment; 14 days is a proposal only. Future dashboards should track request counts, p95/p99, active/queued calculation counts, deadline kills, quota events and worker failures. This build has no external monitoring or support contact configured.

If calculations fail: preserve the JSON snapshot and request id; check readiness; rerun the labeled synthetic scalar oracle; check grid/sweep limits and numerical-range errors. Never “fix” a failed physical run by silently clipping its fields. Unsupported or invalid inputs leave the last successful snapshot intact.

Rollback: stop both services, restore the previous reviewed source + npm/uv lockfiles + immutable registry/model data, install frozen dependencies, rebuild, start, and smoke-test readiness, synthetic flux 6, sweep and export. Preserve exported studies; do not rewrite their old model interpretations. Publish a new model identifier for any numerical behavior change. A registry update needs explicit source/applicability review and a new snapshot hash/version.

Residual risks: unreviewed user coefficients; absent real experimental validation; anonymous workload abuse in a public environment; browser-tab loss without export; public deployment misconfiguration. No accounts or persistent storage are included, so cross-user authorization and database restore are not applicable to this baseline. Such features require their own schema/security/retention release.

# Deployment and local-development specification

## Baseline topology

Two services (Next.js Node runtime and FastAPI/Uvicorn) behind one TLS reverse proxy. Serve `/api/v1` to FastAPI and all other paths to Next.js, preserving request IDs and bounded body sizes. Containers are recommended for repeatability; vendor choice is open. Do not place long Python numerical jobs inside a browser or an unreviewed serverless function deadline.

## Implementation setup contract

The coding agent must provide a tested root task runner with `dev`, `build`, `test`, `lint`, `typecheck`, `contract-check` and `verify` targets, plus platform-neutral setup instructions for Windows, macOS/Linux. Use npm workspace/lockfile for frontend and uv lock for backend. Choose supported compatible Node/Python/dependency versions at build time; record exact versions in runtime manifests and CI. Current official installation guidance is linked in references; do not assume this archive has installed anything.

Provide `.env.example` from `templates/env.example` with no real secrets. Provide Dockerfiles and a local Compose file; local DB profile is optional and off by default. Document how to start the frontend/backend separately and together, run production builds, reach readiness and run a first synthetic calculation. Exercise those commands before final handoff.

## Environment separation

Local uses loopback; staging and production get separate config and optional credentials. Only browser-safe flags and public origin may use NEXT_PUBLIC variables. Internal API origin, trusted proxies, optional database URLs and auth secrets are server-only. Do not bake secrets into images, logs or build arguments. Frontend API calls use relative same-origin paths by default.

## CI gate

Install from lockfiles → format/lint/type checks → pytest/Vitest → schema/example/contract drift checks → production build → Playwright in production-like mode → accessibility checks → dependency/secret/image scan → package immutable image digests and SBOM. Pin third-party CI actions to reviewed commits. Run heavier load/DAST/restore tests on staging before release. Record actual evidence, not a prefilled pass list.

## Release procedure

1. Verify scientific/model/registry versions, unresolved data labels and acceptance evidence.
2. Build immutable artifacts, identify commit and image digests. Validate config and resource caps.
3. Deploy staging; test proxy routing, CSP/Plotly, synthetic run, export/import, timeout, saturation and accessibility.
4. If persistence enabled, back up and test migration compatibility. Use expand/contract migrations; do not drop old columns during a rollback window.
5. Deploy to the authorized production target, run smoke probes and monitor errors/latency. Route gradually if hosting allows.
6. Roll back to prior images/config on failure. Registry/model versions stay immutable; do not overwrite previous run interpretations.

No hosting subscription, credentials, domain or deployment approval is supplied in this package. It specifies deployment work; it does not publish an app. Follow the user's active authorization when executing the later build.

# Security requirements and threat model

## Assets and trust boundaries

Assets: availability of compute, integrity of scientific results/registry, user-entered study notes and later saved projects/identities. Actors: anonymous user, malicious bot, maintainer, dependency supplier; optional authenticated users/admins in persistence release. Entry points: JSON API, project import, citation strings, downloads, client rendering, proxy, CI and future storage/auth. Imported files and source metadata are untrusted data.

| Threat | Abuse | Required control and verification |
|---|---|---|
| Compute denial of service | Huge sweeps/grids or repeated requests | Size/grid/time/concurrency/rate caps; saturation and kill-timeout tests |
| Scientific tampering | Imported “reviewed” values or changed registry | Trusted read-only server registry, version hashes, review workflow; forged-import test |
| XSS / unsafe links | Script in notes, source title or citation | React escaping; no raw HTML; http/https link allowlist, noopener; payload tests |
| Injection / unsafe evaluation | Expression strings or executable imports | Strict JSON only, no eval/pickle/shell or arbitrary model code; parser tests |
| Supply chain / secret exposure | Vulnerable dependency or CI token | Locks, scans, least-privilege CI, no secrets in browser/build; release scans |

## Baseline controls

Serve over TLS, same-origin API routing, production debug off, generic errors with request IDs. Request method/content-type allowlists; reject duplicate JSON keys and NaN/Infinity; enforce strict Pydantic fields. No server fetching of user-supplied URLs, including citations. Never execute uploaded files or extract user ZIPs. Exports use safe filenames and CSV injection protection for text fields. No raw HTML or SVG from users. No external script/CDN requirement for fonts or Plotly.

CORS disabled when same-origin; if enabled for a reviewed deployment, explicit origin allowlist and no wildcard credentials. Baseline has no session cookie or account, so no pretend authentication endpoints. Implement per-IP and global quotas at the proxy plus in-process workload limits; configure trusted proxy addresses so spoofed forwarded headers do not bypass controls. Initial policy: 60 simulation requests/minute/IP, burst 10, subject to staging load review; this is product policy, not a process property.

Headers: CSP with nonce/hash-backed scripts and explicit Plotly-tested requirements; object-src none, base-uri self, frame-ancestors none; nosniff, strict-origin-when-cross-origin referrer policy and restricted Permissions-Policy. Test Plotly under the actual policy; do not casually add unsafe-eval or blanket unsafe-inline scripts. Use HSTS after TLS/domain readiness; includeSubDomains/preload only after domain inventory and an explicit operational decision. COOP/CORP where compatible; avoid breaking resources by untested header recipes.

Containers run non-root with minimal images and bounded memory/CPU, read-only root where feasible. Registry is read-only. No shared CDN cache for POST/scientific payloads; responses `Cache-Control: no-store`. Log request id, code, duration, workload sizes and versions, not full scientific inputs or notes. Set and disclose retention in deployment.

## Optional authenticated release

Use maintained OIDC/session integration. Server checks issuer, audience, signature and expiry; secure HttpOnly SameSite cookies and CSRF protections for state changes; no tokens in localStorage. Every object access is owner-scoped and deny-by-default. Test two users reading/updating/exporting/deleting each other's objects, ID guessing and role changes. Admin registry promotion needs MFA and audit. Password handling is delegated to provider; do not implement custom credential storage for this project.

## Release security gate

Secret scan, dependency and image scans, static analysis, staging DAST, headers/TLS review, malformed-input and compute-abuse tests. Record tool/version/date and triage findings; no unaccepted critical/high issues at launch. If optional persistence exists, include authorization/session tests and backup/restore. Reference [OWASP REST guidance](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html); use ASVS Level 2 as a review target without claiming conformance from this document alone.

No security implementation or penetration test is delivered in this documentation archive. Residual risks include misuse of user-supplied coefficients, anonymous compute abuse and deployment misconfiguration; controls reduce risk and require real verification.

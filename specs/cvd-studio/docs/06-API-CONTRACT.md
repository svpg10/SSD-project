# API contract

Authoritative machine contract: [OpenAPI 3.1.1 JSON](../contracts/openapi.json). Reusable schemas: [JSON Schema 2020-12](../schemas/cvd-studio.schema.json). JSON examples in `examples/` exercise success, zero flux, spatial and structured error cases. Unit keys are allowlisted; no arbitrary expression parser is exposed.

## Endpoints

| Method/path | Purpose | Status |
|---|---|---|
| GET `/api/v1/health/live` | Process alive, no internal detail | 200 |
| GET `/api/v1/health/ready` | Required registry/core ready; no DB for baseline | 200/503 |
| GET `/api/v1/capabilities` | Versions, supported modes, caps, schema and thresholds | 200 |
| GET `/api/v1/parameters` | Versioned read-only registry and unresolved material templates | 200 |
| POST `/api/v1/simulations` | One scalar run plus optional sweep/spatial result | 200 |

There are no server save/delete/export endpoints in baseline. The client exports JSON/CSV from immutable snapshots. A successful calculation returns 200, not 201: no server resource has been created. No auth scheme is advertised for the stateless baseline. Production abuse controls remain mandatory.

## Request shape

`schema_version`, client `request_id` (UUID), `basis` (`synthetic`, `user_supplied`, `literature`), `material`, scalar `temperature`, tagged `kinetics` union (`direct` or `arrhenius`), direct `mass_transfer_coefficient`, tagged `concentration` union (`direct` or `ideal_gas`), nullable `growth_conversion`, nullable `duration`, nullable flow metadata, nullable `process_pressure`, registry snapshot reference, nullable sweep/spatial options and notes. All fields are required, with nulls where specified; unknown keys are rejected. `synthetic` requires material `synthetic`; scientific materials require `user_supplied` or `literature`. In direct-Cg mode process_pressure is metadata for constraints only. In ideal-gas mode it must be null; concentration.total_pressure is the authoritative pressure for both concentration and constraint evaluation.

All scientific numbers are quantities `{value, unit}`. `basis` is a self-declared provenance class, not an authorization or validation certificate. A `literature` run must reference reviewed non-null parameter entries covering the selected coefficients/conditions; the service verifies this against its trusted registry. Imported records cannot promote themselves to trusted status. Baseline registry has no such material values, so literature material runs remain unavailable until the registry is updated through review.

`registry_snapshot` must equal the server's advertised version/id for computation; preserve original imported snapshots separately. For direct user inputs, references may be absent but the result says unverified. Synthetic runs use the test fixture registry id and are never added to the material parameter endpoint.

## Response shape

Return request/run ids, created_at, normalized canonical inputs, original request, versions, input_sha256, runtime fingerprint, scalar result, nullable sweep and spatial results, warnings, constraint statuses and registry snapshot. Scalar includes ks, hg, Cg, Cs, keff, J, Da, resistance fractions, regime, nullable growth/thickness. Dimensional outputs carry units; Da and fractions are explicitly dimensionless, and percentage metrics are named. Spatial radial arrays are indexed consistently and include cell edges, equal-area weights, local regimes and area fractions. ntheta is recorded but does not multiply the response data.

## Error semantics

Always `application/json` with `{error:{code,message,request_id,issues,retryable}}`. Each issue has JSON Pointer `path`, machine `code`, human `message`. No stack traces or echoed secrets. Use 400 malformed JSON, 413 payload size, 415 media type, 422 schema/unit/science/constraint/version failure, 429 rate/queue budget, 500 unexpected internal failure, 503 temporary saturation/readiness and 504 calculation deadline. Every non-2xx endpoint response uses the same schema, including transformed FastAPI validation errors. The valid request UUID is echoed; use a generated id if parsing did not reach it.

Example issue codes: `MISSING_PARAMETER`, `INCOMPATIBLE_UNIT`, `OUTSIDE_STUDY_WINDOW`, `NONFINITE_VALUE`, `INVALID_LOCAL_FIELD`, `UNSUPPORTED_VERSION`, `REGISTRY_MISMATCH`, `UNREVIEWED_PARAMETER`, `OUTSIDE_DECLARED_CONSTRAINT`, `WORKLOAD_LIMIT`, `CALCULATION_TIMEOUT`.

## Semantic checks beyond JSON Schema

Resolve units dimensionally; reject numeric strings and nonfinite numbers in strict parsers. Require study window after conversion; sweep bounds order/window; grid product limit; edge exclusion<radius; full-disk gradient positivity and temperature endpoints; material/basis pairing; trusted literature values; source compatibility; standard flow reference conditions; result lengths and dimensionless sums. Machine schema validity alone is not scientific validity.

## Contract workflow

Implement strict Pydantic models matching the committed contract. Generate OpenAPI from the application and compare a normalized representation in CI, ignoring only documented generated metadata. Generate TS types from the reviewed OpenAPI. Never maintain competing hand-coded types without a drift check. Contract tests cover both successes and every error status, null behavior and unknown-field rejection. API examples are fixtures, not a backend implementation.

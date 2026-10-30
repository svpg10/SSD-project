# Data schemas and storage rules

`schemas/cvd-studio.schema.json` contains reusable strict definitions and a root ScenarioRequest schema. Wrapper schemas identify SimulationResponse, ProjectExport, ParameterRegistry and ErrorEnvelope. `$defs` are shared with OpenAPI components. All JSON is UTF-8; null denotes explicitly absent data; nonfinite IEEE values are forbidden.

## Core entities

| Entity | Identity / ownership | Integrity rule |
|---|---|---|
| ScenarioRequest | client request_id | immutable copy saved with each result |
| SimulationResponse | server run_id | result binds to normalized hash and original request |
| RegistrySnapshot | id + version | same version immutable; null parameters stay unresolved |
| ParameterRecord | stable parameter id | source locator, applicability and reviewer required for promotion |
| ProjectExport | schema_version + project_id | includes ≤4 saved result snapshots; no credentials |
| ErrorEnvelope | request_id | field issues use JSON Pointer |

## Quantity policy

Inputs support only the units defined per dimension: temperature K/degC, velocity m/s or cm/s, concentration mol/m^3, pressure Pa/Torr, energy J/mol or kJ/mol, conversion m^3/mol, duration s/min, length m/mm. Temperature gradients use K as a difference in a specifically named field. Output units are canonical SI, with the one explicitly named display growth field in nm/min. Add units through a reviewed schema change, not free-form interpretation. sccm is flow metadata with required standard T and P; no transport calculation consumes it.

## Canonicalization

Normalize quantities to SI using Pint; retain original unit/value in original_request. Canonical computational payload includes normalized inputs, selected branches, model id and registry snapshot id/version/hash. Exclude request_id, run_id, created_at, notes and runtime timing. Sort object keys recursively, arrays retain order, serialize finite JSON numbers using a documented Python canonical serializer with no insignificant whitespace, normalize negative zero to zero and hash UTF-8 with SHA-256. Record `canonicalization_version=python-json-v1`. The backend owns this hash; clients do not independently reproduce floating-point conversions. A portable RFC 8785 format can be a later explicit migration.

## Export validation

Validate schema and semantic invariants on import; enforce size cap before parsing; disallow external `$ref` fetching from user imports. Reject unexpected keys and unsupported versions. Preserve import as data and recompute on the server before showing “recomputed”. A modified response hash does not prove authentic origin; hashing is integrity/reproducibility metadata, not a signature. Do not use imported labels or source URLs as HTML.

## Migration

Versioned pure migration functions, old/new fixtures and explicit user confirmation for project replacement. Preserve original file, migration log and original schema_version in project metadata. If exact model reproduction is unsupported, allow viewing the saved snapshot with a prominent status and offer a new-version recompute; do not silently replace its results.

## Exact hash envelopes

Registry hash: sorted compact UTF-8 JSON of the full registry excluding its `sha256` key. Input hash: sorted compact UTF-8 JSON of `{normalized_inputs, model_id, registry_snapshot}`, with `request_id` and `notes` removed from normalized_inputs. The registry_snapshot in this envelope is its id/version/sha256 reference. See synthetic fixtures for worked values.

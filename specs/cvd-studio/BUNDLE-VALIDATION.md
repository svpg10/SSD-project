# Documentation bundle validation

Finalized 19 October 2026 (Asia/Calcutta). Scope: documentation, machine contracts, mathematical fixtures, design-token contrast and archive integrity. The web application has not been implemented, deployed or experimentally validated by this archive.

## Passed before packaging

The included verifier passed **89 checks** before manifest creation:

- 23 JSON files parsed with duplicate-key and nonfinite-constant rejection.
- Six JSON Schema files passed Draft 2020-12 meta-schema validation.
- Eleven typed examples and the unresolved material registry matched their schemas; wrapper references resolved locally.
- OpenAPI 3.1.1 passed structural validation, and its component definitions matched the standalone JSON Schema definitions.
- Six deliberately invalid request variants were rejected by the schemas.
- Material-specific parameters and unspecified gas-flow/pressure bounds remained null.
- Registry self-hashes and synthetic normalized-input hashes matched.
- Independent scalar arithmetic, radial sample values, area mean, population sigma, equal-area cells and zero-mean/null behavior matched the documented fixtures.
- All 50 specified light/dark color-token contrast pairs passed their thresholds. This is a token-pair check, not an application accessibility audit.
- Local Markdown links resolved inside the bundle and fenced code blocks were balanced.

Validation tools: standard CPython 3.13.3, jsonschema 4.26.0 and openapi-spec-validator 0.9.0. These are documentation verification tools, not a tested application dependency matrix. The repeatable verifier and tool requirements are in `scripts/`.

## Packaging verification

`MANIFEST.json` lists SHA-256 hashes and byte sizes for every payload file except the manifest itself. The final ZIP was checked for CRC errors, safe relative paths, exact file coverage and byte-for-byte agreement with the payload. A SHA-256 checksum for the ZIP is provided beside it.

## Scientific and implementation status

The original user-supplied PS-64 image is included. Real material kinetics, growth-conversion data, precursor identities, reactor geometry and numerical pressure/flow bounds remain unresolved. Synthetic fixtures are clearly labeled arbitrary mathematical examples. Future application acceptance items remain unchecked; performance, browser accessibility, security implementation, deployment and experimental validation still require the evidence specified in the documentation.

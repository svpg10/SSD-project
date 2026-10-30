# CVD Studio implementation

Follow the authority order in `specs/cvd-studio/README.md`. Keep that provided package unchanged. No invented material constants, process bounds, sources or experimental claims. Read `docs/DECISIONS.md` before changing numerical behavior.

Python is the scientific authority. Domain modules contain no HTTP/database imports. Generated models/types/validator must be regenerated, not edited by hand. Preserve immutable snapshots, provenance watermarks, original units and normalized hash envelopes.

Run `npm run verify` and production Playwright checks for meaningful changes. Update evidence/traceability honestly, distinguishing local correctness, target-host operational tests and experimental validation. Do not publish or introduce paid services without explicit authorization.

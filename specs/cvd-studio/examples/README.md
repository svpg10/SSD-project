# Example policy

All numerical scenario/request/response files here are **synthetic mathematical fixtures**, not published material data. ks=2, hg=3, Cg=5, beta=0.01 and duration=2 were chosen solely for transparent arithmetic. Their magnitudes are intentionally unrelated to LPCVD. Never promote them into real material presets. Timestamps/UUIDs are fixed fixture identifiers, not evidence of an application execution. Runtime fields explicitly identify documentation fixtures.

Scalar expected flux=6 mol/(m² s); spatial Cg-only gradient gives four sampled fluxes 6.15,6.45,6.75,7.05 and mean 6.6; zero-flux response has null CV and half-range and missing growth conversion. The Arrhenius/ideal-gas request demonstrates tagged branches but has no fabricated scientific response. The included project export groups three complete response snapshots. `capabilities.json` is an example of intended API policy.

Registry sha256 hashes sorted compact UTF-8 JSON excluding the sha256 field itself. Input hash hashes `{normalized_inputs,model_id,registry_snapshot}`, where normalized_inputs excludes request_id and notes. This exact envelope is authoritative for python-json-v1. Field order in displayed JSON files is immaterial. Response fixtures are checked as documentation data; they are not a delivered simulation engine.

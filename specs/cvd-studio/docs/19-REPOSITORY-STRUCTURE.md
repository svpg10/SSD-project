# Recommended application repository structure

The archive itself is a documentation bundle; below is the target code repository, not a claim that these files exist yet.

```text
cvd-studio/
  README.md
  AGENTS.md
  package.json                  # npm workspace + root scripts
  package-lock.json
  pyproject.toml                # backend/workspace tooling
  uv.lock
  .env.example
  .gitignore
  apps/
    web/
      package.json
      src/
        app/                    # /, compare, parameters, learn, about/model
        components/ui/          # reviewed shadcn components
        features/scenario/      # draft/form state and validation
        features/results/       # immutable snapshots, summaries
        features/charts/        # lazy Plotly adapters + HTML tables
        features/registry/
        features/projects/      # import/export, local storage
        lib/api/                # generated client/types
        lib/format/             # presentation only; no physics
        styles/tokens.css
      tests/
      public/fonts/             # self-hosted assets and licenses
    api/
      pyproject.toml
      src/cvd_studio/
        main.py
        api/routes/
        api/schemas/
        api/middleware/
        services/simulation.py
        services/executor.py
        services/constraints.py
        domain/units.py
        domain/kinetics.py
        domain/flux.py
        domain/regimes.py
        domain/sweeps.py
        domain/spatial.py
        domain/metrics.py
        registry/
        config.py
      tests/unit/
      tests/reference/
      tests/contract/
      tests/integration/
  packages/contracts/           # reviewed OpenAPI and JSON schemas
  registry/                     # source and parameter versions
  examples/synthetic/           # never production material presets
  tests/e2e/
  docs/                         # specifications and evidence
  docs/evidence/                # screenshots, benchmark/validation reports
  infra/                        # Dockerfiles, proxy, Compose, deploy/runbooks
  scripts/                      # typegen, schema check, smoke, export verification
  .github/workflows/
  migrations/                   # optional PostgreSQL release only
```

Keep generated types identified and regenerated from contracts; do not hand-edit them. Separate true source registry from test fixtures. Keep scientific tests independent of API dependencies. Store no environment secrets, real user exports or private measurements in public fixtures.

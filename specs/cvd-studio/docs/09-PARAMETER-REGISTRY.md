# Literature and parameter registry

Machine-readable files: [parameters.json](../registry/parameters.json), [constraints.json](../registry/constraints.json), [sources.json](../registry/sources.json). Every unknown scientific value is JSON null. `null` means missing; zero is a measured/user value only when physically allowed.

## Required records

Separate polysilicon and Si₃N₄ records for A, Ea, hg, beta and optional film molar mass/density/yield used to justify beta. Record precursor identity, co-reactants, film composition/phase, geometry and reactor context, temperature/pressure/flow applicability, reaction order, units and source status. None of those is supplied in sufficient detail to populate a real preset.

| Parameter | Canonical unit | Initial state | Resolution requirement |
|---|---|---|---|
| A | m/s | null | First-order coefficient on the same concentration basis |
| Ea | J/mol | null | Paired kinetic law and valid temperature range |
| hg | m/s | null | Measured/sourced effective transport or explicit user coefficient |
| beta | m³/mol | null | Film composition and precursor-to-film conversion |
| film density | kg/m³ | null | Phase, porosity and measurement conditions |
| film molar mass | kg/mol | null | Exact formula-unit definition |
| yield | mol/mol | null | Stoichiometry and limiting-precursor basis |
| pressure min/max | Pa | null | Source range and reactor/chemistry applicability |
| flow min/max | sccm | null | Source range, standard T/P and gas identity |

## Promotion workflow

1. Find a primary paper or authoritative process record; capture DOI/URL and exact page, table, figure or equation. Search results or AI summaries are not parameter evidence.
2. Record original value/unit and condition range; transcribe without altering the source. Store conversion notes and normalized value.
3. Check chemistry, substrate, deposition method, pressure, geometry and first-order applicability. A published rate constant may have different units and cannot simply be relabeled m/s.
4. Have a scientific reviewer verify the transcription and applicability. Record reviewer/date and status `reviewed`; this is not experimental validation of CVD Studio.
5. Version the registry and rerun unit/fixture checks. Recompute sample outputs only after explicit review. Preserve prior registry snapshots in saved results.

## Record status and provenance

`missing` → no value. `user_supplied` → explicitly entered, unverified. `candidate` → sourced but not reviewed. `reviewed` → reviewed transcription and applicability. None may be called `experimentally_validated` without a separate model validation record. `synthetic_fixture` belongs only under examples/test fixtures, not real material presets.

Required bibliographic fields when populated: source id, title, authors or institutional author, year, DOI/URL, locator, access date, licensing/reuse note, chemistry/conditions, original quantity, conversion, uncertainty if actually reported, reviewer and limitations. Missing uncertainty stays null, not 0. Do not fabricate a DOI or use the IUPAC Arrhenius definition as evidence for a polysilicon A or Ea.

## Source scope

PS-64 supports the assignment scope only. IUPAC supports the Arrhenius form; NIST supports R. Framework and accessibility sources support implementation standards. This package deliberately supplies no unverified CVD kinetic bibliography. Material literature search leads are recorded as tasks with null citations until verified.

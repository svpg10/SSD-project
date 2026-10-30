# Product requirements

## Problem and purpose

Students can plot a rate formula yet miss the difference between surface reaction, transport resistance, precursor flux and film growth. A convincing uniformity visualization can also hide assumptions the source problem never specified. CVD Studio makes those relationships inspectable and reproducible.

Primary users are students completing PS-64, instructors reviewing the derivation, and exploratory research users entering their own documented coefficients. The initial release supports individual local workflows. Collaboration and authenticated saved work are later scope.

## Outcomes

| ID | Outcome | Completion evidence |
|---|---|---|
| P-01 | Explain and evaluate the supplied equation | Worked derivation, SI output, tested limiting cases |
| P-02 | Study 600–750°C and regimes | Temperature plot, table, Da and resistance fractions |
| P-03 | Explore uniformity honestly | Disclosed extension, equal-area statistics, null handling |
| P-04 | Reproduce a run | Versioned input/result snapshot plus provenance export |
| P-05 | Understand missing evidence | Incomplete material presets and explicit unknown constraints |
| P-06 | Use the workbench accessibly | Keyboard and screen-reader review plus responsive screenshots |

## Release scope

Material templates; explicit direct or Arrhenius ks; direct hg; direct Cg or ideal-gas Cg; optional beta and duration; temperature sweep; scalar regime analysis; prescribed radial fields; comparison of up to four compatible snapshots; JSON project export/import; CSV tables; source and assumption inspector. Include flux vs temperature for every valid run and thickness growth vs temperature only when beta is present.

Excluded from baseline: CFD, real gas chemistry networks, multireactant nitride kinetics, nucleation, stress, conformality, particles, wafer-batch depletion, process optimization, uncertainty estimation without distributions, reactor control, payment and team workspaces. Explain these omissions at the point of use when relevant.

## User journeys

1. **Learn:** Open `/learn`; inspect equation and units; open synthetic demonstration; run; explore limiting behavior; view table; export a clearly labeled synthetic artifact.
2. **Manual study:** Choose polysilicon or nitride; see missing parameters; enter coefficients and provenance; choose concentration branch; inspect unknown process constraints; run; sweep; compare. Editing any input marks prior output stale.
3. **Uniformity extension:** Start from a valid run; enable radial fields; enter radius, edge exclusion and assumed gradients; inspect local field minima/maxima; run; view map, radial table and area-weighted statistics; export assumptions.
4. **Reproduce:** Import JSON; server validates schema/version/semantics; show changes to current form; user confirms replacement; recompute with pinned model if supported; warn if original version cannot be reproduced.

## Unhappy paths

Incomplete material preset → show missing fields and allow synthetic demo. Wrong units → inline explanation and server error. Invalid local temperature → reject all results, identify offending cell/field. Timeout → preserve draft and last successful snapshot, offer smaller workload. Registry source inaccessible → preserve citation metadata and mark verification pending. Export failure → leave results intact and offer retry. Unsupported import version → explain supported versions without destructive migration.

## Success measures

Product targets, to be measured during usability testing: a new user completes a synthetic run and export within five minutes; all users can identify synthetic vs sourced data in a five-person formative study; no unresolved critical task blocker. These are targets, not measured claims. Scientific accuracy is assessed separately against independent validation data when available.

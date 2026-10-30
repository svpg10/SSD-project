# PS-64 source brief and evidence boundary

## Recovered source

User reference: ChatGPT conversation “Packaging Ideaathon Topic”, id `6abea173-f3ac-83ee-8306-87224b5860b9`. The retrieved chat includes the attached PS-64 image. Original assistant messages were returned as content references, so no hidden text from those responses is treated as a requirement. The current user's explicit stack and requested deliverables control this package.

See [the original image](../references/PS-64-original.png). Its integrity hash is in `MANIFEST.json`. Transcription of the small supplied problem statement:

| Field | Supplied content |
|---|---|
| Title | PS-64 Chemical Vapor Deposition (CVD) Thin-Film Uniformity Modeling |
| Category | Advanced Topics |
| Syllabus mapping | Unit 5 – Thin-Film Deposition |
| Core physics concepts | Mass transfer coefficient hg, surface reaction rate constant ks, stagnant boundary layer, growth rate uniformity |
| Specifications | Polysilicon / Si₃N₄ LPCVD deposition; temperature range 600°C–750°C; gas flow rate and pressure constraints |
| Design scope | Formulation of deposition rate equation r = [ks hg / (ks + hg)] Cg; identifying reaction-rate limited vs. mass-transfer limited regimes; plotting growth rate vs. temperature |

The image gives no numeric gas-flow/pressure bounds, precursor identity, reactor dimensions, deposition time, material parameter values or validation dataset. Retain this distinction in labels and documents. The image alone does not define a spatial solver or a film-thickness conversion.

## Evidence classes

- **Supplied fact:** PS-64 material scope, window, equation and required outputs.
- **Scientific convention/derivation:** unit-consistent flux interpretation, resistance-in-series derivation and limiting behavior; derivations are shown in the scientific specification.
- **Product choice:** architecture, regime thresholds, computational caps, UX, roadmap and target performance. These are not experimental facts.
- **Proposed extension:** local radial field model. Its coefficients are user-entered assumptions unless later measured.
- **Unresolved:** material constants, process limits and experimental accuracy thresholds. All start null.

## Scope boundaries

The app is an educational and exploratory scientific model, not a qualified process recipe generator. It must not connect to reactor controls. No claim that a temperature range is sufficient to deposit either material under every chemistry is supported by this brief.

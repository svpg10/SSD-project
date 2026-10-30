export const metadata={title:'Model & assumptions'};
export default function Model() {
  return (
    <div className="reading">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SCIENTIFIC STATUS / VERSION POLICY</span>
          <h1>A transparent local model.</h1>
          <p>
            Verified equations, explicit assumptions, unresolved material
            evidence.
          </p>
        </div>
      </div>
      <article className="panel">
        <h2 style={{ marginTop: 0 }}>cvd-resistance-v1 · schema 1.0.0</h2>
        <p>
          Steady state, first-order effective surface sink, one limiting
          precursor, and gas-side and surface resistances in series. The Python
          service owns all scientific calculations. Inputs use allowlisted units
          and normalize to SI with Pint.
        </p>
        <h2>Applicability boundaries</h2>
        <ul>
          <li>
            No transient chemistry, nucleation, gas-phase reactions, stress or
            conformality.
          </li>
          <li>
            Direct hɡ is fixed. Flow is metadata, with standard conditions
            recorded when supplied.
          </li>
          <li>
            Direct Cɡ is pressure independent. Ideal-gas Cɡ depends on y, P and
            independent Tɡ.
          </li>
          <li>
            β, if supplied, is fixed in temperature and space. Duration
            multiplies a constant local growth rate.
          </li>
          <li>
            Si₃N₄ uses an effective one-precursor simplification; real
            multireactant kinetics are unresolved.
          </li>
          <li>
            The assignment window is not a process safety or deposition
            feasibility certification.
          </li>
        </ul>
        <h2>prescribed-radial-v1</h2>
        <p>
          Local profiles use q = (ρ/R)²: Tₛ = T₀ + ΔTq; Cɡ = C₀(1 + aCq); hɡ =
          h₀(1 + ahq). Gradients refer to the physical edge, including any
          excluded region. Equal-area cell centers use ρᵢ = (R−e)√[(i+½)/nᵣ].
          Angular sectors repeat radial values for display.
        </p>
        <p>
          Mean and population σ use equal area weights. CV = 100σ/mean;
          half-range = 100(max−min)/(2mean). Min and max are sampled cell-center
          extrema. Zero mean makes both normalized metrics unavailable.
        </p>
        <h2>What verification establishes</h2>
        <p>
          Independent arithmetic references, limiting cases, unit conversion
          checks, analytic area-weighted oracles and numerical reference
          integration test the implementation. They do not establish
          applicability to a particular chemistry or experimental agreement.
        </p>
        <p className="notice">
          <strong>Experimental validation pending.</strong> Real-material
          coefficients, precursor identities, geometry, measured process limits
          and independent validation datasets remain unresolved.
        </p>
        <h2>Local data and reproducibility</h2>
        <p>
          No accounts, server project storage or analytics are used. Drafts and
          comparison snapshots live in this browser tab until it closes or
          reloads. Download project JSON to retain them. Each result preserves
          original inputs, normalized inputs, versions, registry snapshot,
          warnings and a canonical SHA-256 input hash. Hashes are
          reproducibility metadata, not signatures of trusted scientific origin.
        </p>
        <h2>Workload policy</h2>
        <p>
          1 MiB simulation requests; 16 MiB project files; 501 sweep points; 256
          radial cells × 256 display sectors; four active calculations and
          sixteen waiting slots; five-second calculation deadlines. Models do
          not accept arbitrary expressions or execute imported files.
        </p>
        <h2>Change discipline</h2>
        <p>
          Changing equations, coupling policies, metrics or applicability
          requires a model version change and new reference evidence. Saved
          snapshots are immutable. Input edits mark prior results stale; exports
          remain bound to the snapshot that generated them.
        </p>
      </article>
    </div>
  );
}

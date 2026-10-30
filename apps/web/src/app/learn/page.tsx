import Link from "next/link";
import Image from "next/image";
export const metadata = { title: "Learn the model" };
export default function Learn() {
  return (
    <div className="reading">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE MODEL / STEP BY STEP</span>
          <h1>Two resistances. One local flux.</h1>
          <p>Read the equation before interpreting the plot.</p>
        </div>
      </div>
      <article className="panel">
        <figure className="learning-illustration">
          <Image
            src="/images/reactor.webp"
            width={1536}
            height={1024}
            alt="Conceptual 3D quartz reactor and silicon wafer boat"
            sizes="(max-width: 767px) 90vw, 800px"
          />
          <figcaption>
            Reactor context · conceptual illustration, not an instrument
            specification.
          </figcaption>
        </figure>
        <h2 style={{ marginTop: 0 }}>The resistance-in-series equation</h2>
        <p>
          At steady state, the precursor reaching the surface through a stagnant
          gas film is consumed by a first-order surface reaction. Both processes
          carry the same molar flux.
        </p>
        <div
          className="equation"
          aria-label="J equals h g times C g minus C s equals k s times C s"
        >
          J = hɡ (Cɡ − Cₛ) = kₛ Cₛ
        </div>
        <p>
          Solving for the surface concentration gives Cₛ = hɡ Cɡ / (kₛ + hɡ).
          Substitution gives the PS-64 equation:
        </p>
        <div
          className="equation"
          aria-label="r equals k s h g divided by k s plus h g, times C g"
        >
          r = J = [kₛ hɡ / (kₛ + hɡ)] Cɡ
        </div>
        <p>
          kₛ and hɡ are in m/s; Cɡ is in mol/m³. Therefore r is{" "}
          <strong>precursor-consumption molar flux</strong>, in mol m⁻² s⁻¹. It
          is not a film thickness rate.
        </p>
        <h2>Which resistance controls the result?</h2>
        <p>
          The Damköhler ratio Da = kₛ / hɡ compares the two coefficients. The
          following thresholds are classification conventions in model v1:
        </p>
        <ul>
          <li>
            <strong>Da &lt; 0.1:</strong> reaction limited; J approaches kₛ Cɡ.
          </li>
          <li>
            <strong>0.1 ≤ Da ≤ 10:</strong> mixed; both resistances matter.
          </li>
          <li>
            <strong>Da &gt; 10:</strong> mass-transfer limited; J approaches hɡ
            Cɡ.
          </li>
        </ul>
        <h2>Temperature is an explicit dependency</h2>
        <p>
          The Arrhenius branch uses kₛ = A exp(−Eₐ / RTₛ), with absolute
          substrate temperature in kelvin. The direct-coefficient branch has no
          temperature dependence. The ideal-gas concentration branch uses
          independent gas temperature Tɡ; it stays fixed during a Tₛ sweep.
        </p>
        <h2>Flux becomes film growth only with β</h2>
        <p>
          Growth in m/s equals βJ. β must include film composition, density and
          precursor-to-film stoichiometry, in m³ per mole of precursor.
          Multiplying by 60 × 10⁹ converts m/s to nm/min. A duration is also
          required for thickness.
        </p>
        <h2>Spatial appearance is not reactor physics</h2>
        <p>
          The optional radial extension prescribes temperature, concentration
          and transport profiles. Equal-area cells sample local flux. It solves
          no flow, diffusion or species-conservation equation. CV and half-range
          measure different sampled-field variations; neither is an experimental
          uncertainty interval.
        </p>
        <p className="notice">
          PS-64 supplies the 600–750°C study window and equation. It supplies no
          numeric pressure/flow limits or material coefficients. No experimental
          validation data is available.
        </p>
        <p>
          <Link href="/workbench">
            Open the workbench and use the synthetic demonstration →
          </Link>
        </p>
        <h2>Original supplied problem statement</h2>
        {/* User-provided small source image: preserve original pixels. */}
        <img
          src="/ps-64.png"
          width={605}
          height={182}
          alt="PS-64: polysilicon or silicon nitride LPCVD; 600–750 degrees Celsius; resistance-in-series deposition equation and limiting regimes. No numeric pressure or flow bounds are provided."
        />
      </article>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  MoveDown,
  Waves,
  ChartNoAxesCombined,
  Layers3,
} from "lucide-react";
import { Wafer } from "./wafer";

export function Landing() {
  return (
    <div className="landing">
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="kicker">
            <span /> A CLOSER LOOK AT THIN FILMS
          </span>
          <h1 id="hero-title">
            Small scale.
            <br />
            <em>Deeper insight.</em>
          </h1>
          <p>
            Explore what happens between gas and surface. A transparent
            workspace for chemical vapor deposition, from the first equation to
            your next study.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/workbench">
              Enter the studio <ArrowUpRight size={20} />
            </Link>
            <Link className="text-link" href="/learn">
              Explore the science <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span>PS-64 / LPCVD</span>
            <span>600–750°C study window</span>
          </div>
        </div>
        <Wafer />
      </section>
      <div className="landing-rule">
        <span>BUILT AROUND THE SCIENCE</span>
        <span>Explore. Understand. Reproduce.</span>
        <a href="#inside" aria-label="Explore inside the studio">
          <MoveDown size={18} />
        </a>
      </div>
      <section
        className="science-story"
        id="inside"
        aria-labelledby="science-title"
      >
        <div>
          <span className="eyebrow">01 / THE STARTING POINT</span>
          <h2 id="science-title">
            Two resistances.
            <br />
            One clear picture.
          </h2>
          <p>
            Surface kinetics and gas-side transport work together. See which one
            controls precursor flux, and how that balance changes with your
            inputs.
          </p>
          <Link className="text-link" href="/learn">
            Understand the model <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="formula-exhibit">
          <span>THE RESISTANCE-IN-SERIES MODEL</span>
          <div className="formula-large">
            J ={" "}
            <span>
              <b>kₛ · hɡ</b>
              <i>kₛ + hɡ</i>
            </span>{" "}
            Cɡ
          </div>
          <div className="formula-key">
            <span>
              <i /> Surface kinetics
            </span>
            <span>
              <i /> Gas transport
            </span>
          </div>
          <p>
            Precursor molar flux · mol m⁻² s⁻¹
            <br />
            Film growth requires an explicit conversion factor β.
          </p>
        </div>
      </section>
      <section className="exploration-section" aria-labelledby="explore-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / INSIDE THE STUDIO</span>
            <h2 id="explore-title">Follow your curiosity.</h2>
          </div>
          <p>
            From a single coefficient
            <br />
            to the whole study.
          </p>
        </div>
        <div className="exploration-grid">
          <Link href="/workbench" className="exploration-card">
            <div className="mini-visual temperature-visual" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <span className="card-index">
              01 <ChartNoAxesCombined size={18} />
            </span>
            <h3>Watch the balance shift.</h3>
            <p>
              Trace precursor flux across temperature and identify the
              controlling regime.
            </p>
            <span className="card-link">
              Temperature sweeps <ArrowUpRight size={18} />
            </span>
          </Link>
          <Link href="/workbench" className="exploration-card">
            <div className="mini-visual radial-visual" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <span className="card-index">
              02 <Waves size={18} />
            </span>
            <h3>See the spatial story.</h3>
            <p>
              Explore prescribed radial fields, local variation and
              area-weighted statistics.
            </p>
            <span className="card-link">
              Radial exploration <ArrowUpRight size={18} />
            </span>
          </Link>
          <Link href="/compare" className="exploration-card">
            <div className="mini-visual layers-visual" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="card-index">
              03 <Layers3 size={18} />
            </span>
            <h3>Keep the full context.</h3>
            <p>
              Compare immutable studies with their inputs, assumptions and
              provenance intact.
            </p>
            <span className="card-link">
              Study comparison <ArrowUpRight size={18} />
            </span>
          </Link>
        </div>
      </section>
      <section className="reactor-story" aria-labelledby="reactor-title">
        <div className="reactor-image">
          <Image
            src="/images/reactor.webp"
            alt="Conceptual 3D illustration of a quartz deposition chamber containing a boat of silicon wafers"
            width={1536}
            height={1024}
            sizes="(max-width: 767px) 100vw, 55vw"
          />
          <span>CONCEPTUAL REACTOR ILLUSTRATION</span>
        </div>
        <div>
          <span className="eyebrow">03 / SCIENTIFIC CLARITY</span>
          <h2 id="reactor-title">
            The assumptions
            <br />
            stay in the picture.
          </h2>
          <p>
            Every result carries its inputs, units and model version. Missing
            material values stay visible. Synthetic demonstrations are always
            labeled.
          </p>
          <p className="small">
            The radial extension prescribes local fields. It does not solve
            reactor flow or mass balance. Experimental validation is pending.
          </p>
          <Link className="text-link" href="/about/model">
            Read the assumptions <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="landing-cta">
        <span className="eyebrow">YOUR NEXT STUDY STARTS HERE</span>
        <h2>Make the model yours.</h2>
        <p>
          Bring documented parameters, or explore with a clearly labeled
          synthetic example.
        </p>
        <Link className="button primary" href="/workbench">
          Open the workbench <ArrowUpRight size={20} />
        </Link>
      </section>
      <footer className="landing-footer">
        <Link href="/" className="footer-brand">
          CVD Studio<span>A workspace for scientific curiosity.</span>
        </Link>
        <div>
          <Link href="/parameters">Material library</Link>
          <Link href="/about/model">Model & assumptions</Link>
          <span>PS-64 · Model v1</span>
        </div>
      </footer>
    </div>
  );
}

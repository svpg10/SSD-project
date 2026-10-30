"use client";
import { useStudio, emptyDraft } from "@/features/projects/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
export default function Parameters() {
  const { registry, apiError, reload, setDraft } = useStudio();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PARAMETERS / SOURCES / APPLICABILITY</span>
          <h1>Know what is known.</h1>
          <p>Missing values are part of the scientific record.</p>
        </div>
      </div>
      {apiError && (
        <div className="error" role="alert">
          {apiError}
          <Button variant="outline" onClick={reload}>
            Retry
          </Button>
        </div>
      )}
      {!registry && !apiError && (
        <p role="status">Loading read-only parameter registry…</p>
      )}
      <div className="library-grid">
        {(["polysilicon", "silicon_nitride"] as const).map((material) => (
          <section className="panel" key={material}>
            <div className={`material-specimen ${material}`}>
              <Image
                src="/images/wafer.webp"
                width={320}
                height={240}
                alt="Conceptual wafer illustration; no material measurements represented"
              />
              <span>
                {material === "polysilicon" ? "Si" : "Si₃N₄"}
                <small>CONCEPTUAL SPECIMEN</small>
              </span>
            </div>
            <span className="eyebrow">INCOMPLETE MATERIAL TEMPLATE</span>
            <h2>
              {material === "polysilicon"
                ? "Polysilicon"
                : "Silicon nitride · Si₃N₄"}
            </h2>
            <p>
              No material-specific kinetics, transport, conversion or
              experimental data were supplied. All real-material values remain
              null.
            </p>
            {registry && (
              <div
                className="table-scroll"
                role="region"
                aria-label={`${material} parameters`}
                tabIndex={0}
              >
                <table>
                  <caption>Registry {registry.version}</caption>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                      <th>Unit / status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registry.parameters
                      .filter((p) => p.material === material)
                      .map((p) => (
                        <tr key={p.id}>
                          <th>{p.symbol}</th>
                          <td>{p.value === null ? "Unresolved" : p.value}</td>
                          <td>
                            {p.unit} · {p.status}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            <Button asChild variant="outline">
              <Link
                href="/workbench"
                onClick={() => setDraft({ ...emptyDraft, material })}
              >
                Enter documented user values →
              </Link>
            </Button>
          </section>
        ))}
      </div>
      {registry && (
        <section className="panel" style={{ marginTop: 24 }}>
          <div className="panel-heading">
            <h2>Source inspector</h2>
            <span className="badge">{registry.scientific_status}</span>
          </div>
          <div className="panel-content">
            {registry.sources.map((s) => (
              <details key={s.id}>
                <summary>{s.title ?? s.id}</summary>
                <p className="small">{s.scope}</p>
                <p className="small">
                  {s.authors} · {s.year} · {s.locator ?? "Locator unresolved"}
                </p>
                {s.url && /^https?:\/\//.test(s.url) && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    Open source ↗
                  </a>
                )}
              </details>
            ))}
            <p className="notice">
              General scientific definitions do not supply material constants.
              Literature mode stays unavailable until coefficients and
              applicability have been reviewed in the trusted registry.
            </p>
            <code className="hash">SHA-256 {registry.sha256}</code>
          </div>
        </section>
      )}
    </>
  );
}

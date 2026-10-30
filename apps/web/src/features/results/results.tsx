"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Data } from "plotly.js";
import {
  ArrowDownToLine,
  Bookmark,
  Check,
  ChartNoAxesCombined,
  Table2,
  Info,
} from "lucide-react";
import { useStudio } from "@/features/projects/store";
import {
  isStale,
  project,
  download,
  exportCsv,
} from "@/features/projects/state";
import { Button } from "@/components/ui/button";
import { num, regime } from "@/lib/format";
import type { Result, Spatial } from "@/lib/api/types";
const Plot = dynamic(
  () => import("@/features/charts/plot").then((m) => m.Plot),
  {
    ssr: false,
    loading: () => (
      <div className="chart-loading" role="status">
        Loading interactive chart…
      </div>
    ),
  },
);
export function Provenance({ result: r }: { result: Result }) {
  return (
    <span
      className={`badge ${r.original_request.basis === "synthetic" ? "synthetic" : ""}`}
    >
      {r.original_request.basis === "synthetic"
        ? "Synthetic demonstration"
        : "User supplied · unverified"}
    </span>
  );
}
function ScalarTable({ r }: { r: Result }) {
  return (
    <div
      className="table-scroll"
      role="region"
      aria-label="Scalar result data"
      tabIndex={0}
    >
      <table>
        <caption>Scalar result · {r.original_request.basis}</caption>
        <thead>
          <tr>
            <th scope="col">Quantity</th>
            <th scope="col">Value</th>
            <th scope="col">Unit</th>
          </tr>
        </thead>
        <tbody>
          {(
            [
              "ks",
              "hg",
              "Cg",
              "Cs",
              "keff",
              "flux",
              "growth",
              "growth_nm_min",
              "thickness",
            ] as const
          ).map((key) => (
            <tr key={key}>
              <th scope="row">{key}</th>
              <td>{num(r.scalar[key]?.value)}</td>
              <td>{r.scalar[key]?.unit ?? "Not available"}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Da</th>
            <td>{num(r.scalar.Da)}</td>
            <td>dimensionless</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
function Sweep({ r }: { r: Result }) {
  const [view, setView] = useState("chart"),
    [observable, setObservable] = useState("flux");
  if (!r.sweep) return null;
  const points = r.sweep.points;
  const growth = observable === "growth" && r.scalar.growth !== null;
  const data: Data[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      x: points.map((p) => p.temperature.value - 273.15),
      y: points.map((p) =>
        growth ? (p.result.growth_nm_min?.value ?? null) : p.result.flux.value,
      ),
      line: { color: "#00887f", width: 2 },
      marker: { size: 3 },
      name: r.original_request.basis,
    },
  ];
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">TEMPERATURE STUDY</span>
          <h2>{growth ? "Film growth" : "Precursor flux"} vs temperature</h2>
        </div>
        <div className="segmented" aria-label="Temperature data view">
          <Button
            variant="ghost"
            aria-pressed={view === "chart"}
            onClick={() => setView("chart")}
          >
            <ChartNoAxesCombined size={16} />
            Chart
          </Button>
          <Button
            variant="ghost"
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
          >
            <Table2 size={16} />
            Table
          </Button>
        </div>
      </div>
      <div className="panel-content">
        <div className="chart-controls">
          <label htmlFor="observable">Observable</label>
          <select
            id="observable"
            value={growth ? 'growth' : 'flux'}
            onChange={(e) => setObservable(e.target.value)}
          >
            <option value="flux">Precursor molar flux</option>
            {r.scalar.growth && (
              <option value="growth">Film growth (β supplied)</option>
            )}
          </select>
        </div>
        <p className="small">
          {points.length} samples · Only substrate temperature changes. hɡ, Cɡ,
          Tɡ and β are fixed.{" "}
          {r.original_request.kinetics.mode === "direct"
            ? "Direct kₛ produces a flat sweep."
            : "Arrhenius kₛ is re-evaluated at each temperature."}
        </p>
        {view === "chart" ? (
          <Plot
            data={data}
            title="Temperature sweep"
            xTitle="Substrate temperature (°C)"
            yTitle={growth ? "Growth (nm/min)" : "Precursor flux (mol m⁻² s⁻¹)"}
          />
        ) : (
          <div
            className="table-scroll tall"
            tabIndex={0}
            role="region"
            aria-label="Temperature sweep data"
          >
            <table>
              <caption>
                Temperature sweep · {r.original_request.basis} · fixed Tɡ
              </caption>
              <thead>
                <tr>
                  <th>Tₛ (°C)</th>
                  <th>Flux (mol m⁻² s⁻¹)</th>
                  <th>Growth (nm/min)</th>
                  <th>Da</th>
                  <th>Regime</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, i) => (
                  <tr key={i}>
                    <td>{num(p.temperature.value - 273.15)}</td>
                    <td>{num(p.result.flux.value)}</td>
                    <td>{num(p.result.growth_nm_min?.value)}</td>
                    <td>{num(p.result.Da)}</td>
                    <td>{regime(p.result.regime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="chart-caption">
          <Provenance result={r} /> Model {r.model_id} · displayed values
          rounded; exports retain full precision.
        </p>
      </div>
    </section>
  );
}
function radialData(s: Spatial): Data[] {
  const radius: number[] = [],
    base: number[] = [],
    theta: number[] = [],
    colors: number[] = [],
    width: number[] = [];
  for (let i = 0; i < s.nr; i++)
    for (let j = 0; j < s.ntheta; j++) {
      radius.push(
        (s.radial_cell_edges_m[i + 1] - s.radial_cell_edges_m[i]) * 1000,
      );
      base.push(s.radial_cell_edges_m[i] * 1000);
      theta.push(((j + 0.5) * 360) / s.ntheta);
      width.push(360 / s.ntheta);
      colors.push(s.points[i].result.flux.value);
    }
  return [
    {
      type: "barpolar",
      r: radius,
      base,
      theta,
      width,
      marker: {
        color: colors,
        colorscale: [
          [0, "#e5f7f3"],
          [0.5, "#4ab8a8"],
          [1, "#00544f"],
        ],
        line: { width: 0 },
        colorbar: { title: { text: "Flux<br>mol m⁻² s⁻¹" }, thickness: 14 },
      },
      hovertemplate:
        "Radius %{base:.3f} mm<br>Flux %{marker.color:.6g} mol m⁻² s⁻¹<extra>Prescribed fields</extra>",
    } as Data,
  ];
}
function SpatialView({ r }: { r: Result }) {
  const [table, setTable] = useState(false);
  if (!r.spatial) return null;
  const s = r.spatial,
    m = s.metrics;
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">PRESCRIBED RADIAL EXTENSION</span>
          <h2>Local fields & uniformity</h2>
        </div>
        <Button variant="outline" onClick={() => setTable(!table)}>
          {table ? "Show map" : "Show radial table"}
        </Button>
      </div>
      <div className="panel-content">
        <p className="notice">
          <Info size={17} />
          <span>
            Prescribed radial fields; no flow or mass-balance solution.
            Axisymmetric; sectors only repeat radial results for display.
          </span>
        </p>
        <div className="metric-strip">
          <div>
            <small>Area-weighted mean</small>
            <strong>{num(m.mean)}</strong>
            <small>mol m⁻² s⁻¹</small>
          </div>
          <div>
            <small>CV · σ / mean</small>
            <strong>
              {num(m.cv_percent)}
              {m.cv_percent !== null ? "%" : ""}
            </strong>
          </div>
          <div>
            <small>Half-range / mean</small>
            <strong>
              {num(m.half_range_percent)}
              {m.half_range_percent !== null ? "%" : ""}
            </strong>
          </div>
        </div>
        <p className="small">
          Usable radius {num(s.usable_radius.value * 1000)} mm · area{" "}
          {num(s.usable_area.value)} m² · {s.nr} equal-area cells × {s.ntheta}{" "}
          display sectors. Excluded edge{" "}
          {num(r.normalized_inputs.spatial?.edge_exclusion.value)} m. Sampled
          extrema: {num(m.minimum_sampled)}–{num(m.maximum_sampled)} mol m⁻²
          s⁻¹. Population σ: {num(m.population_sigma)}.
        </p>
        {m.mean === 0 && (
          <p className="notice">
            Zero mean: normalized CV and half-range metrics are undefined.
          </p>
        )}
        {table ? (
          <div
            className="table-scroll tall"
            role="region"
            aria-label="Radial field data"
            tabIndex={0}
          >
            <table>
              <caption>
                Equal-area cell-center samples · {r.original_request.basis}
              </caption>
              <thead>
                <tr>
                  <th>ρ (mm)</th>
                  <th>Area weight</th>
                  <th>Tₛ (K)</th>
                  <th>Flux (mol m⁻² s⁻¹)</th>
                  <th>Regime</th>
                </tr>
              </thead>
              <tbody>
                {s.points.map((p, i) => (
                  <tr key={i}>
                    <td>{num(p.rho.value * 1000)}</td>
                    <td>{num(p.area_weight)}</td>
                    <td>{num(p.temperature.value)}</td>
                    <td>{num(p.result.flux.value)}</td>
                    <td>{regime(p.result.regime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Plot
            data={radialData(s)}
            title="Prescribed radial flux map"
            xTitle=""
            yTitle=""
            polar
          />
        )}
        <p className="chart-caption">
          <Provenance result={r} /> CV and half-range are different definitions.
          Increasing angular sectors does not improve radial convergence.
        </p>
        <div className="small">
          Local regime area fractions:{" "}
          {Object.entries(s.regime_area_fractions)
            .map(([key, value]) => `${regime(key)} ${num(100 * value)}%`)
            .join(" · ")}
        </div>
      </div>
    </section>
  );
}
export function Results() {
  const { last: r, draft, lastKey, saved, save } = useStudio();
  const [exportError, setExportError] = useState("");
  if (!r)
    return (
      <div className="results-column">
        <section className="empty-state panel">
          <Image className="empty-wafer" src="/images/wafer.webp" width={400} height={300} alt="Conceptual 3D silicon wafer on a graphite pedestal" sizes="(max-width: 767px) 80vw, 400px" />
          <span className="eyebrow">YOUR MODEL, MADE VISIBLE</span>
          <h2>Start with the resistances.</h2>
          <p>
            Explore how surface reaction and gas transport work together to set
            precursor flux.
          </p>
          <div
            className="equation-diagram"
            aria-label="Two resistances in series: surface reaction and gas-side transport"
          >
            <div>
              <span>Surface reaction</span>
              <strong>1 / kₛ</strong>
            </div>
            <span className="connection">+</span>
            <div>
              <span>Gas-side transport</span>
              <strong>1 / hɡ</strong>
            </div>
          </div>
          <div className="equation">
            r = <span>kₛ hɡ / (kₛ + hɡ)</span> Cɡ
          </div>
          <p className="small">
            r is precursor molar flux, in mol m⁻² s⁻¹.
            <br />
            Film growth requires an explicit conversion factor β.
          </p>
          <div className="empty-steps">
            <span>
              <b>1</b> Enter documented values or load the synthetic demo
            </span>
            <span>
              <b>2</b> Run the backend calculation
            </span>
            <span>
              <b>3</b> Inspect, compare and export a reproducible snapshot
            </span>
          </div>
        </section>
        <section className="panel">
          <div className="panel-content">
            <h3>Evidence stays beside the result</h3>
            <p>
              Real material parameters are unresolved. Pressure and flow
              compliance remain unknown. Synthetic demonstrations are labeled
              throughout.
            </p>
            <a href="/learn">Explore the equation and assumptions →</a>
          </div>
        </section>
      </div>
    );
  const stale = isStale(lastKey, draft);
  const kept = saved.some((s) => s.run_id === r.run_id);
  function exportProject() {
    try {
      download(
        "cvd-" + r!.original_request.basis + "-project.json",
        JSON.stringify(project([r!], "CVD study"), null, 2),
      );
    } catch (e) {
      setExportError(String(e));
    }
  }
  return (
    <div className="results-column">
      {stale && (
        <div className="stale" role="status">
          <strong>Inputs changed.</strong> These results use the previous
          snapshot. Exports retain that snapshot.
        </div>
      )}
      <section className="panel result-summary">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              RESULT SNAPSHOT ·{" "}
              {new Date(r.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <h2>Deposition regime</h2>
          </div>
          <Provenance result={r} />
        </div>
        <div className="panel-content">
          <p className="provenance-note">
            {r.original_request.basis === "synthetic"
              ? "Synthetic numerical demonstration; not material or process data."
              : "User supplied, unverified; experimental validation pending."}
          </p>
          <div className="result-metrics">
            <div className="flux-metric">
              <small>r · Precursor molar flux</small>
              <strong>{num(r.scalar.flux.value)}</strong>
              <span>mol m⁻² s⁻¹</span>
            </div>
            <div className="secondary-metrics">
              <div>
                <small>Film growth</small>
                <strong>{num(r.scalar.growth_nm_min?.value)}</strong>
                <span>
                  {r.scalar.growth ? "nm/min" : "Add β for conversion"}
                </span>
              </div>
              <div>
                <small>Film thickness</small>
                <strong>{num(r.scalar.thickness?.value)}</strong>
                <span>
                  {r.scalar.thickness ? "m" : "Requires β and duration"}
                </span>
              </div>
            </div>
          </div>
          <div className="regime-heading">
            <span className="badge">{regime(r.scalar.regime)}</span>
            <span>
              Da = kₛ / hɡ = <b>{num(r.scalar.Da)}</b>
            </span>
          </div>
          <div className="resistance-bar" aria-hidden="true">
            <span
              style={{
                width: `${100 * r.scalar.surface_resistance_fraction}%`,
              }}
            />
            <span
              style={{ width: `${100 * r.scalar.gas_resistance_fraction}%` }}
            />
          </div>
          <div className="resistance-labels">
            <span>
              Surface resistance{" "}
              <b>{num(100 * r.scalar.surface_resistance_fraction)}%</b>
            </span>
            <span>
              Gas resistance{" "}
              <b>{num(100 * r.scalar.gas_resistance_fraction)}%</b>
            </span>
          </div>
          <p className="small">
            Classification convention: Da &lt; 0.1 reaction limited; 0.1–10
            mixed; Da &gt; 10 mass-transfer limited.
          </p>
          <div className="result-actions">
            <Button variant="outline" onClick={() => save(r)} disabled={kept}>
              {kept ? <Check size={16} /> : <Bookmark size={16} />}{" "}
              {kept ? "Saved to comparison" : "Keep for comparison"}
            </Button>
            <Button variant="outline" onClick={exportProject}>
              <ArrowDownToLine size={16} /> Project JSON
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                try {
                  exportCsv(r);
                } catch (e) {
                  setExportError(String(e));
                }
              }}
            >
              CSV + metadata
            </Button>
          </div>
          {exportError && (
            <p role="alert" className="error">
              {exportError}
            </p>
          )}
        </div>
      </section>
      <Sweep r={r} />
      <SpatialView r={r} />
      <section className="panel">
        <details>
          <summary>Scalar data & normalized values</summary>
          <ScalarTable r={r} />
        </details>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Assumptions & evidence</h2>
          <span className="badge">Limits unknown</span>
        </div>
        <div className="panel-content">
          <div className="constraint-grid">
            {r.constraints.map((c) => (
              <div key={c.kind}>
                <strong>
                  {c.kind} · {c.status}
                </strong>
                <p className="small">{c.reason}</p>
              </div>
            ))}
          </div>
          <details open>
            <summary>Calculation disclosures ({r.warnings.length})</summary>
            <ul className="disclosures">
              {r.warnings.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          </details>
          <details>
            <summary>Immutable input & registry snapshot</summary>
            <p className="small">
              Model {r.model_id} · schema {r.schema_version} · registry{" "}
              {r.registry_snapshot.version}
              <br />
              Input SHA-256 <code className="hash">{r.input_sha256}</code>
            </p>
            <pre>{JSON.stringify(r.original_request, null, 2)}</pre>
          </details>
        </div>
      </section>
      <p className="small verification-note">
        Numerical equations verified by independent tests. Model applicability
        and experimental validation remain separate, unresolved questions.
      </p>
    </div>
  );
}

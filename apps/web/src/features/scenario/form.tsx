"use client";
import { useState, useRef } from "react";
import { Play, RotateCcw, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useStudio,
  demoDraft,
  emptyDraft,
  type Draft,
} from "@/features/projects/store";
import { draftKey } from "@/features/projects/state";
import { makeRequest, missingFields } from "./request";
import type { Result } from "@/lib/api/types";

function Field({
  name,
  label,
  d,
  update,
  units,
  unitKey,
  hint,
  issue,
}: {
  name: string;
  label: string;
  d: Draft;
  update: (k: string, v: string) => void;
  units?: string[];
  unitKey?: string;
  hint?: string;
  issue?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <div className="quantity">
        <input
          id={name}
          name={name}
          type="number"
          step="any"
          value={d[name]}
          onChange={(e) => update(name, e.target.value)}
          aria-invalid={!!issue}
          aria-describedby={
            [hint ? name + "-hint" : "", issue ? name + "-error" : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {units && unitKey ? (
          <select
            aria-label={`${label} unit`}
            value={d[unitKey]}
            onChange={(e) => update(unitKey, e.target.value)}
          >
            {units.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        ) : units ? (
          <span className="unit">{units[0]}</span>
        ) : null}
      </div>
      {hint && <small id={name + "-hint"}>{hint}</small>}
      {issue && (
        <small className="field-error" id={name + "-error"}>
          {issue}
        </small>
      )}
    </div>
  );
}
export function ScenarioForm() {
  const {
    draft: d,
    setDraft,
    cap,
    apiError,
    reload,
    beginRun,
    acceptRun,
  } = useStudio();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [issues, setIssues] = useState<{ path: string; message: string }[]>([]);
  const lock = useRef(false),
    errorRef = useRef<HTMLDivElement>(null);
  const update = (key: string, value: string) => {
    setDraft({ ...d, [key]: value });
    setIssues([]);
  };
  const paths: Record<string, string> = {
    temperature: "/temperature",
    ks: "/kinetics/ks",
    A: "/kinetics/A",
    Ea: "/kinetics/Ea",
    hg: "/mass_transfer_coefficient",
    Cg: "/concentration/Cg",
    pressure: "/concentration/total_pressure",
    y: "/concentration/mole_fraction",
    Tg: "/concentration/gas_temperature",
    beta: "/growth_conversion",
    duration: "/duration",
    start: "/sweep/start",
    stop: "/sweep/stop",
    count: "/sweep/count",
    radius: "/spatial/radius",
    edge: "/spatial/edge_exclusion",
    nr: "/spatial/nr",
    ntheta: "/spatial/ntheta",
    deltaT: "/spatial/delta_T_edge_K",
    aC: "/spatial/concentration_edge_fraction",
    ah: "/spatial/transport_edge_fraction",
  };
  const missing = missingFields(d);
  const field = (
    name: string,
    label: string,
    units?: string[],
    unitKey?: string,
    hint?: string,
  ) => (
    <Field
      key={name}
      {...{ name, label, units, unitKey, hint, d, update }}
      issue={
        issues.find(
          (i) =>
            paths[name] &&
            (i.path.startsWith(paths[name]) || paths[name].startsWith(i.path)),
        )?.message
      }
    />
  );
  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!cap || lock.current || missing.length) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setIssues([]);
    const ticket = beginRun();
    const key = draftKey(d);
    const req = makeRequest(d, cap);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch("/api/v1/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok) {
        setIssues(body.error?.issues ?? []);
        throw new Error(body.error?.message ?? "Calculation failed.");
      }
      acceptRun(ticket, structuredClone(body as Result), key);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.name === "AbortError"
            ? "The local service timed out. Your draft and last result are preserved. Try fewer samples."
            : e.message
          : "Network unavailable. Start the service and retry.",
      );
      setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      clearTimeout(timer);
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="input-panel" onSubmit={run}>
      <div className="panel-heading">
        <h2>Study inputs</h2>
        <span className="eyebrow">SI-AWARE</span>
      </div>
      <div className="input-body">
        <section className="form-section">
          <div className="section-number">
            01 <h3>Material & provenance</h3>
          </div>
          <label htmlFor="material">Study context</label>
          <select
            id="material"
            value={d.material}
            onChange={(e) => {
              setDraft({
                ...emptyDraft,
                material: e.target.value,
                ...(e.target.value === "synthetic" ? demoDraft : {}),
              });
            }}
          >
            <option value="polysilicon">Polysilicon · incomplete</option>
            <option value="silicon_nitride">Si₃N₄ · incomplete</option>
            <option value="synthetic">Synthetic demonstration</option>
          </select>
          {d.material !== "synthetic" ? (
            <div className="notice compact">
              <strong>Material values not supplied</strong>
              <p>
                Enter your documented coefficients. A, Eₐ, hɡ and β remain
                unresolved in the registry.
              </p>
              <span>User supplied · unverified</span>
            </div>
          ) : (
            <div className="notice compact">
              <strong>Synthetic numerical demonstration</strong>
              <p>
                Arbitrary mathematical values, with nonphysical magnitudes. Not
                material or process data.
              </p>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            className="full"
            onClick={() => setDraft({ ...demoDraft })}
          >
            Use synthetic demo <ArrowUpRight size={16} />
          </Button>
        </section>
        <section className="form-section">
          <div className="section-number">
            02 <h3>Temperature & kinetics</h3>
          </div>
          {field(
            "temperature",
            "Substrate temperature",
            ["degC", "K"],
            "temperatureUnit",
            "PS-64 study window: 600–750°C.",
          )}
          <label htmlFor="kinetics">Surface reaction model</label>
          <select
            id="kinetics"
            value={d.kinetics}
            onChange={(e) => update("kinetics", e.target.value)}
          >
            <option value="direct">Direct coefficient kₛ</option>
            <option value="arrhenius">Arrhenius · A exp(−Eₐ / RTₛ)</option>
          </select>
          {d.kinetics === "direct" ? (
            field(
              "ks",
              "Surface reaction coefficient kₛ",
              ["m/s", "cm/s"],
              "ksUnit",
              "Direct kₛ is temperature independent.",
            )
          ) : (
            <>
              {field("A", "Pre-exponential factor A", ["m/s", "cm/s"], "AUnit")}
              {field(
                "Ea",
                "Activation energy Eₐ",
                ["kJ/mol", "J/mol"],
                "EaUnit",
              )}
            </>
          )}
          {field(
            "hg",
            "Mass-transfer coefficient hɡ",
            ["m/s", "cm/s"],
            "hgUnit",
            "Explicit and fixed; not inferred from flow.",
          )}
        </section>
        <section className="form-section">
          <div className="section-number">
            03 <h3>Precursor concentration</h3>
          </div>
          <label htmlFor="concentration">Concentration model</label>
          <select
            id="concentration"
            value={d.concentration}
            onChange={(e) => update("concentration", e.target.value)}
          >
            <option value="direct">Direct concentration Cɡ</option>
            <option value="ideal_gas">Ideal gas · yP / RTɡ</option>
          </select>
          {d.concentration === "direct" ? (
            field("Cg", "Bulk precursor concentration Cɡ", ["mol/m³"])
          ) : (
            <>
              {field(
                "pressure",
                "Total pressure P",
                ["Pa", "Torr"],
                "pressureUnit",
              )}
              {field("y", "Precursor mole fraction y", ["0–1"])}
              {field(
                "Tg",
                "Independent gas temperature Tɡ",
                ["K"],
                undefined,
                "Fixed during a substrate-temperature sweep.",
              )}
            </>
          )}
        </section>
        <details className="form-section">
          <summary>
            Growth conversion & time <span>OPTIONAL</span>
          </summary>
          {field(
            "beta",
            "Film conversion β",
            ["m³/mol"],
            undefined,
            "Growth requires explicit positive β, including stoichiometry.",
          )}
          {field(
            "duration",
            "Deposition duration",
            ["s", "min"],
            "durationUnit",
          )}
        </details>
        <details className="form-section">
          <summary>
            Process metadata <span>OPTIONAL</span>
          </summary>
          <p className="small">
            Flow is metadata only. Pressure affects Cɡ only in ideal-gas mode.
            Numeric pressure and flow limits are unknown.
          </p>
          {d.concentration === "direct" &&
            field(
              "processPressure",
              "Process pressure",
              ["Pa", "Torr"],
              "processPressureUnit",
            )}
          {field("flow", "Standard gas flow", ["sccm"])}
          {d.flow !== "" && (
            <>
              {field("flowT", "Flow standard temperature", ["K"])}
              {field(
                "flowP",
                "Flow standard pressure",
                ["Pa", "Torr"],
                "flowPUnit",
              )}
              <label htmlFor="gasLabel">Gas identity</label>
              <input
                id="gasLabel"
                maxLength={120}
                value={d.gasLabel}
                onChange={(e) => update("gasLabel", e.target.value)}
              />
            </>
          )}
        </details>
        <details className="form-section" open={d.sweep === "on"}>
          <summary>Temperature sweep</summary>
          <label className="check">
            <input
              type="checkbox"
              checked={d.sweep === "on"}
              onChange={(e) => update("sweep", e.target.checked ? "on" : "off")}
            />
            Include temperature sweep
          </label>
          {d.sweep === "on" && (
            <>
              <div className="field-pair">
                {field("start", "Start", ["°C"])}
                {field("stop", "Stop", ["°C"])}
              </div>
              {field("count", "Samples", ["2–501"])}
              <p className="small">
                Only Tₛ changes. hɡ, Cɡ, Tɡ and β stay fixed.
              </p>
            </>
          )}
        </details>
        <details className="form-section" open={d.spatial === "on"}>
          <summary>Radial uniformity extension</summary>
          <label className="check">
            <input
              type="checkbox"
              checked={d.spatial === "on"}
              onChange={(e) =>
                update("spatial", e.target.checked ? "on" : "off")
              }
            />
            Enable prescribed radial fields
          </label>
          {d.spatial === "on" && (
            <>
              <p className="notice compact">
                Prescribed local fields; no flow or mass-balance solution.
              </p>
              <div className="field-pair">
                {field("radius", "Physical radius", ["mm"])}
                {field("edge", "Edge exclusion", ["mm"])}
              </div>
              <div className="field-pair">
                {field("nr", "Radial cells", ["2–256"])}
                {field("ntheta", "Display sectors", ["4–256"])}
              </div>
              {field("deltaT", "Physical-edge ΔT", ["K difference"])}
              {field("aC", "Concentration edge fraction aC")}
              {field("ah", "Transport edge fraction ah")}
              <small>
                Gradients are defined at the full physical edge, including any
                excluded area.
              </small>
            </>
          )}
        </details>
        <details className="form-section">
          <summary>Provenance notes</summary>
          <label htmlFor="notes">Source, chemistry & applicability</label>
          <textarea
            id="notes"
            maxLength={2000}
            rows={4}
            value={d.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
          <small>
            {d.notes.length}/2000 characters · user supplied, unverified
          </small>
        </details>
      </div>
      <div className="run-area">
        {apiError && (
          <div role="alert" className="error">
            <p>{apiError}</p>
            <Button type="button" variant="outline" onClick={reload}>
              Reconnect service
            </Button>
          </div>
        )}
        {error && (
          <div ref={errorRef} tabIndex={-1} role="alert" className="error">
            <strong>{error}</strong>
            <ul>
              {issues.map((i, n) => (
                <li key={n}>
                  {i.path}: {i.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="small" aria-live="polite">
          {busy
            ? "Calculating in the scientific service…"
            : missing.length
              ? "Incomplete — add " + missing.join(", ")
              : cap
                ? "Inputs ready for validation"
                : "Connecting to scientific service…"}
        </p>
        <Button
          type="submit"
          className="full"
          disabled={busy || !cap || missing.length > 0}
        >
          <Play size={16} />
          {busy ? "Calculating…" : "Run simulation"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="full"
          onClick={() => setDraft({ ...emptyDraft })}
        >
          <RotateCcw size={14} /> Clear inputs
        </Button>
      </div>
    </form>
  );
}

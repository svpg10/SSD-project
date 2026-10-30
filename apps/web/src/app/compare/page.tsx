"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { fromRequest } from "@/features/scenario/request";
import * as Dialog from "@radix-ui/react-dialog";
import dynamic from "next/dynamic";
import type { Data } from "plotly.js";
import { Upload, Download, Trash2 } from "lucide-react";
import { useStudio } from "@/features/projects/store";
import { Button } from "@/components/ui/button";
import { readProject } from "@/features/projects/import";
import { download, project } from "@/features/projects/state";
import { Provenance } from "@/features/results/results";
import { num, regime } from "@/lib/format";
import type { Project, Result } from "@/lib/api/types";
const Plot = dynamic(
  () => import("@/features/charts/plot").then((m) => m.Plot),
  { ssr: false },
);
export default function Compare() {
  const { saved, replace, remove, cap, setDraft } = useStudio();
  const [pending, setPending] = useState<Project | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [imported, setImported] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  async function pick(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 16777216) throw new Error("Project exceeds 16 MiB.");
      setPending(
        readProject(
          new TextDecoder("utf-8", { fatal: true }).decode(
            await file.arrayBuffer(),
          ),
        ),
      );
      setError("");
    } catch (e) {
      setError(String(e));
    } finally {
      if (input.current) input.current.value = "";
    }
  }
  async function recompute(r: Result) {
    if (!cap || busy) return;
    setBusy(true);
    setError("");
    try {
      const req = {
        ...r.original_request,
        request_id: crypto.randomUUID(),
        registry_snapshot:
          r.original_request.basis === "synthetic"
            ? cap.synthetic_registry
            : cap.registry,
      };
      const response = await fetch("/api/v1/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const value = await response.json();
      if (!response.ok)
        throw new Error(value.error?.message ?? "Recomputation failed.");
      replace((current) =>
        current.map((s) => (s.run_id === r.run_id ? value : s)),
      );
      setImported((ids) => ids.filter((id) => id !== r.run_id));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const colors = ["#00887f", "#a04b18", "#5666ba", "#9c3b6c"];
  const dashes = ["solid", "dash", "dot", "dashdot"] as const;
  const traces: Data[] = saved
    .filter((r) => r.sweep)
    .map((r, i) => ({
      type: "scatter",
      mode: "lines",
      x: r.sweep!.points.map((p) => p.temperature.value - 273.15),
      y: r.sweep!.points.map((p) => p.result.flux.value),
      line: { color: colors[i], dash: dashes[i] },
      name: `${i + 1} · ${r.original_request.basis}`,
    }));
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">IMMUTABLE LOCAL SNAPSHOTS</span>
          <h1>Compare studies.</h1>
          <p>Up to four studies, with provenance and assumptions intact.</p>
        </div>
      </div>
      <div className="compare-toolbar">
        <Button variant="outline" onClick={() => input.current?.click()}>
          <Upload size={16} /> Import project
        </Button>
        <input
          ref={input}
          type="file"
          hidden
          accept="application/json,.json"
          aria-label="Project JSON file"
          onChange={(e) => void pick(e.target.files?.[0])}
        />
        <Button
          variant="outline"
          disabled={!saved.length}
          onClick={() => {
            try {
              download(
                "cvd-project.json",
                JSON.stringify(project(saved, "Compared CVD studies"), null, 2),
              );
            } catch (e) {
              setError(String(e));
            }
          }}
        >
          <Download size={16} /> Export project
        </Button>
        <span className="small">
          {saved.length}/4 snapshots · tab memory only
        </span>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {saved.length === 0 ? (
        <section className="panel panel-content compare-empty">
          <Image
            src="/images/wafer.webp"
            width={320}
            height={240}
            alt="Conceptual silicon wafer specimen"
          />
          <h2>No comparison snapshots yet.</h2>
          <p>
            Run a study in the workbench and choose “Keep for comparison”, or
            import a project JSON file.
          </p>
          <a href="/workbench">Open workbench →</a>
        </section>
      ) : (
        <>
          <div className="compare-grid">
            {saved.map((r, i) => (
              <section key={r.run_id} className="panel panel-content">
                <span className="eyebrow">
                  STUDY {i + 1} ·{" "}
                  {r.original_request.material.replaceAll("_", " ")}
                </span>
                <h2>{regime(r.scalar.regime)}</h2>
                <Provenance result={r} />
                {imported.includes(r.run_id) && (
                  <p className="notice compact">
                    Saved snapshot · untrusted imported data. Recompute before
                    interpreting as a new verified execution.
                  </p>
                )}
                <strong className="value">{num(r.scalar.flux.value)}</strong>
                {r.spatial && (
                  <p className="small">
                    Area-weighted CV: {num(r.spatial.metrics.cv_percent)}% ·
                    sampled half-range / mean:{" "}
                    {num(r.spatial.metrics.half_range_percent)}%. Prescribed
                    fields, not uncertainty.
                  </p>
                )}
                <p className="small">Precursor flux · mol m⁻² s⁻¹</p>
                <p className="small">
                  Da {num(r.scalar.Da)} · growth{" "}
                  {num(r.scalar.growth_nm_min?.value)}{" "}
                  {r.scalar.growth ? "nm/min" : ""}
                  <br />
                  {r.model_id} · registry {r.registry_snapshot.version}
                  <br />
                  Pressure/flow compliance:{" "}
                  {r.constraints.map((c) => `${c.kind} ${c.status}`).join(", ")}
                  <br />
                  {r.spatial?.disclosure ?? "No spatial extension."}
                </p>
                <p className="small">
                  {r.original_request.basis === "synthetic"
                    ? "Synthetic numerical demonstration; not material or process data."
                    : "User supplied, unverified."}
                </p>
                <details>
                  <summary>Assumptions & source notes</summary>
                  <ul className="disclosures">
                    {r.warnings.map((w, j) => (
                      <li key={j}>{w.message}</li>
                    ))}
                  </ul>
                  <p className="small">
                    {r.original_request.notes ||
                      "No provenance notes supplied."}
                  </p>
                  <code className="hash">{r.input_sha256}</code>
                </details>
                <div className="result-actions">
                  <Button asChild variant="outline">
                    <Link
                      href="/workbench"
                      onClick={() => setDraft(fromRequest(r.original_request))}
                    >
                      Load inputs
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy || !cap}
                    onClick={() => void recompute(r)}
                  >
                    {busy ? "Calculating…" : "Recompute"}
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Remove study ${i + 1}`}
                    onClick={() => remove(r.run_id)}
                  >
                    <Trash2 size={16} />
                    Remove
                  </Button>
                </div>
              </section>
            ))}
          </div>
          {traces.length > 0 && (
            <section className="panel" style={{ marginTop: 24 }}>
              <div className="panel-heading">
                <h2>Temperature sweeps · shared flux scale</h2>
              </div>
              <div className="panel-content">
                <p className="small">
                  One compatible observable: precursor molar flux (mol m⁻² s⁻¹).
                  Models are shown separately; studies are not ranked. Each
                  series retains its original fixed-field assumptions.
                </p>
                <Plot
                  data={traces}
                  title="Comparison of precursor flux sweeps"
                  xTitle="Substrate temperature (°C)"
                  yTitle="Precursor flux (mol m⁻² s⁻¹)"
                />
                <div
                  className="table-scroll tall"
                  tabIndex={0}
                  role="region"
                  aria-label="Comparison data"
                >
                  <table>
                    <caption>
                      Comparison · shared precursor-flux observable
                    </caption>
                    <thead>
                      <tr>
                        <th>Study / provenance</th>
                        <th>Tₛ (°C)</th>
                        <th>Flux (mol m⁻² s⁻¹)</th>
                        <th>Da</th>
                        <th>Regime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saved.flatMap((r, i) =>
                        (r.sweep?.points ?? []).map((point, j) => (
                          <tr key={r.run_id + "-" + j}>
                            <th>
                              {i + 1} · {r.original_request.basis}
                            </th>
                            <td>{num(point.temperature.value - 273.15)}</td>
                            <td>{num(point.result.flux.value)}</td>
                            <td>{num(point.result.Da)}</td>
                            <td>{regime(point.result.regime)}</td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </>
      )}
      <Dialog.Root
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title>Replace comparison studies?</Dialog.Title>
            <Dialog.Description>
              {pending?.name} contains {pending?.snapshots.length} saved
              snapshots. This replaces the studies in this tab. Imported results
              remain labeled as saved data until recomputed by the backend.
            </Dialog.Description>
            <p className="small">
              No source URL is fetched, and imported registry records cannot
              become trusted material data.
            </p>
            <div className="dialog-actions">
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button
                onClick={() => {
                  if (pending) {
                    replace(pending.snapshots);
                    setImported(pending.snapshots.map((r) => r.run_id));
                    setPending(null);
                  }
                }}
              >
                Replace studies
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

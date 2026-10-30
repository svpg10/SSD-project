import type { Result, Project } from "@/lib/api/types";
import { zipSync, strToU8 } from "fflate";
export function draftKey(value: unknown) {
  return JSON.stringify(value);
}
export function runGuard() {
  let ticket = 0;
  return {
    begin: () => ++ticket,
    current: (candidate: number) => candidate === ticket,
  };
}
export function isStale(snapshotKey: string, current: unknown) {
  return snapshotKey !== draftKey(current);
}
export function retainSnapshot(saved: Result[], next: Result) {
  return [
    ...saved.filter((r) => r.run_id !== next.run_id),
    structuredClone(next),
  ].slice(-4);
}
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (typeof value === "string" && /^[\s\x00-\x1f]*[=+\-@]/.test(s))
    s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
}
export function csv(rows: unknown[][]) {
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}
export function project(snapshots: Result[], name: string): Project {
  return {
    schema_version: "1.0.0",
    project_id: crypto.randomUUID(),
    name,
    exported_at: new Date().toISOString(),
    application_version: "0.1.0",
    snapshots,
  };
}
export function download(
  name: string,
  content: string | Uint8Array,
  type = "application/json",
) {
  const blob = new Blob(
    [typeof content === "string" ? content : new Uint8Array(content).buffer],
    { type },
  );
  if (blob.size > 16777216)
    throw new Error("Export exceeds the 16 MiB project limit.");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export function csvBundle(r: Result) {
  const files: Record<string, Uint8Array> = {};
  const rows: unknown[][] = [
    [
      "temperature_K",
      "flux_mol_m2_s",
      "growth_m_s",
      "Da",
      "regime",
      "provenance",
    ],
    [
      r.normalized_inputs.temperature.value,
      r.scalar.flux.value,
      r.scalar.growth?.value ?? null,
      r.scalar.Da,
      r.scalar.regime,
      r.original_request.basis,
    ],
  ];
  files["scalar.csv"] = strToU8(csv(rows));
  if (r.sweep)
    files["sweep.csv"] = strToU8(
      csv([
        rows[0],
        ...r.sweep.points.map((p) => [
          p.temperature.value,
          p.result.flux.value,
          p.result.growth?.value ?? null,
          p.result.Da,
          p.result.regime,
          r.original_request.basis,
        ]),
      ]),
    );
  if (r.spatial) {
    const s = r.spatial;
    files["radial.csv"] = strToU8(
      csv([
        [
          "rho_m",
          "cell_inner_radius_m",
          "cell_outer_radius_m",
          "area_weight",
          "flux_mol_m2_s",
          "regime",
          "provenance",
        ],
        ...s.points.map((p, i) => [
          p.rho.value,
          s.radial_cell_edges_m[i],
          s.radial_cell_edges_m[i + 1],
          p.area_weight,
          p.result.flux.value,
          p.result.regime,
          r.original_request.basis,
        ]),
      ]),
    );
  }
  files["metadata.json"] = strToU8(
    JSON.stringify(
      {
        ...r,
        csv_definitions: {
          null: "Empty CSV cells mean unavailable, not zero.",
          cv_percent: "100 × population sigma / area-weighted mean",
          half_range_percent:
            "100 × (sample maximum − sample minimum) / (2 × mean)",
        },
        disclosure:
          "Prescribed radial fields; no flow or mass-balance solution.",
      },
      null,
      2,
    ),
  );
  return zipSync(files, { level: 6 });
}
export function exportCsv(r: Result) {
  download(
    `cvd-${r.original_request.basis}-${r.run_id.slice(0, 8)}-csv.zip`,
    csvBundle(r),
    "application/zip",
  );
}

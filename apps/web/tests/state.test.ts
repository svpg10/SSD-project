import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  draftKey,
  isStale,
  retainSnapshot,
  csvCell,
  project,
  runGuard,
} from "@/features/projects/state";
import { parseStrict, readProject } from "@/features/projects/import";
import {
  missingFields,
  makeRequest,
  fromRequest,
} from "@/features/scenario/request";
import { demoDraft, emptyDraft } from "@/features/projects/store";
import type { Result, Capabilities } from "@/lib/api/types";
import { csvBundle } from "@/features/projects/state";
import { unzipSync, strFromU8 } from "fflate";
const root = path.resolve(__dirname, "../../..");
const fixture = JSON.parse(
  readFileSync(
    path.join(root, "specs/cvd-studio/examples/scalar-response.synthetic.json"),
    "utf8",
  ),
) as Result;
const cap = JSON.parse(
  readFileSync(
    path.join(root, "specs/cvd-studio/examples/capabilities.json"),
    "utf8",
  ),
) as Capabilities;
describe("immutable scientific workflow", () => {
  it("restores an exported scalar request as an editable draft without accepting its results", () => {
    const actual = makeRequest(fromRequest(fixture.original_request), cap);
    expect({
      ...actual,
      request_id: fixture.original_request.request_id,
    }).toEqual(fixture.original_request);
  });
  it("bundles CSV with full provenance metadata in one download", () => {
    const files = unzipSync(csvBundle(fixture));
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(["scalar.csv", "metadata.json"]),
    );
    expect(strFromU8(files["scalar.csv"])).toContain("flux_mol_m2_s");
    expect(
      JSON.parse(strFromU8(files["metadata.json"])).original_request.basis,
    ).toBe("synthetic");
  });
  it("rejects late responses across form remounts", () => {
    const guard = runGuard();
    const old = guard.begin();
    const current = guard.begin();
    expect(guard.current(current)).toBe(true);
    expect(guard.current(old)).toBe(false);
  });
  it("keeps original snapshot after draft edits", () => {
    const saved = retainSnapshot([], fixture);
    const before = saved[0].scalar.flux.value;
    const edited = structuredClone(fixture);
    edited.scalar.flux.value = 999;
    expect(saved[0].scalar.flux.value).toBe(before);
    const key = draftKey(demoDraft);
    expect(isStale(key, demoDraft)).toBe(false);
    expect(isStale(key, { ...demoDraft, ks: "3" })).toBe(true);
  });
  it("retains only four uniquely identified snapshots", () => {
    let saved: Result[] = [];
    for (let i = 0; i < 6; i++)
      saved = retainSnapshot(saved, { ...fixture, run_id: `run-${i}` });
    expect(saved.length).toBe(4);
    expect(saved[0].run_id).toBe("run-2");
  });
  it("leaves real material values incomplete", () => {
    expect(missingFields(emptyDraft)).toEqual(
      expect.arrayContaining(["ks", "hg", "Cg"]),
    );
    expect(missingFields(demoDraft)).toEqual([]);
  });
  it("does not coerce absent beta to zero", () => {
    const r = makeRequest({ ...demoDraft, beta: "", duration: "" }, cap);
    expect(r.growth_conversion).toBeNull();
    expect(r.duration).toBeNull();
    expect(r.basis).toBe("synthetic");
  });
  it("roundtrips full project without promoting scientific trust", () => {
    const p = project([fixture], "Study");
    expect(
      readProject(JSON.stringify(p)).snapshots[0].original_request.basis,
    ).toBe("synthetic");
  });
  it.each(['{"a":1,"a":2}', '{"a":1e999}', '{"a":NaN}', '{"x":true}x', "[1,]"])(
    "rejects strict JSON violation %s",
    (text) => {
      expect(() => parseStrict(text)).toThrow();
    },
  );
  it("rejects excessive nesting and unsupported schema", () => {
    expect(() => parseStrict("[".repeat(70) + "0" + "]".repeat(70))).toThrow();
    expect(() => readProject('{"schema_version":"2.0.0"}')).toThrow();
  });
  it("keeps object keys inert", () => {
    const result = parseStrict('{"__proto__":{"polluted":true}}');
    expect(result).toHaveProperty("__proto__");
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
  it.each(["=SUM(1,2)", " +cmd", "\t@SUM(1)", "-evil"])(
    "escapes spreadsheet text %s",
    (text) => {
      expect(
        csvCell(text).startsWith("'") || csvCell(text).startsWith("\"'"),
      ).toBe(true);
    },
  );
  it("preserves numeric negatives and nullable output", () => {
    expect(csvCell(-2)).toBe("-2");
    expect(csvCell(null)).toBe("");
  });
});

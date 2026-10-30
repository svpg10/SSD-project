import { validateProject } from "@/lib/generated/project-validator";
import type { Project } from "@/lib/api/types";

// Small strict JSON reader: rejects duplicate keys, excessive nesting and nonfinite numbers.
export function parseStrict(text: string): unknown {
  let i = 0;
  const whitespace = () => {
    while (/\s/.test(text[i] ?? "") && i < text.length) i++;
  };
  function value(depth: number): unknown {
    if (depth > 64) throw new Error("Project nesting exceeds 64 levels.");
    whitespace();
    const c = text[i];
    if (c === "{" || c === "[") {
      const object = c === "{";
      i++;
      whitespace();
      const keys = new Set<string>();
      const result: Record<string, unknown> = Object.create(null);
      const array: unknown[] = [];
      const end = object ? "}" : "]";
      if (text[i] === end) {
        i++;
        return object ? result : array;
      }
      for (;;) {
        whitespace();
        if (object) {
          if (text[i] !== '"') throw new Error("Invalid JSON object.");
          const key = string();
          if (keys.has(key))
            throw new Error("Duplicate JSON keys are not accepted.");
          keys.add(key);
          whitespace();
          if (text[i++] !== ":") throw new Error("Invalid JSON separator.");
          result[key] = value(depth + 1);
        } else array.push(value(depth + 1));
        whitespace();
        const delimiter = text[i++];
        if (delimiter === end) break;
        if (delimiter !== ",") throw new Error("Invalid JSON delimiter.");
      }
      return object ? result : array;
    }
    if (c === '"') return string();
    const match =
      /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
        text.slice(i),
      );
    if (!match) throw new Error("Invalid JSON value.");
    i += match[0].length;
    const v = JSON.parse(match[0]);
    if (typeof v === "number" && !Number.isFinite(v))
      throw new Error("Nonfinite values are not accepted.");
    return v;
  }
  function string(): string {
    const start = i++;
    while (i < text.length) {
      if (text[i] === "\\") {
        i += 2;
        continue;
      }
      if (text[i++] === '"') return JSON.parse(text.slice(start, i));
    }
    throw new Error("Unterminated JSON string.");
  }
  const result = value(0);
  whitespace();
  if (i !== text.length) throw new Error("Unexpected data after JSON.");
  return result;
}
export function readProject(text: string): Project {
  if (new TextEncoder().encode(text).length > 16777216)
    throw new Error("Project exceeds 16 MiB.");
  const value = parseStrict(text);
  if (!validateProject(value))
    throw new Error(
      "Project does not match the strict version 1.0.0 project schema.",
    );
  const p = value as Project;
  for (const r of p.snapshots) {
    if (
      r.request_id !== r.original_request.request_id ||
      r.request_id !== r.normalized_inputs.request_id
    )
      throw new Error("Snapshot request identities do not match.");
    if (r.sweep && r.sweep.points.length !== r.original_request.sweep?.count)
      throw new Error("Sweep data length does not match inputs.");
    if (
      r.spatial &&
      (r.spatial.points.length !== r.spatial.nr ||
        r.spatial.radial_cell_edges_m.length !== r.spatial.nr + 1 ||
        r.spatial.nr * r.spatial.ntheta > 65536)
    )
      throw new Error("Spatial snapshot lengths are inconsistent.");
    if (
      (r.original_request.basis === "synthetic") !==
      (r.original_request.material === "synthetic")
    )
      throw new Error("Invalid synthetic provenance.");
  }
  return p;
}

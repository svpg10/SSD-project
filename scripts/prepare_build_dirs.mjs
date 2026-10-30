// Sequential directory creation avoids intermittent recursive-mkdir failures in the Windows sandbox.
import fs from "node:fs";
import path from "node:path";
if (process.platform === "win32") {
  const root = path.resolve(import.meta.dirname, "..");
  const web = path.join(root, "apps/web");
  const output = path.join(web, ".next-production");
  const make = (relative) => {
    const full = path.resolve(output, relative);
    if (full !== output && !full.startsWith(output + path.sep))
      throw new Error("Build path outside output directory");
    fs.mkdirSync(full, { recursive: true });
  };
  for (const base of ["server/app", "types/app", "static/chunks/app"])
    for (const route of [
      "",
      "compare",
      "workbench",
      "parameters",
      "learn",
      "about/model",
      "_not-found",
      "_global-error",
    ])
      make(path.join(base, route));
  for (const relative of ["cache", "diagnostics", "static/media", "server/chunks", "server/pages"])
    make(relative);
  make("server/app/_global-error.segments/_global-error");
  console.log("Prepared Windows production output directories.");
}

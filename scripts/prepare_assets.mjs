import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const require = createRequire(path.resolve("apps/web/package.json"));
const packagePath = path.dirname(
  require.resolve("plotly.js-strict-dist-min/package.json"),
);
fs.mkdirSync("apps/web/public/vendor", { recursive: true });
for (const [source, target] of [
  ["plotly-strict.min.js", "plotly-strict.min.js"],
  ["LICENSE", "Plotly-LICENSE.txt"],
])
  fs.copyFileSync(
    path.join(packagePath, source),
    path.join("apps/web/public/vendor", target),
  );
console.log("Prepared local strict Plotly asset and license.");

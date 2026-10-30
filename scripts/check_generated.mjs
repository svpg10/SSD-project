import fs from "node:fs";
import { spawnSync } from "node:child_process";
const files = [
  "apps/web/src/lib/api/generated.ts",
  "apps/web/src/lib/generated/project-validator.js",
];
const before = files.map((file) => fs.readFileSync(file));
for (const args of [
  [process.env.npm_execpath, "run", "typegen"],
  ["scripts/generate_project_validator.mjs"],
]) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(1);
}
for (let i = 0; i < files.length; i++)
  if (!before[i].equals(fs.readFileSync(files[i]))) {
    console.error("Generated contract drift: " + files[i]);
    process.exit(1);
  }
console.log(
  "Frontend types and standalone validator match reviewed contracts.",
);

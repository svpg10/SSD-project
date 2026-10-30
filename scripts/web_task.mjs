import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(root, "package.json"));
const bin = (name, file) =>
  path.join(path.dirname(require.resolve(name + "/package.json")), file);
const task = process.argv[2];
const commands = {
  build: [bin("next", "dist/bin/next"), "build", "--webpack"],
  start: [bin("next", "dist/bin/next"), "start"],
  typecheck: [bin("typescript", "bin/tsc"), "--noEmit"],
  lint: [bin("eslint", "bin/eslint.js"), "src"],
  test: [bin("vitest", "vitest.mjs"), "run"],
};
if (!commands[task]) throw new Error("Unsupported frontend task.");
if (task === "build") {
  const prep = spawnSync(
    process.execPath,
    [path.join(root, "scripts/prepare_assets.mjs")],
    { cwd: root, stdio: "inherit" },
  );
  if (prep.status !== 0) process.exit(prep.status ?? 1);
  const dirs = spawnSync(
    process.execPath,
    [path.join(root, "scripts/prepare_build_dirs.mjs")],
    { cwd: root, stdio: "inherit" },
  );
  if (dirs.status !== 0) process.exit(dirs.status ?? 1);
}
const result = spawnSync(
  process.execPath,
  [...commands[task], ...process.argv.slice(3)],
  {
    cwd: path.join(root, "apps/web"),
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "inherit",
  },
);
process.exit(result.status ?? 1);

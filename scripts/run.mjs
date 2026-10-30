import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const python = path.join(
  root,
  ".venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
const env = {
  ...process.env,
  PYTHONPATH: path.join(root, "apps/api/src"),
  NEXT_TELEMETRY_DISABLED: "1",
};
const npm = process.env.npm_execpath;
const require = createRequire(path.join(root, "apps/web/package.json"));
function sync(program, args) {
  const result = spawnSync(program, args, { cwd: root, env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
function npmRun(target) {
  sync(process.execPath, [npm, "run", target]);
}
const command = process.argv[2];
if (command === "dev" || command === "start") {
  const api = spawn(
    python,
    [
      "-m",
      "uvicorn",
      "cvd_studio.main:app",
      "--host",
      "127.0.0.1",
      "--port",
      "8000",
      "--no-proxy-headers",
    ],
    { cwd: root, env, stdio: "inherit" },
  );
  const web = spawn(
    process.execPath,
    [
      require.resolve("next/dist/bin/next"),
      command === "dev" ? "dev" : "start",
      ...(command === "dev" ? ["--webpack"] : []),
      "--hostname",
      "127.0.0.1",
    ],
    { cwd: path.join(root, "apps/web"), env, stdio: "inherit" },
  );
  const stop = () => {
    api.kill();
    web.kill();
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  for (const child of [api, web])
    child.on("exit", (code) => {
      stop();
      process.exitCode = code ?? 0;
    });
} else if (command === "test") {
  sync(python, ["-m", "pytest", "-q"]);
  npmRun("test:web");
} else if (command === "contract") {
  sync(python, ["scripts/check_contract.py"]);
  sync(process.execPath,['scripts/check_generated.mjs']);
} else if (command === "verify") {
  sync(process.execPath,['scripts/check_install.mjs']);
  sync(python, ["-m", "ruff", "check", "apps/api", "scripts"]);
  npmRun("typecheck");
  npmRun("lint");
  npmRun("test");
  npmRun("contract-check");
  npmRun("build");
} else {
  console.error("Use dev, start, test, contract, or verify.");
  process.exit(1);
}

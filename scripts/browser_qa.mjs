import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
const root = path.resolve(import.meta.dirname, "..");
const webRequire = createRequire(path.join(root, "apps/web/package.json"));
const require = createRequire(path.join(root, "package.json"));
fs.mkdirSync(path.join(root, "outputs/qa"), { recursive: true });
const log = fs.createWriteStream(path.join(root, "outputs/qa/services.log"));
const env = {
  ...process.env,
  PYTHONPATH: path.join(root, "apps/api/src"),
  NEXT_TELEMETRY_DISABLED: "1",
  CVD_EXTERNAL_SERVER: "1",
};
env.TEMP = path.join(root, "work/browser-tmp");
env.TMP = env.TEMP;
fs.mkdirSync(env.TEMP, { recursive: true });
fs.mkdirSync(path.join(root, "work/browser-downloads"), { recursive: true });
const python = path.join(
  root,
  ".venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
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
  { cwd: root, env },
);
const web = spawn(
  process.execPath,
  [
    webRequire.resolve("next/dist/bin/next"),
    "start",
    "--hostname",
    "127.0.0.1",
  ],
  { cwd: path.join(root, "apps/web"), env },
);
for (const child of [api, web]) {
  child.stdout.pipe(log, { end: false });
  child.stderr.pipe(log, { end: false });
}
async function ready(url) {
  const stop = Date.now() + 60000;
  while (Date.now() < stop) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Service startup timeout: " + url);
}
function stop(code) {
  api.kill();
  web.kill();
  log.end();
  setTimeout(() => process.exit(code), 300);
}
process.on("SIGINT", () => stop(130));
process.on("SIGTERM", () => stop(143));
try {
  await Promise.all([
    ready("http://127.0.0.1:8000/api/v1/health/ready"),
    ready("http://127.0.0.1:3000"),
  ]);
  console.log("Production services ready; starting Chrome checks.");
  const checks = spawn(
    process.execPath,
    [require.resolve("@playwright/test/cli"), "test", ...process.argv.slice(2)],
    { cwd: root, env, stdio: "inherit" },
  );
  checks.on("exit", (code) => stop(code ?? 1));
} catch (e) {
  console.error(e);
  stop(1);
}

import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
const root = path.resolve(import.meta.dirname, "..");
process.chdir(root);
const logFile = path.join(root, "outputs/startup-diagnostic.log");
fs.mkdirSync(path.dirname(logFile), { recursive: true });
fs.writeFileSync(
  logFile,
  `CVD Studio startup ${new Date().toISOString()}\nNode ${process.version}\nExecutable ${process.execPath}\nFolder ${root}\n`,
);
function report(message) {
  console.log(message);
  fs.appendFileSync(logFile, message + "\n");
}
const runner = spawn(
  process.execPath,
  [path.join(root, "scripts/run.mjs"), "start"],
  {
    cwd: root,
    stdio: ["inherit", "pipe", "pipe"],
  },
);
for (const stream of [runner.stdout, runner.stderr]) {
  stream.on("data", (chunk) => {
    process.stdout.write(chunk);
    fs.appendFileSync(logFile, chunk);
  });
}
let ended = false;
let serviceExit = 0;
const finished = new Promise((resolve) => {
  runner.on("error", (error) => {
    report(`Startup failed: ${error.message}`);
    ended = true;
    serviceExit = 1;
    resolve();
  });
  runner.on("exit", (code, signal) => {
    report(`Services stopped: exit ${code}, signal ${signal}.`);
    ended = true;
    serviceExit = code ?? 1;
    resolve();
  });
});
const url = `http://127.0.0.1:${process.env.PORT || "3000"}`;
report(`Starting ${url}. Keep this window open.\nStartup log: ${logFile}`);
let opened = false;
for (let attempt = 0; attempt < 60 && !ended; attempt++) {
  try {
    const [response, readiness] = await Promise.all([
      fetch(url, { signal: AbortSignal.timeout(1000) }),
      fetch(`${url}/api/v1/health/ready`, {
        signal: AbortSignal.timeout(1000),
      }),
    ]);
    if (!ended && response.ok && readiness.ok) {
      if (process.platform === "win32")
        spawn("cmd.exe", ["/d", "/c", "start", "", url], { stdio: "ignore" });
      else if (process.platform === "darwin")
        spawn("open", [url], { stdio: "ignore" });
      else spawn("xdg-open", [url], { stdio: "ignore" });
      opened = true;
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
report(
  opened
    ? "Both services responded successfully. Browser opened at " +
        url +
        ". Keep this window running."
    : "Startup failed. Please share the startup-diagnostic.log file in outputs.",
);
if (!opened && !ended) runner.kill();
process.on("SIGINT", () => runner.kill());
process.on("SIGTERM", () => runner.kill());
await finished;
process.exitCode = opened ? serviceExit : 1;

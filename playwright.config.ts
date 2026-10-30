import { defineConfig } from "@playwright/test";
import path from "node:path";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "outputs/qa/playwright-results.json" }],
  ],
  use: {
    launchOptions: { downloadsPath: path.resolve("work/browser-downloads") },
    baseURL: "http://127.0.0.1:3000",
    channel: process.env.CVD_BROWSER_CHANNEL || "chrome",
    trace: "retain-on-failure",
  },
  webServer: process.env.CVD_EXTERNAL_SERVER
    ? undefined
    : {
        command: "npm run start",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: true,
        timeout: 120000,
      },
});

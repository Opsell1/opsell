// Smoke tests of the Platform Staff console against production builds of the API, worker and
// console, on Postgres (ADR 0009). Run `pnpm build`, then bootstrap and migrate the database.
// Ports come from API_URL and CONSOLE_ORIGIN, so a run never reuses a server on another database.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const rootEnv = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const env = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
);
const reuseExistingServer = !process.env.CI;
const consoleOrigin = new URL(process.env.CONSOLE_ORIGIN ?? "http://localhost:3001");
const apiUrl = new URL(process.env.API_URL ?? "http://localhost:4000");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: consoleOrigin.origin,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      name: "api",
      command: "node ../api/dist/main.mjs",
      url: new URL("/healthz", apiUrl).toString(),
      env: { ...env, API_PORT: apiUrl.port },
      reuseExistingServer,
    },
    {
      name: "worker",
      command: "node ../worker/dist/main.mjs",
      wait: { stdout: /Worker started/ },
      env,
      reuseExistingServer,
    },
    {
      name: "console",
      command: "node .next/standalone/apps/console/server.js",
      url: new URL("/sign-in", consoleOrigin).toString(),
      env: { ...env, PORT: consoleOrigin.port, HOSTNAME: consoleOrigin.hostname },
      reuseExistingServer,
    },
  ],
});

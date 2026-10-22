// Smoke tests against production builds of the API, worker and web app, on Postgres and Mailpit
// (ADR 0009). Run `pnpm build`, then bootstrap, migrate and seed the database first.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const rootEnv = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const env = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
);
const reuseExistingServer = !process.env.CI;
// Ports come from API_URL and WEB_ORIGIN, so a run never reuses a server on another database.
const webOrigin = new URL(process.env.WEB_ORIGIN ?? "http://localhost:3000");
const apiUrl = new URL(process.env.API_URL ?? "http://localhost:4000");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: webOrigin.origin,
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
      name: "web",
      command: "node .next/standalone/apps/web/server.js",
      url: new URL("/sign-in", webOrigin).toString(),
      env: { ...env, PORT: webOrigin.port, HOSTNAME: webOrigin.hostname },
      reuseExistingServer,
    },
  ],
});

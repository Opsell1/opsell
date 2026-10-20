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

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      name: "api",
      command: "node ../api/dist/main.mjs",
      url: "http://localhost:4000/healthz",
      env,
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
      url: "http://localhost:3000/sign-in",
      env: { ...env, PORT: "3000", HOSTNAME: "localhost" },
      reuseExistingServer,
    },
  ],
});

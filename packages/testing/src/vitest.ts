import { fileURLToPath } from "node:url";

/** Vitest `test` settings for packages whose tests use the shared test database. */
export const databaseTestConfig = {
  globalSetup: [fileURLToPath(new URL("./global-setup.ts", import.meta.url))],
  testTimeout: 20_000,
  hookTimeout: 60_000,
  // Dropping the run's databases forces a checkpoint, which can be slow under load.
  teardownTimeout: 60_000,
};

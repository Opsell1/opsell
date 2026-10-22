import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Local development reads the monorepo's .env; deployed environments set real variables.
const rootEnv = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const config: NextConfig = {
  output: "standalone",
  // Trace files from the monorepo root so the standalone server includes workspace packages.
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  transpilePackages: ["@opsell/ui", "@opsell/contract"],
  poweredByHeader: false,
  reactStrictMode: true,
};

export default config;

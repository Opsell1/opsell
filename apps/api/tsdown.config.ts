import { defineConfig } from "tsdown";

// One self-contained bundle, so the Docker image needs only Node and dist/.
export default defineConfig({
  entry: ["src/main.ts", "src/migrate.ts", "src/staff-cli.ts"],
  platform: "node",
  target: "node24",
  format: "esm",
  deps: {
    alwaysBundle: [/.*/],
    // pg's optional native binding is never installed.
    neverBundle: ["pg-native"],
    // Bundling every dependency is the point, not an accident.
    onlyBundle: false,
  },
  sourcemap: true,
});

import { bootstrap } from "./bootstrap.ts";
import { requireEnv } from "./env.ts";

await bootstrap(requireEnv("DATABASE_ADMIN_URL"), {
  ownerUrl: requireEnv("DATABASE_OWNER_URL"),
  apiUrl: requireEnv("DATABASE_API_URL"),
  workerUrl: requireEnv("DATABASE_WORKER_URL"),
});
console.info("Database roles and database are ready.");

import { requireEnv } from "./env.ts";
import { migrate } from "./migrate.ts";

await migrate(requireEnv("DATABASE_OWNER_URL"));
console.info("Migrations applied.");

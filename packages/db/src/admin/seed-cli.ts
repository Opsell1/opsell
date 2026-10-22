import { requireEnv } from "./env.ts";
import { seed } from "./seed.ts";

await seed(requireEnv("DATABASE_OWNER_URL"));
console.info("Seed applied.");

// The deploy-time migration entry of the API image: run it as the owner role before starting a
// new release, for example as the host's pre-deploy command.
import { fileURLToPath } from "node:url";
import { migrate } from "@opsell/db/admin";

const ownerUrl = process.env.DATABASE_OWNER_URL;
if (!ownerUrl) throw new Error("DATABASE_OWNER_URL is not set");

// The image ships the migrations next to dist/.
await migrate(ownerUrl, {
  migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
});
console.info("Migrations applied.");

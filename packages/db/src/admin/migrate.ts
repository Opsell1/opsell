import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate as drizzleMigrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { PgBoss } from "pg-boss";
import { JOBS_SCHEMA } from "../jobs-schema.ts";
import { APP_ROLE } from "./bootstrap.ts";

/** The migrations in this package; a bundled deploy passes the folder it ships them in. */
const packageMigrations = fileURLToPath(new URL("../../drizzle", import.meta.url));

/**
 * Applies the Drizzle migrations and installs or upgrades pg-boss, as the owner role, then grants
 * the app roles what they need to send and work jobs. Safe to run repeatedly.
 */
export async function migrate(
  ownerUrl: string,
  options: { migrationsFolder?: string } = {},
): Promise<void> {
  const pool = new pg.Pool({ connectionString: ownerUrl, max: 1 });
  try {
    const migrationsFolder = options.migrationsFolder ?? packageMigrations;
    await drizzleMigrate(drizzle({ client: pool }), { migrationsFolder });

    const boss = new PgBoss({
      connectionString: ownerUrl,
      schema: JOBS_SCHEMA,
      migrate: true,
      supervise: false,
      schedule: false,
    });
    boss.on("error", (error) => console.error(error));
    await boss.start();
    await boss.stop({ graceful: false });

    const app = pg.escapeIdentifier(APP_ROLE);
    await pool.query(`
      grant usage on schema ${JOBS_SCHEMA} to ${app};
      grant select, insert, update, delete on all tables in schema ${JOBS_SCHEMA} to ${app};
      grant usage, select on all sequences in schema ${JOBS_SCHEMA} to ${app};
      alter default privileges in schema ${JOBS_SCHEMA}
        grant select, insert, update, delete on tables to ${app};
      alter default privileges in schema ${JOBS_SCHEMA}
        grant usage, select on sequences to ${app};
    `);
  } finally {
    await pool.end();
  }
}

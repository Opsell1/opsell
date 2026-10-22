import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../schema/index.ts";

/**
 * Development data: two Organizations, each with its own Org Admin, so the tenant boundary is
 * visible locally. Fixed ids make the seed idempotent. Neither is a Demo Organization.
 */
export const SEED = {
  larkspur: {
    id: "0a6f8f1e-5b5d-4c1e-9a54-6d2b7f0c1a01",
    name: "Larkspur Bakehouse",
    orgAdmin: {
      id: "5d0c6a2e-8f3b-4b8e-a6f1-2c9d7e4b1a01",
      name: "Dana Whitfield",
      email: "dana@larkspur.example",
    },
    locations: [
      { name: "Valencia St", city: "San Francisco", state: "CA", timeZone: "America/Los_Angeles" },
      { name: "Lake Ave", city: "Pasadena", state: "CA", timeZone: "America/Los_Angeles" },
      { name: "Court St", city: "Brooklyn", state: "NY", timeZone: "America/New_York" },
      { name: "Mass Ave", city: "Cambridge", state: "MA", timeZone: "America/New_York" },
      { name: "South Lamar", city: "Austin", state: "TX", timeZone: "America/Chicago" },
    ],
  },
  juniper: {
    id: "0a6f8f1e-5b5d-4c1e-9a54-6d2b7f0c1a02",
    name: "Juniper Coffee",
    orgAdmin: {
      id: "5d0c6a2e-8f3b-4b8e-a6f1-2c9d7e4b1a02",
      name: "Riley Chen",
      email: "riley@juniper.example",
    },
    locations: [
      { name: "Pearl St", city: "Boulder", state: "CO", timeZone: "America/Denver" },
      { name: "Alberta St", city: "Portland", state: "OR", timeZone: "America/Los_Angeles" },
    ],
  },
} as const;

/** Inserts the seed as the owner role, which owns the tables and so is not subject to RLS. */
export async function seed(ownerUrl: string, now: Date = new Date()): Promise<void> {
  const pool = new pg.Pool({ connectionString: ownerUrl, max: 1 });
  const db = drizzle({ client: pool, schema });
  try {
    await db.transaction(async (tx) => {
      for (const org of [SEED.larkspur, SEED.juniper]) {
        await tx
          .insert(schema.organizations)
          .values({ id: org.id, name: org.name, isDemo: false, createdAt: now })
          .onConflictDoNothing();
        await tx
          .insert(schema.users)
          .values({ ...org.orgAdmin, emailVerified: true, createdAt: now, updatedAt: now })
          .onConflictDoNothing();
        await tx
          .insert(schema.memberships)
          .values({
            organizationId: org.id,
            userId: org.orgAdmin.id,
            role: "org_admin",
            createdAt: now,
          })
          .onConflictDoNothing();
        await tx
          .insert(schema.locations)
          .values(org.locations.map((l) => ({ ...l, organizationId: org.id, createdAt: now })))
          .onConflictDoNothing();
      }
    });
  } finally {
    await pool.end();
  }
}

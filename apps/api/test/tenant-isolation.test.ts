// Row-Level Security as the API role, below HTTP: even code that forgets to filter by
// Organization cannot read or write another tenant's rows (ADR 0001). No Location write
// endpoint exists yet, so these go through withTenant directly.
import { listLocations } from "@opsell/core";
import { createDatabase, locations, organizations } from "@opsell/db";
import { FakeClock, Scenario, testDatabase } from "@opsell/testing";
import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

const database = await testDatabase();
const db = createDatabase(database.apiUrl, { max: 1 });
const clock = new FakeClock();
const scenario = new Scenario(database.ownerUrl, clock);

/** Postgres's "new row violates row-level security policy". */
const rowLevelSecurityViolation = { code: "42501" };

afterAll(async () => {
  await scenario.close();
  await db.close();
});

async function twoOrganizations() {
  const a = await scenario.organization({ locations: [{ name: "Valencia St" }] });
  const b = await scenario.organization({ locations: [{ name: "Pearl St" }] });
  const [bLocation] = b.locations;
  if (!bLocation) throw new Error("scenario created no Location");
  return { a, b, bLocation };
}

describe("tenant isolation as the API role", () => {
  it("rejects inserting a Location into another Organization", async () => {
    const { a, b } = await twoOrganizations();

    const insert = db.withTenant(a.id, a.orgAdmin.id, (tx) =>
      tx.insert(locations).values({
        organizationId: b.id,
        name: "Planted",
        city: "Boulder",
        state: "CO",
        timeZone: "America/Denver",
        createdAt: clock.now(),
      }),
    );

    await expect(insert).rejects.toMatchObject({ cause: rowLevelSecurityViolation });
    const bNames = await db.withTenant(b.id, b.orgAdmin.id, async (tx) =>
      (await listLocations(tx)).map((l) => l.name),
    );
    expect(bNames).toEqual(["Pearl St"]);
  });

  it("updates and deletes none of another Organization's Locations", async () => {
    const { a, b, bLocation } = await twoOrganizations();

    const [updated, deleted] = await db.withTenant(a.id, a.orgAdmin.id, async (tx) => [
      await tx
        .update(locations)
        .set({ name: "Renamed" })
        .where(eq(locations.id, bLocation.id))
        .returning(),
      await tx.delete(locations).where(eq(locations.id, bLocation.id)).returning(),
    ]);

    expect(updated).toEqual([]);
    expect(deleted).toEqual([]);
    const bNames = await db.withTenant(b.id, b.orgAdmin.id, async (tx) =>
      (await listLocations(tx)).map((l) => l.name),
    );
    expect(bNames).toEqual(["Pearl St"]);
  });

  it("rejects moving an own Location into another Organization", async () => {
    const { a, b } = await twoOrganizations();
    const [aLocation] = a.locations;
    if (!aLocation) throw new Error("scenario created no Location");

    const move = db.withTenant(a.id, a.orgAdmin.id, (tx) =>
      tx.update(locations).set({ organizationId: b.id }).where(eq(locations.id, aLocation.id)),
    );

    await expect(move).rejects.toMatchObject({ cause: rowLevelSecurityViolation });
  });

  it("sees no tenant rows outside withTenant, even on a connection a tenant just used", async () => {
    const { a } = await twoOrganizations();
    // One pooled connection, so the second query reuses the first transaction's connection.
    const inside = await db.withTenant(a.id, a.orgAdmin.id, (tx) => listLocations(tx));

    const outside = await db.global.select().from(locations);

    expect(inside.map((l) => l.name)).toEqual(["Valencia St"]);
    expect(outside).toEqual([]);
  });

  it("never lets an Organization stop or start being a Demo Organization", async () => {
    const { a } = await twoOrganizations();

    const flip = db.withTenant(a.id, a.orgAdmin.id, (tx) =>
      tx.update(organizations).set({ isDemo: true }).where(eq(organizations.id, a.id)),
    );

    await expect(flip).rejects.toMatchObject({
      cause: { message: "organizations.is_demo cannot be changed" },
    });
  });
});

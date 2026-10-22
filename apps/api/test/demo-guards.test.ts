// The guards around Demo Organizations and the platform audit log (ADR 0005, ADR 0006), checked
// as the API role so Row-Level Security, grants and triggers all apply.
import { readFile } from "node:fs/promises";
import { DataSourceRefusedError, openDataSource, recordPlatformAction } from "@opsell/core";
import { createDatabase, locations, organizations, platformAuditLog } from "@opsell/db";
import { FakeClock, Scenario, testDatabase } from "@opsell/testing";
import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

const database = await testDatabase();
const db = createDatabase(database.apiUrl, { max: 2 });
const clock = new FakeClock();
const scenario = new Scenario(database.ownerUrl, clock);
const origin = { ipAddress: null, userAgent: null };

afterAll(async () => {
  await scenario.close();
  await db.close();
});

/** Postgres's "permission denied" and "new row violates row-level security policy". */
const insufficientPrivilege = { code: "42501" };

describe("the Demo Organization flag", () => {
  it("is accepted by no endpoint's request body, in either contract", async () => {
    const offenders: string[] = [];
    for (const file of ["openapi.json", "console-openapi.json"]) {
      const spec = JSON.parse(
        await readFile(new URL(`../../../packages/contract/${file}`, import.meta.url), "utf8"),
      );
      const schemas = spec.components?.schemas ?? {};
      const mentionsFlag = (schema: unknown, seen = new Set<unknown>()): boolean => {
        if (!schema || typeof schema !== "object" || seen.has(schema)) return false;
        seen.add(schema);
        const node = schema as Record<string, unknown>;
        if (typeof node.$ref === "string") {
          return mentionsFlag(schemas[node.$ref.split("/").at(-1) ?? ""], seen);
        }
        const properties = node.properties as Record<string, unknown> | undefined;
        if (properties && ("isDemo" in properties || "is_demo" in properties)) return true;
        return Object.values(node).some((child) => mentionsFlag(child, seen));
      };
      for (const [path, item] of Object.entries<Record<string, { requestBody?: unknown }>>(
        spec.paths,
      )) {
        for (const [method, operation] of Object.entries(item)) {
          if (mentionsFlag(operation.requestBody))
            offenders.push(`${method.toUpperCase()} ${path}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("cannot be changed by the API role, nor can the seed it was created from", async () => {
    const demo = await scenario.organization({ isDemo: true });

    const update = (set: { isDemo?: boolean; demoSeed?: number }) =>
      db.withTenant(demo.id, null, (tx) =>
        tx.update(organizations).set(set).where(eq(organizations.id, demo.id)),
      );

    await expect(update({ isDemo: false })).rejects.toMatchObject({
      cause: { message: "organizations.is_demo cannot be changed" },
    });
    await expect(update({ demoSeed: 99 })).rejects.toMatchObject({
      cause: { message: "organizations.demo_seed cannot be changed" },
    });
  });
});

describe("the mock data source", () => {
  it("is refused to the API for a regular Organization", async () => {
    const regular = await scenario.organization({ locations: 1 });

    const open = db.withTenant(regular.id, null, (tx) => openDataSource(tx));

    await expect(open).rejects.toBeInstanceOf(DataSourceRefusedError);
  });

  it("serves a Demo Organization", async () => {
    const demo = await scenario.organization({ isDemo: true });

    const source = await db.withTenant(demo.id, null, (tx) => openDataSource(tx));

    expect(source.kind).toBe("mock");
  });

  it("can never put its rows in a regular Organization, even past the API's check", async () => {
    const regular = await scenario.organization();

    const insert = db.withTenant(regular.id, null, (tx) =>
      tx.insert(locations).values({
        organizationId: regular.id,
        name: "Smuggled",
        city: "Somerville",
        state: "MA",
        timeZone: "America/New_York",
        source: "mock",
        externalId: "mock-store-elm",
        createdAt: clock.now(),
      }),
    );

    await expect(insert).rejects.toMatchObject({
      cause: { message: "the mock data source serves only Demo Organizations" },
    });
  });
});

describe("a Platform Staff context", () => {
  it("sees and writes none of a regular Organization's rows, whatever id the code passes", async () => {
    const staff = await scenario.staff();
    const regular = await scenario.organization({ locations: [{ name: "Real Store" }] });
    const inRegular = <T>(fn: Parameters<typeof db.withPlatformTenant<T>>[2]) =>
      db.withPlatformTenant(staff.id, regular.id, fn);

    const seen = await inRegular(async (tx) => ({
      organizations: await tx.select().from(organizations),
      locations: await tx.select().from(locations),
    }));
    const insert = () =>
      inRegular((tx) =>
        tx.insert(locations).values({
          organizationId: regular.id,
          name: "Planted by staff",
          city: "Boston",
          state: "MA",
          timeZone: "America/New_York",
          createdAt: clock.now(),
        }),
      );

    // Staff see Demo Organizations from anywhere, but never the regular one they pointed at.
    expect(seen.organizations.map((o) => o.id)).not.toContain(regular.id);
    expect(seen.organizations.every((o) => o.isDemo)).toBe(true);
    expect(seen.locations).toEqual([]);
    await expect(insert()).rejects.toMatchObject({ cause: insufficientPrivilege });
  });

  it("works inside a Demo Organization", async () => {
    const staff = await scenario.staff();
    const demo = await scenario.organization({ isDemo: true, locations: [{ name: "Elm St" }] });

    const names = await db.withPlatformTenant(staff.id, demo.id, async (tx) =>
      (await tx.select().from(locations)).map((l) => l.name),
    );

    expect(names).toEqual(["Elm St"]);
  });
});

describe("the platform audit log", () => {
  it("is append-only for the API role", async () => {
    const staff = await scenario.staff();
    await db.withPlatform(staff.id, (tx) =>
      recordPlatformAction(tx, { action: "staff.signed_in", origin, occurredAt: clock.now() }),
    );

    const update = () =>
      db.withPlatform(staff.id, (tx) =>
        tx
          .update(platformAuditLog)
          .set({ action: "rewritten" })
          .where(eq(platformAuditLog.staffId, staff.id)),
      );
    const remove = () =>
      db.withPlatform(staff.id, (tx) =>
        tx.delete(platformAuditLog).where(eq(platformAuditLog.staffId, staff.id)),
      );

    await expect(update()).rejects.toMatchObject({ cause: insufficientPrivilege });
    await expect(remove()).rejects.toMatchObject({ cause: insufficientPrivilege });
  });

  it("takes entries only as the signed-in staff member, never on another's behalf", async () => {
    const [me, someoneElse] = [await scenario.staff(), await scenario.staff()];

    const forged = db.withPlatform(me.id, (tx) =>
      tx.insert(platformAuditLog).values({
        staffId: someoneElse.id,
        action: "demo_organization.created",
        details: {},
        occurredAt: clock.now(),
      }),
    );

    await expect(forged).rejects.toMatchObject({ cause: insufficientPrivilege });
  });

  it("is invisible outside a Platform Staff context", async () => {
    const staff = await scenario.staff();
    await db.withPlatform(staff.id, (tx) =>
      recordPlatformAction(tx, { action: "staff.signed_in", origin, occurredAt: clock.now() }),
    );
    const org = await scenario.organization();

    const asTenant = await db.withTenant(org.id, org.orgAdmin.id, (tx) =>
      tx.select().from(platformAuditLog),
    );

    expect(asTenant).toEqual([]);
  });
});

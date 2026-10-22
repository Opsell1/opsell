// Platform Staff create Demo Organizations from a seed in the console (ADR 0005).
import type { DemoOrganization } from "@opsell/contract";
import { jobDefinitions } from "@opsell/core";
import { runDueJobs } from "@opsell/testing";
import { describe, expect, it } from "vitest";
import { startTestApp } from "./support.ts";

const t = await startTestApp();

const runJobs = () => runDueJobs({ boss: t.boss, deps: t.deps, definitions: jobDefinitions });

/** What a seed decides, without what differs per Organization (ids, name, creation time). */
function seededData({ id: _, name: __, createdAt: ___, locations, ...rest }: DemoOrganization) {
  return { ...rest, locations: locations.map(({ id: _id, ...location }) => location) };
}

describe("POST /demo-organizations", () => {
  it("creates a Demo Organization with Locations, Positions and Employees from the seed", async () => {
    const { api } = await t.staffSignedIn();

    const { data, response } = await api.POST("/demo-organizations", {
      body: { name: "Acme pitch", seed: 42 },
    });

    expect(response.status).toBe(201);
    expect(data).toMatchObject({
      name: "Acme pitch",
      seed: 42,
      backfill: "pending",
      locations: [
        {
          name: "Elm St",
          city: "Somerville",
          state: "MA",
          timeZone: "America/New_York",
          employees: 11,
        },
        {
          name: "Harbor St",
          city: "San Diego",
          state: "CA",
          timeZone: "America/Los_Angeles",
          employees: 11,
        },
      ],
      positions: [
        { name: "Barista", house: "front" },
        { name: "Cashier", house: "front" },
        { name: "Baker", house: "back" },
        { name: "Dishwasher", house: "back" },
      ],
      employees: 19,
    });
  });

  it("backfills the last seven Business Days' sales, time entries and tips in a job", async () => {
    const { api } = await t.staffSignedIn();
    const created = await api.POST("/demo-organizations", { body: { name: "Backfill", seed: 5 } });
    const id = created.data?.id ?? "";

    await runJobs();
    const { data } = await api.GET("/demo-organizations/{organizationId}", {
      params: { path: { organizationId: id } },
    });

    expect(data).toMatchObject({
      backfill: "complete",
      firstBusinessDate: "2026-10-13",
      lastBusinessDate: "2026-10-19",
    });
    expect(data?.totals.salesOrders).toBeGreaterThan(0);
    expect(data?.totals.netSalesCents).toBeGreaterThan(0);
    expect(data?.totals.timeEntries).toBeGreaterThan(0);
    expect(data?.totals.workedMinutes).toBeGreaterThan(0);
    expect(data?.totals.tipEntries).toBeGreaterThan(0);
    expect(data?.totals.staffTipsCents).toBeGreaterThan(0);
  });

  it("produces the same data from the same seed, and different data from another", async () => {
    const { api } = await t.staffSignedIn();
    const create = async (name: string, seed: number) =>
      (await api.POST("/demo-organizations", { body: { name, seed } })).data?.id ?? "";
    const ids = [await create("First", 7), await create("Second", 7), await create("Third", 8)];

    await runJobs();
    const [first, second, third] = await Promise.all(
      ids.map(async (organizationId) => {
        const { data } = await api.GET("/demo-organizations/{organizationId}", {
          params: { path: { organizationId } },
        });
        if (!data) throw new Error("Demo Organization not found");
        return seededData(data);
      }),
    );

    expect(second).toEqual(first);
    expect(third?.totals).not.toEqual(first?.totals);
  });

  it("accepts nothing but a name and a seed, so the flag cannot be set or cleared", async () => {
    const { api } = await t.staffSignedIn();
    const post = (body: unknown) =>
      api.POST("/demo-organizations", { body: body as { name: string; seed: number } });

    const withFlag = await post({ name: "Sneaky", seed: 1, isDemo: false });
    const negativeSeed = await post({ name: "Negative", seed: -1 });
    const fractionalSeed = await post({ name: "Fraction", seed: 1.5 });
    const blankName = await post({ name: "   ", seed: 1 });

    for (const { response, error } of [withFlag, negativeSeed, fractionalSeed, blankName]) {
      expect(response.status).toBe(400);
      expect(error).toEqual({ error: { code: "bad_request", message: expect.any(String) } });
    }
    const { data } = await api.GET("/demo-organizations");
    expect(data?.demoOrganizations.map((o) => o.name)).not.toContain("Sneaky");
  });

  it("answers 401 without a staff session", async () => {
    const { response } = await t.consoleClient().POST("/demo-organizations", {
      body: { name: "Anonymous", seed: 1 },
    });

    expect(response.status).toBe(401);
  });
});

describe("GET /demo-organizations", () => {
  it("lists Demo Organizations, never regular ones", async () => {
    const { api } = await t.staffSignedIn();
    const regular = await t.scenario.organization({ name: "Real Customer Bakery" });
    const created = await api.POST("/demo-organizations", { body: { name: "Listed", seed: 3 } });

    const { data } = await api.GET("/demo-organizations");

    const ids = data?.demoOrganizations.map((o) => o.id);
    expect(ids).toContain(created.data?.id);
    expect(ids).not.toContain(regular.id);
    expect(data?.demoOrganizations.find((o) => o.id === created.data?.id)).toEqual({
      id: created.data?.id,
      name: "Listed",
      seed: 3,
      createdAt: "2026-10-20T15:00:00.000Z",
    });
  });
});

describe("GET /demo-organizations/{organizationId}", () => {
  it("answers 404 for a regular Organization, as if it did not exist", async () => {
    const { api } = await t.staffSignedIn();
    const regular = await t.scenario.organization({ locations: 2 });

    const { response, error } = await api.GET("/demo-organizations/{organizationId}", {
      params: { path: { organizationId: regular.id } },
    });

    expect(response.status).toBe(404);
    expect(error).toEqual({ error: { code: "not_found", message: expect.any(String) } });
  });

  it("answers 400 for an id that is not a UUID", async () => {
    const { api } = await t.staffSignedIn();

    const { response } = await api.GET("/demo-organizations/{organizationId}", {
      params: { path: { organizationId: "not-a-uuid" } },
    });

    expect(response.status).toBe(400);
  });
});

describe("GET /audit-log", () => {
  it("records each console action with who did it, when, and from where", async () => {
    const { api, staff } = await t.staffSignedIn();
    const created = await api.POST("/demo-organizations", {
      body: { name: "Audited", seed: 11 },
      headers: { "user-agent": "Console test browser", "x-forwarded-for": "203.0.113.9" },
    });

    const { data } = await api.GET("/audit-log");

    const mine = data?.entries.filter((e) => e.staff.id === staff.id);
    expect(mine?.map((e) => e.action)).toEqual([
      "demo_organization.created",
      "staff.signed_in",
      "staff.passkey_enrolled",
    ]);
    expect(mine?.[0]).toEqual({
      id: expect.any(String),
      action: "demo_organization.created",
      staff: { id: staff.id, name: staff.name, email: staff.email },
      organizationId: created.data?.id,
      details: { name: "Audited", seed: 11, locations: 2, employees: 19 },
      ipAddress: "203.0.113.9",
      userAgent: "Console test browser",
      occurredAt: "2026-10-20T15:00:00.000Z",
    });
  });
});

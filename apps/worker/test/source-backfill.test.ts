// The worker side of the mock data source: a new Demo Organization's recent Business Days are
// filled by a job, and the job refuses a regular Organization (ADR 0005).
import {
  createDemoOrganization,
  getDemoOrganization,
  jobDefinitions,
  sourceBackfillJob,
} from "@opsell/core";
import { createTestDeps, runDueJobs, Scenario, testDatabase } from "@opsell/testing";
import { afterAll, describe, expect, it } from "vitest";

const database = await testDatabase();
const testDeps = await createTestDeps(database.workerUrl);
const { deps, clock, boss } = testDeps;
const scenario = new Scenario(database.ownerUrl, clock);
const origin = { ipAddress: "203.0.113.7", userAgent: "vitest" };

afterAll(async () => {
  await testDeps.stop();
  await scenario.close();
});

async function newDemoOrganization(seed: number) {
  const staff = await scenario.staff();
  const id = crypto.randomUUID();
  await deps.db.withPlatformTenant(staff.id, id, (tx) =>
    createDemoOrganization(tx, { name: `Demo ${seed}`, seed }, { ...deps, origin }),
  );
  const summary = () => deps.db.withPlatformTenant(staff.id, id, getDemoOrganization);
  return { id, staff, summary };
}

describe("source backfill", () => {
  it("fills a new Demo Organization's last seven Business Days from the mock source", async () => {
    clock.set("2026-10-20T15:00:00Z");
    const demo = await newDemoOrganization(42);
    const before = await demo.summary();

    await runDueJobs({ boss, deps, definitions: jobDefinitions });
    const after = await demo.summary();

    expect(before).toMatchObject({
      backfill: "pending",
      totals: { salesOrders: 0, timeEntries: 0, tipEntries: 0 },
    });
    expect(after).toMatchObject({
      backfill: "complete",
      // 08:00 in San Diego and 11:00 in Somerville: both are on the 20th's Business Day.
      firstBusinessDate: "2026-10-13",
      lastBusinessDate: "2026-10-19",
    });
    expect(after?.totals.salesOrders).toBeGreaterThan(0);
    expect(after?.totals.timeEntries).toBeGreaterThan(0);
    expect(after?.totals.tipEntries).toBeGreaterThan(0);
  });

  it("refuses the mock source for a regular Organization and writes nothing", async () => {
    const regular = await scenario.organization({ locations: 1 });
    const jobId = await deps.db.withTenant(regular.id, null, (tx) =>
      deps.jobs.send(tx, sourceBackfillJob.queue, { backfillId: crypto.randomUUID() }),
    );

    const run = runDueJobs({ boss, deps, definitions: jobDefinitions });

    await expect(run).rejects.toThrow("The mock data source serves only Demo Organizations.");
    // Settle the refused job so it does not block the next test's runDueJobs.
    await boss.fail(sourceBackfillJob.queue, jobId, { reason: "refused" });
  });
});

import { type Deps, defineJob, getLocation } from "@opsell/core";
import { createDatabase, locations } from "@opsell/db";
import {
  createTestJobs,
  FakeClaude,
  FakeClock,
  Outbox,
  runDueJobs,
  Scenario,
  startTestBoss,
  testDatabase,
} from "@opsell/testing";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createWorker } from "../src/index.ts";

const database = await testDatabase();
const clock = new FakeClock();
const outbox = new Outbox();
const db = createDatabase(database.workerUrl, { max: 4 });
const boss = await startTestBoss(database.workerUrl);
const deps: Deps = {
  db,
  clock,
  mailer: outbox.mailer,
  sms: outbox.sms,
  claude: new FakeClaude(),
  jobs: createTestJobs(boss, clock),
};
const scenario = new Scenario(database.ownerUrl, clock);

/** What the test job saw when it ran: proof it ran in the enqueuing tenant's context. */
let seen: { jobId: string; organizationId: string; locationName: string | null }[] = [];
const noteLocation = defineJob<{ locationId: string; organizationId: string }>({
  queue: "test.note-location",
  async handle(tx, data, { jobId }) {
    const location = await getLocation(tx, data.locationId);
    seen.push({ jobId, organizationId: data.organizationId, locationName: location?.name ?? null });
  },
});
const definitions = [noteLocation];
const worker = createWorker(deps, { boss, definitions });
await worker.ensureQueues();

afterAll(async () => {
  await worker.stop();
  await boss.stop({ graceful: false });
  await scenario.close();
  await db.close();
});

beforeEach(() => {
  seen = [];
});

/** Creates a Location and enqueues a job about it in the same tenant transaction. */
function addLocationAndEnqueue(organizationId: string, userId: string, startAfter?: Date) {
  return db.withTenant(organizationId, userId, async (tx) => {
    const [location] = await tx
      .insert(locations)
      .values({
        organizationId,
        name: `Opened ${crypto.randomUUID().slice(0, 4)}`,
        city: "Austin",
        state: "TX",
        timeZone: "America/Chicago",
        createdAt: clock.now(),
      })
      .returning();
    if (!location) throw new Error("Location was not created");
    const jobId = await deps.jobs.send(
      tx,
      noteLocation.queue,
      { locationId: location.id, organizationId },
      startAfter ? { startAfter } : {},
    );
    return { location, jobId };
  });
}

describe("jobs", () => {
  it("commits with the record that caused it and runs in that record's Organization", async () => {
    const org = await scenario.organization();
    const { location, jobId } = await addLocationAndEnqueue(org.id, org.admin.id);

    const ran = await runDueJobs({ boss, deps, definitions });

    expect(ran).toBe(1);
    expect(seen).toEqual([{ jobId, organizationId: org.id, locationName: location.name }]);
  });

  it("never runs when its transaction rolls back", async () => {
    const org = await scenario.organization();

    const failed = db.withTenant(org.id, org.admin.id, async (tx) => {
      await deps.jobs.send(tx, noteLocation.queue, {
        locationId: crypto.randomUUID(),
        organizationId: org.id,
      });
      throw new Error("the record failed to save");
    });

    await expect(failed).rejects.toThrow("the record failed to save");
    expect(await runDueJobs({ boss, deps, definitions })).toBe(0);
    expect(seen).toEqual([]);
  });

  it("waits until the Clock reaches its start time", async () => {
    const org = await scenario.organization();
    const inAnHour = new Date(clock.now().getTime() + 60 * 60 * 1000);
    await addLocationAndEnqueue(org.id, org.admin.id, inAnHour);

    expect(await runDueJobs({ boss, deps, definitions })).toBe(0);
    clock.advance({ hours: 1 });
    expect(await runDueJobs({ boss, deps, definitions })).toBe(1);
  });

  it("is worked by the running worker", async () => {
    const org = await scenario.organization();
    const { location, jobId } = await addLocationAndEnqueue(org.id, org.admin.id);

    await worker.start({ pollingIntervalSeconds: 0.5 });
    await expect
      .poll(() => seen, { timeout: 10_000, interval: 100 })
      .toEqual([{ jobId, organizationId: org.id, locationName: location.name }]);
  });
});

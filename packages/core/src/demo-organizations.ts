// Demo Organizations (ADR 0005): ordinary Organizations, flagged at creation and forever, filled
// by the mock data source from a fixed seed. Platform Staff create and inspect them from the
// console; the flag and the seed are set here and nowhere else.
import {
  currentOrganizationId,
  employeeLocations,
  employees,
  locations,
  organizations,
  type PlatformTenantTx,
  type PlatformTx,
  positions,
  salesOrders,
  sourceBackfills,
  timeEntries,
  tipEntries,
} from "@opsell/db";
import { asc, count, desc, eq, max, min, sql, sum } from "drizzle-orm";
import { defineJob } from "./jobs.ts";
import { type RequestOrigin, recordPlatformAction } from "./platform-audit.ts";
import type { Clock, Jobs } from "./ports.ts";
import { openDataSource } from "./sources/mock.ts";
import { importRoster, syncBusinessDays } from "./sources/sync.ts";

/** How many Business Days, ending yesterday, a new Demo Organization starts with. */
export const DEMO_HISTORY_DAYS = 7;

export interface DemoOrganizationListItem {
  id: string;
  name: string;
  seed: number;
  createdAt: Date;
}

export interface DemoOrganizationSummary extends DemoOrganizationListItem {
  backfill: "pending" | "complete";
  firstBusinessDate: string | null;
  lastBusinessDate: string | null;
  locations: {
    id: string;
    name: string;
    city: string;
    state: string;
    timeZone: string;
    employees: number;
  }[];
  positions: { name: string; house: "front" | "back" }[];
  employees: number;
  totals: {
    salesOrders: number;
    netSalesCents: number;
    timeEntries: number;
    workedMinutes: number;
    tipEntries: number;
    staffTipsCents: number;
  };
}

/** Moves the Demo Organization's history into its tables, as a job (spec #66: sync runs as jobs). */
export const sourceBackfillJob = defineJob<{ backfillId: string }>({
  queue: "source.backfill",
  async handle(tx, { backfillId }, { deps }) {
    // Refuses before anything else when the Organization is not a Demo Organization.
    const source = await openDataSource(tx);
    const [backfill] = await tx
      .select()
      .from(sourceBackfills)
      .where(eq(sourceBackfills.id, backfillId));
    if (!backfill) throw new Error(`No source backfill ${backfillId} in this Organization`);
    if (backfill.completedAt) return;
    await syncBusinessDays(
      tx,
      source,
      { asOf: backfill.asOf, days: backfill.days },
      deps.clock.now(),
    );
    await tx
      .update(sourceBackfills)
      .set({ completedAt: deps.clock.now() })
      .where(eq(sourceBackfills.id, backfillId));
  },
});

/**
 * Creates a Demo Organization in the transaction's own tenant context (its id is the context's
 * Organization), imports its Locations, Positions and Employees from the mock source, and
 * enqueues the backfill of its recent Business Days, all in one transaction with its platform
 * audit log entry.
 */
export async function createDemoOrganization(
  tx: PlatformTenantTx,
  input: { name: string; seed: number },
  context: { clock: Clock; jobs: Jobs; origin: RequestOrigin },
): Promise<string> {
  const now = context.clock.now();
  const [organization] = await tx
    .insert(organizations)
    .values({
      id: sql`${currentOrganizationId}`,
      name: input.name,
      isDemo: true,
      demoSeed: input.seed,
      createdAt: now,
    })
    .returning({ id: organizations.id });
  if (!organization) throw new Error("The Demo Organization was not created");

  const source = await openDataSource(tx);
  await importRoster(tx, source, now);
  const [backfill] = await tx
    .insert(sourceBackfills)
    .values({
      organizationId: organization.id,
      source: source.kind,
      asOf: now,
      days: DEMO_HISTORY_DAYS,
      requestedAt: now,
    })
    .returning({ id: sourceBackfills.id });
  if (!backfill) throw new Error("The source backfill was not requested");
  await context.jobs.send(tx, sourceBackfillJob.queue, { backfillId: backfill.id });

  const [imported] = await tx.select({ employees: count() }).from(employees);
  await recordPlatformAction(tx, {
    action: "demo_organization.created",
    organizationId: organization.id,
    details: {
      name: input.name,
      seed: input.seed,
      locations: (await source.stores()).length,
      employees: imported?.employees ?? 0,
    },
    origin: context.origin,
    occurredAt: now,
  });
  return organization.id;
}

/** Every Demo Organization, newest first. Platform Staff never see regular ones here. */
export async function listDemoOrganizations(tx: PlatformTx): Promise<DemoOrganizationListItem[]> {
  const rows = await tx
    .select({
      id: organizations.id,
      name: organizations.name,
      seed: organizations.demoSeed,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .where(eq(organizations.isDemo, true))
    .orderBy(desc(organizations.createdAt), asc(organizations.name));
  return rows.flatMap((row) => (row.seed === null ? [] : [{ ...row, seed: row.seed }]));
}

/**
 * What the transaction's Organization holds, or null unless it is a Demo Organization: Platform
 * Staff have no standing access to a regular Organization's data (ADR 0006).
 */
export async function getDemoOrganization(
  tx: PlatformTenantTx,
): Promise<DemoOrganizationSummary | null> {
  const [organization] = await tx
    .select({
      id: organizations.id,
      name: organizations.name,
      isDemo: organizations.isDemo,
      seed: organizations.demoSeed,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .where(eq(organizations.id, currentOrganizationId));
  if (!organization?.isDemo || organization.seed === null) return null;

  // One transaction is one connection, so these run one after another.
  const locationRows = await tx
    .select({
      id: locations.id,
      name: locations.name,
      city: locations.city,
      state: locations.state,
      timeZone: locations.timeZone,
      employees: count(employeeLocations.employeeId),
    })
    .from(locations)
    .leftJoin(employeeLocations, eq(employeeLocations.locationId, locations.id))
    .groupBy(locations.id)
    .orderBy(asc(locations.name));
  const positionRows = await tx
    .select({ name: positions.name, house: positions.house })
    .from(positions)
    .orderBy(asc(positions.house), asc(positions.name));
  const employeeCount = await tx.select({ value: count() }).from(employees);
  const sales = await tx
    .select({
      orders: count(),
      netCents: sum(salesOrders.netCents).mapWith(Number),
      first: min(salesOrders.businessDate),
      last: max(salesOrders.businessDate),
    })
    .from(salesOrders);
  const labor = await tx
    .select({
      entries: count(),
      minutes:
        sql<number>`coalesce(sum(extract(epoch from ${timeEntries.clockOutAt} - ${timeEntries.clockInAt}) / 60), 0)`.mapWith(
          Number,
        ),
    })
    .from(timeEntries);
  const tips = await tx
    .select({
      entries: count(),
      staffCents:
        sql<number>`coalesce(sum(${tipEntries.amountCents}) filter (where ${tipEntries.owner} = 'location_staff'), 0)`.mapWith(
          Number,
        ),
    })
    .from(tipEntries);
  const backfills = await tx
    .select({ completedAt: sourceBackfills.completedAt })
    .from(sourceBackfills);

  return {
    id: organization.id,
    name: organization.name,
    seed: organization.seed,
    createdAt: organization.createdAt,
    backfill: backfills.every((b) => b.completedAt) ? "complete" : "pending",
    firstBusinessDate: sales[0]?.first ?? null,
    lastBusinessDate: sales[0]?.last ?? null,
    locations: locationRows,
    positions: positionRows,
    employees: employeeCount[0]?.value ?? 0,
    totals: {
      salesOrders: sales[0]?.orders ?? 0,
      netSalesCents: sales[0]?.netCents ?? 0,
      timeEntries: labor[0]?.entries ?? 0,
      workedMinutes: Math.round(labor[0]?.minutes ?? 0),
      tipEntries: tips[0]?.entries ?? 0,
      staffTipsCents: tips[0]?.staffCents ?? 0,
    },
  };
}

// Copies a source's canonical entries into the Organization's own tables, keyed by the source's
// external IDs so that running a sync again updates rows in place instead of duplicating them.
import {
  currentOrganizationId,
  employeeLocations,
  employees,
  locations,
  positions,
  salesOrders,
  type TenantTx,
  timeEntries,
  tipEntries,
} from "@opsell/db";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { businessDatesEndingYesterday } from "../business-day.ts";
import type { DataSource } from "./ports.ts";

/** Builds an upsert's `set` that takes every listed column from the incoming row. */
function excluded<T extends string>(columns: Record<T, { name: string }>) {
  return Object.fromEntries(
    Object.entries<{ name: string }>(columns).map(([key, column]) => [
      key,
      sql.raw(`excluded."${column.name}"`),
    ]),
  );
}

/**
 * Imports the source's stores as Locations, its jobs as Positions and its roster as Employees
 * with their works-at Locations.
 */
export async function importRoster(tx: TenantTx, source: DataSource, now: Date): Promise<void> {
  const stores = await source.stores();
  if (stores.length) {
    await tx
      .insert(locations)
      .values(
        stores.map((store) => ({
          organizationId: currentOrganizationId,
          name: store.name,
          city: store.city,
          state: store.state,
          timeZone: store.timeZone,
          source: source.kind,
          externalId: store.externalId,
          createdAt: now,
        })),
      )
      .onConflictDoUpdate({
        target: [locations.organizationId, locations.source, locations.externalId],
        set: excluded({ name: locations.name, city: locations.city, state: locations.state }),
      });
  }

  const jobs = await source.roster.jobs();
  if (jobs.length) {
    await tx
      .insert(positions)
      .values(
        jobs.map((job) => ({
          organizationId: currentOrganizationId,
          name: job.name,
          house: job.house,
          source: source.kind,
          externalId: job.externalId,
          createdAt: now,
        })),
      )
      .onConflictDoUpdate({
        target: [positions.organizationId, positions.source, positions.externalId],
        set: excluded({ name: positions.name, house: positions.house }),
      });
  }

  const people = await source.roster.people();
  if (!people.length) return;
  const imported = await tx
    .insert(employees)
    .values(
      people.map((person) => ({
        organizationId: currentOrganizationId,
        firstName: person.firstName,
        lastName: person.lastName,
        source: source.kind,
        externalId: person.externalId,
        createdAt: now,
      })),
    )
    .onConflictDoUpdate({
      target: [employees.organizationId, employees.source, employees.externalId],
      set: excluded({ firstName: employees.firstName, lastName: employees.lastName }),
    })
    .returning({ id: employees.id, externalId: employees.externalId });

  const { locationIds } = await sourceIds(tx, source);
  const employeeIds = new Map(imported.map((e) => [e.externalId, e.id]));
  const worksAt = people.flatMap((person) =>
    person.storeExternalIds.flatMap((store) => {
      const employeeId = employeeIds.get(person.externalId);
      const locationId = locationIds.get(store);
      return employeeId && locationId
        ? [{ organizationId: currentOrganizationId, employeeId, locationId }]
        : [];
    }),
  );
  if (worksAt.length) await tx.insert(employeeLocations).values(worksAt).onConflictDoNothing();
}

/** The Opsell ids of the source's stores, jobs and people, by external ID. */
async function sourceIds(tx: TenantTx, source: DataSource) {
  // One transaction is one connection, so these run one after another.
  const locationRows = await tx
    .select({ id: locations.id, externalId: locations.externalId })
    .from(locations)
    .where(and(eq(locations.source, source.kind), isNotNull(locations.externalId)));
  const positionRows = await tx
    .select({ id: positions.id, externalId: positions.externalId })
    .from(positions)
    .where(and(eq(positions.source, source.kind), isNotNull(positions.externalId)));
  const employeeRows = await tx
    .select({ id: employees.id, externalId: employees.externalId })
    .from(employees)
    .where(eq(employees.source, source.kind));
  const byExternalId = (rows: { id: string; externalId: string | null }[]) =>
    new Map(rows.flatMap((r) => (r.externalId ? [[r.externalId, r.id] as const] : [])));
  return {
    locationIds: byExternalId(locationRows),
    positionIds: byExternalId(positionRows),
    employeeIds: byExternalId(employeeRows),
  };
}

/**
 * Syncs the sales, time entries and tips of each imported Location's `days` Business Days before
 * the one `asOf` falls in, counted in the Location's own time zone.
 */
export async function syncBusinessDays(
  tx: TenantTx,
  source: DataSource,
  range: { asOf: Date; days: number },
  now: Date,
): Promise<void> {
  const { locationIds, positionIds, employeeIds } = await sourceIds(tx, source);
  const stores = await source.stores();
  const required = (ids: Map<string, string>, externalId: string, what: string) => {
    const id = ids.get(externalId);
    if (!id) throw new Error(`The source's ${what} ${externalId} has not been imported`);
    return id;
  };

  for (const store of stores) {
    const locationId = locationIds.get(store.externalId);
    if (!locationId) continue;
    const common = {
      organizationId: currentOrganizationId,
      locationId,
      source: source.kind,
      syncedAt: now,
    };
    for (const businessDate of businessDatesEndingYesterday(
      range.asOf,
      store.timeZone,
      range.days,
    )) {
      const [orders, shifts, tips] = await Promise.all([
        source.sales.salesOrders(store.externalId, businessDate),
        source.timeEntries.timeEntries(store.externalId, businessDate),
        source.tipEntries.tipEntries(store.externalId, businessDate),
      ]);

      if (orders.length) {
        await tx
          .insert(salesOrders)
          .values(orders.map(({ storeExternalId: _, ...order }) => ({ ...common, ...order })))
          .onConflictDoUpdate({
            target: [salesOrders.organizationId, salesOrders.source, salesOrders.externalId],
            set: excluded({
              businessDate: salesOrders.businessDate,
              grossCents: salesOrders.grossCents,
              discountCents: salesOrders.discountCents,
              netCents: salesOrders.netCents,
              taxCents: salesOrders.taxCents,
              serviceChargeCents: salesOrders.serviceChargeCents,
              refundCents: salesOrders.refundCents,
              fulfilledAt: salesOrders.fulfilledAt,
              modifiedAt: salesOrders.modifiedAt,
              syncedAt: salesOrders.syncedAt,
            }),
          });
      }

      if (shifts.length) {
        await tx
          .insert(timeEntries)
          .values(
            shifts.map((entry) => ({
              ...common,
              externalId: entry.externalId,
              businessDate: entry.businessDate,
              employeeId: required(employeeIds, entry.personExternalId, "person"),
              positionId: required(positionIds, entry.jobExternalId, "job"),
              clockInAt: entry.clockInAt,
              clockOutAt: entry.clockOutAt,
              approval: entry.approval,
              modifiedAt: entry.modifiedAt,
            })),
          )
          .onConflictDoUpdate({
            target: [timeEntries.organizationId, timeEntries.source, timeEntries.externalId],
            set: excluded({
              clockInAt: timeEntries.clockInAt,
              clockOutAt: timeEntries.clockOutAt,
              approval: timeEntries.approval,
              modifiedAt: timeEntries.modifiedAt,
              syncedAt: timeEntries.syncedAt,
            }),
          });
      }

      if (tips.length) {
        await tx
          .insert(tipEntries)
          .values(
            tips.map((tip) => ({
              ...common,
              externalId: tip.externalId,
              businessDate: tip.businessDate,
              kind: tip.kind,
              owner: tip.owner,
              amountCents: tip.amountCents,
              orderExternalId: tip.orderExternalId,
              employeeId: tip.personExternalId
                ? required(employeeIds, tip.personExternalId, "person")
                : null,
              occurredAt: tip.occurredAt,
              modifiedAt: tip.modifiedAt,
            })),
          )
          .onConflictDoUpdate({
            target: [tipEntries.organizationId, tipEntries.source, tipEntries.externalId],
            set: excluded({
              amountCents: tipEntries.amountCents,
              modifiedAt: tipEntries.modifiedAt,
              syncedAt: tipEntries.syncedAt,
            }),
          });
      }
    }
  }
}

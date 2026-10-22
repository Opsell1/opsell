// Operations data synced from an Organization's sources (spec #66: ports split by data type).
// Each row keeps the source's external ID and modified time, so a later sync updates it in place.
// Amounts are integer cents. A trigger keeps the mock source's rows in Demo Organizations only.
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { employees, positions, tenantPolicy } from "./people.ts";
import { dataSource, locations, organizations } from "./tenancy.ts";

export const fulfillment = pgEnum("fulfillment", ["counter", "pickup", "delivery"]);
export const paymentMethod = pgEnum("payment_method", ["card", "cash"]);
export const timeEntryApproval = pgEnum("time_entry_approval", ["approved", "pending"]);
export const tipKind = pgEnum("tip_kind", [
  "card",
  "cash_on_payment",
  "auto_gratuity",
  "declared_cash",
]);
export const tipOwner = pgEnum("tip_owner", ["location_staff", "courier"]);

const sourced = () => ({
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locations.id),
  source: dataSource("source").notNull(),
  externalId: text("external_id").notNull(),
  businessDate: date("business_date").notNull(),
  modifiedAt: timestamp("modified_at", { withTimezone: true }).notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }).notNull(),
});

export const salesOrders = pgTable(
  "sales_orders",
  {
    ...sourced(),
    orderType: text("order_type").notNull(),
    channelPartner: text("channel_partner"),
    fulfillment: fulfillment("fulfillment").notNull(),
    orderedAt: timestamp("ordered_at", { withTimezone: true }).notNull(),
    promisedAt: timestamp("promised_at", { withTimezone: true }),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }).notNull(),
    grossCents: integer("gross_cents").notNull(),
    discountCents: integer("discount_cents").notNull(),
    netCents: integer("net_cents").notNull(),
    taxCents: integer("tax_cents").notNull(),
    serviceChargeCents: integer("service_charge_cents").notNull(),
    refundCents: integer("refund_cents").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),
  },
  (t) => [
    unique("sales_orders_source_key").on(t.organizationId, t.source, t.externalId),
    index("sales_orders_location_day_idx").on(t.locationId, t.businessDate),
    tenantPolicy("sales_orders_tenant", t.organizationId),
  ],
);

export const timeEntries = pgTable(
  "time_entries",
  {
    ...sourced(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id),
    positionId: uuid("position_id")
      .notNull()
      .references(() => positions.id),
    clockInAt: timestamp("clock_in_at", { withTimezone: true }).notNull(),
    clockOutAt: timestamp("clock_out_at", { withTimezone: true }),
    approval: timeEntryApproval("approval").notNull(),
  },
  (t) => [
    unique("time_entries_source_key").on(t.organizationId, t.source, t.externalId),
    index("time_entries_location_day_idx").on(t.locationId, t.businessDate),
    tenantPolicy("time_entries_tenant", t.organizationId),
  ],
);

export const tipEntries = pgTable(
  "tip_entries",
  {
    ...sourced(),
    kind: tipKind("kind").notNull(),
    owner: tipOwner("owner").notNull(),
    amountCents: integer("amount_cents").notNull(),
    /** The sales order the tip was paid on, as the source identifies it. */
    orderExternalId: text("order_external_id"),
    /** The Employee who declared the tip, for tips the time clock owns. */
    employeeId: uuid("employee_id").references(() => employees.id),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    unique("tip_entries_source_key").on(t.organizationId, t.source, t.externalId),
    index("tip_entries_location_day_idx").on(t.locationId, t.businessDate),
    tenantPolicy("tip_entries_tenant", t.organizationId),
  ],
);

/** One request to sync a range of Business Days from a source, done by a job. */
export const sourceBackfills = pgTable(
  "source_backfills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    source: dataSource("source").notNull(),
    /** The instant Business Days are counted back from: the days before that instant's day. */
    asOf: timestamp("as_of", { withTimezone: true }).notNull(),
    days: integer("days").notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("source_backfills_organization_id_idx").on(t.organizationId),
    tenantPolicy("source_backfills_tenant", t.organizationId),
  ],
);

// Employees and Positions, imported from an Organization's roster source. Tenant-owned, with the
// same Row-Level Security as every tenant table (ADR 0001).
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  index,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  currentOrganizationId,
  dataSource,
  locations,
  organizations,
  staffOnlyInDemoPolicy,
} from "./tenancy.ts";

/**
 * Rows visible and writable only inside their own Organization's tenant context, and in a
 * Platform Staff context only if that Organization is a Demo Organization.
 */
export const tenantPolicies = (table: string, organizationId: AnyPgColumn) => [
  pgPolicy(`${table}_tenant`, {
    for: "all",
    using: sql`${organizationId} = ${currentOrganizationId}`,
    withCheck: sql`${organizationId} = ${currentOrganizationId}`,
  }),
  staffOnlyInDemoPolicy(table, organizationId),
];

export const house = pgEnum("house", ["front", "back"]);

/** The jobs Employees work on a shift, classed as front or back of house. */
export const positions = pgTable(
  "positions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    house: house("house").notNull(),
    /** The source job the Position was imported from, if any. */
    source: dataSource("source"),
    externalId: text("external_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    unique("positions_organization_name_key").on(t.organizationId, t.name),
    unique("positions_source_key").on(t.organizationId, t.source, t.externalId),
    ...tenantPolicies("positions", t.organizationId),
  ],
);

/** The people an Organization employs, imported from its roster source. */
export const employees = pgTable(
  "employees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    /** The roster entry the Employee was imported from. */
    source: dataSource("source").notNull(),
    externalId: text("external_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    unique("employees_source_key").on(t.organizationId, t.source, t.externalId),
    ...tenantPolicies("employees", t.organizationId),
  ],
);

/** An Employee's works-at Locations; a shift anywhere else is a Covering Shift. */
export const employeeLocations = pgTable(
  "employee_locations",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id),
  },
  (t) => [
    primaryKey({ columns: [t.employeeId, t.locationId] }),
    index("employee_locations_location_id_idx").on(t.locationId),
    ...tenantPolicies("employee_locations", t.organizationId),
  ],
);

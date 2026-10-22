// Tenant-owned tables. Every row carries organization_id and Row-Level Security filters on the
// tenant context that withTenant sets for the transaction (ADR 0001, ADR 0011). Policies name no
// role, so they apply to every role except the table owner, which runs migrations and seeds.
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth.ts";

/** The Organization of the current transaction, or null outside withTenant. */
export const currentOrganizationId = sql`nullif(current_setting('app.organization_id', true), '')::uuid`;
/** The signed-in User of the current transaction, or null for system work. */
export const currentUserId = sql`nullif(current_setting('app.user_id', true), '')::uuid`;
/** The signed-in Platform Staff member of the current transaction, or null (ADR 0006). */
export const currentStaffId = sql`nullif(current_setting('app.staff_id', true), '')::uuid`;

/**
 * In a Platform Staff context, only Demo Organizations' rows, whatever Organization id the code
 * passes: staff have no standing access to a regular Organization's data (ADR 0006). Restrictive,
 * so it narrows every other policy on the table. `is_demo_organization` is a SECURITY DEFINER
 * function (migration 0002), so this check never recurses through the tables' own policies.
 */
export const staffOnlyInDemoPolicy = (table: string, organizationId: AnyPgColumn) =>
  pgPolicy(`${table}_staff_only_in_demo`, {
    as: "restrictive",
    for: "all",
    using: sql`${currentStaffId} is null or is_demo_organization(${organizationId})`,
    withCheck: sql`${currentStaffId} is null or is_demo_organization(${organizationId})`,
  });

/** The systems Opsell reads operations data from. The mock source serves Demo Organizations. */
export const dataSource = pgEnum("data_source", ["mock"]);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // Set at creation and never changed (ADR 0005); a trigger rejects any update to it.
    isDemo: boolean("is_demo").notNull(),
    /** The generator seed a Demo Organization was created from; only Demo Organizations have one. */
    demoSeed: integer("demo_seed"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    check("organizations_demo_seed_only_for_demo", sql`${t.isDemo} = (${t.demoSeed} is not null)`),
    pgPolicy("organizations_read", {
      for: "select",
      using: sql`${t.id} = ${currentOrganizationId} or ${t.id} in (select organization_id from memberships where user_id = ${currentUserId})`,
    }),
    // Platform Staff see Demo Organizations, which hold only fictional data, and no others.
    pgPolicy("organizations_platform_read", {
      for: "select",
      using: sql`${t.isDemo} and ${currentStaffId} is not null`,
    }),
    // An Organization is created inside its own tenant context, so nothing else can be written.
    pgPolicy("organizations_create", {
      for: "insert",
      withCheck: sql`${t.id} = ${currentOrganizationId}`,
    }),
    pgPolicy("organizations_update", {
      for: "update",
      using: sql`${t.id} = ${currentOrganizationId}`,
      withCheck: sql`${t.id} = ${currentOrganizationId}`,
    }),
    pgPolicy("organizations_staff_only_in_demo", {
      as: "restrictive",
      for: "all",
      using: sql`${currentStaffId} is null or ${t.isDemo}`,
      withCheck: sql`${currentStaffId} is null or ${t.isDemo}`,
    }),
  ],
);

export const role = pgEnum("role", ["org_admin"]);

/** A User's Role in one Organization (ADR 0010). */
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    role: role("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    unique("memberships_organization_user_key").on(t.organizationId, t.userId),
    index("memberships_user_id_idx").on(t.userId),
    // A User can list their own memberships before any Organization is active, to pick one.
    pgPolicy("memberships_read", {
      for: "select",
      using: sql`${t.organizationId} = ${currentOrganizationId} or ${t.userId} = ${currentUserId}`,
    }),
    pgPolicy("memberships_write", {
      for: "all",
      using: sql`${t.organizationId} = ${currentOrganizationId}`,
      withCheck: sql`${t.organizationId} = ${currentOrganizationId}`,
    }),
    staffOnlyInDemoPolicy("memberships", t.organizationId),
  ],
);

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    timeZone: text("time_zone").notNull(),
    /** The source store the Location was imported from, if any. */
    source: dataSource("source"),
    externalId: text("external_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    unique("locations_organization_name_key").on(t.organizationId, t.name),
    unique("locations_source_key").on(t.organizationId, t.source, t.externalId),
    pgPolicy("locations_tenant", {
      for: "all",
      using: sql`${t.organizationId} = ${currentOrganizationId}`,
      withCheck: sql`${t.organizationId} = ${currentOrganizationId}`,
    }),
    staffOnlyInDemoPolicy("locations", t.organizationId),
  ],
);

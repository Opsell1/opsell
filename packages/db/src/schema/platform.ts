// Platform Staff: Opsell's own people, a separate identity outside every Organization (ADR 0006,
// ADR 0010). Their sign-in tables mirror Better Auth's models for the console's own auth
// instance, which is passkey-only. Like the Users tables they hold no tenant data and carry no
// Row-Level Security; the platform audit log is filtered on the Platform Staff context instead.
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { currentStaffId, organizations } from "./tenancy.ts";

export const platformStaff = pgTable("platform_staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const platformStaffSessions = pgTable(
  "platform_staff_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    userId: uuid("staff_id")
      .notNull()
      .references(() => platformStaff.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("platform_staff_sessions_staff_id_idx").on(t.userId)],
);

/** Better Auth's account model; passkey-only staff have no rows here, but the model must exist. */
export const platformStaffAccounts = pgTable(
  "platform_staff_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("staff_id")
      .notNull()
      .references(() => platformStaff.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("platform_staff_accounts_staff_id_idx").on(t.userId)],
);

/** WebAuthn challenges in flight. */
export const platformStaffVerifications = pgTable(
  "platform_staff_verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("platform_staff_verifications_identifier_idx").on(t.identifier)],
);

export const platformStaffPasskeys = pgTable(
  "platform_staff_passkeys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: uuid("staff_id")
      .notNull()
      .references(() => platformStaff.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull().unique(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    aaguid: text("aaguid"),
    createdAt: timestamp("created_at", { withTimezone: true }),
  },
  (t) => [index("platform_staff_passkeys_staff_id_idx").on(t.userId)],
);

/**
 * A one-time link that lets a new Platform Staff member register their first passkey. Only the
 * token's SHA-256 is stored; the link is shown once, to whoever ran the invite command.
 */
export const platformStaffEnrollments = pgTable(
  "platform_staff_enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => platformStaff.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("platform_staff_enrollments_staff_id_idx").on(t.staffId)],
);

/**
 * Every Platform Staff console action, append-only: the app roles may insert and read but never
 * update or delete (see the migration's grants). Rows are visible only in a Platform Staff
 * context, and each is written as the signed-in staff member, never on behalf of another.
 */
export const platformAuditLog = pgTable(
  "platform_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Insertion order, which a Clock that stands still in tests cannot give. */
    sequence: bigint("sequence", { mode: "number" }).generatedAlwaysAsIdentity().notNull(),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => platformStaff.id),
    action: text("action").notNull(),
    /** The Organization the action touched, if any. */
    organizationId: uuid("organization_id").references(() => organizations.id),
    details: jsonb("details").$type<Record<string, unknown>>().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("platform_audit_log_sequence_idx").on(t.sequence),
    pgPolicy("platform_audit_log_read", {
      for: "select",
      using: sql`${currentStaffId} is not null`,
    }),
    pgPolicy("platform_audit_log_append", {
      for: "insert",
      withCheck: sql`${t.staffId} = ${currentStaffId}`,
    }),
  ],
);

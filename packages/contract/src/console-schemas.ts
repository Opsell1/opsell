// The Platform Staff console's request and response shapes. They generate a contract of their
// own (console-openapi.json), separate from the one Organization users' clients are built on.
import * as z from "zod";
import { Id } from "./schemas.ts";

const BusinessDate = z.iso.date().meta({ description: "A Business Day", example: "2026-10-19" });

export const StaffMe = z
  .object({ id: Id, name: z.string(), email: z.email() })
  .meta({ id: "StaffMe", description: "The signed-in Platform Staff member." });

/** The largest seed a Demo Organization can have; seeds are stored as Postgres integers. */
export const MAX_SEED = 2_147_483_647;

export const DemoOrganizationInput = z
  .strictObject({
    name: z.string().trim().min(1).max(80).meta({ example: "Larkspur demo for Acme" }),
    seed: z
      .int()
      .min(0)
      .max(MAX_SEED)
      .meta({ description: "The same seed always produces the same data.", example: 42 }),
  })
  .meta({
    id: "DemoOrganizationInput",
    description:
      "A new Demo Organization. It is a Demo Organization from creation, forever; nothing else can be set.",
  });

export const DemoOrganizationListItem = z
  .object({ id: Id, name: z.string(), seed: z.int(), createdAt: z.iso.datetime() })
  .meta({ id: "DemoOrganizationListItem" });

export const DemoOrganizationList = z
  .object({ demoOrganizations: z.array(DemoOrganizationListItem) })
  .meta({ id: "DemoOrganizationList" });

export const DemoOrganization = DemoOrganizationListItem.extend({
  backfill: z.enum(["pending", "complete"]).meta({
    description: "Whether the recent Business Days have been filled from the mock data source yet.",
  }),
  firstBusinessDate: BusinessDate.nullable(),
  lastBusinessDate: BusinessDate.nullable(),
  locations: z.array(
    z.object({
      id: Id,
      name: z.string(),
      city: z.string(),
      state: z.string(),
      timeZone: z.string(),
      employees: z.int().meta({ description: "Employees who work at this Location" }),
    }),
  ),
  positions: z.array(z.object({ name: z.string(), house: z.enum(["front", "back"]) })),
  employees: z.int(),
  totals: z.object({
    salesOrders: z.int(),
    netSalesCents: z.int(),
    timeEntries: z.int(),
    workedMinutes: z.int(),
    tipEntries: z.int(),
    staffTipsCents: z.int().meta({ description: "Tips for Location staff; courier tips excluded" }),
  }),
}).meta({
  id: "DemoOrganization",
  description: "A Demo Organization and what the mock data source filled it with.",
});

export const DemoOrganizationParams = z.object({ organizationId: Id });

export const PlatformAction = z
  .enum(["staff.passkey_enrolled", "staff.signed_in", "demo_organization.created"])
  .meta({ id: "PlatformAction" });

export const PlatformAuditEntry = z
  .object({
    id: Id,
    action: PlatformAction,
    staff: StaffMe,
    organizationId: Id.nullable(),
    details: z.record(z.string(), z.unknown()),
    ipAddress: z.string().nullable(),
    userAgent: z.string().nullable(),
    occurredAt: z.iso.datetime(),
  })
  .meta({ id: "PlatformAuditEntry", description: "One Platform Staff console action." });

export const PlatformAuditLog = z
  .object({ entries: z.array(PlatformAuditEntry) })
  .meta({ id: "PlatformAuditLog", description: "The most recent console actions, newest first." });

export type StaffMe = z.infer<typeof StaffMe>;
export type DemoOrganizationInput = z.infer<typeof DemoOrganizationInput>;
export type DemoOrganizationListItem = z.infer<typeof DemoOrganizationListItem>;
export type DemoOrganization = z.infer<typeof DemoOrganization>;
export type PlatformAction = z.infer<typeof PlatformAction>;
export type PlatformAuditEntry = z.infer<typeof PlatformAuditEntry>;

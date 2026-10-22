import { currentStaffId, type PlatformTx, platformAuditLog, platformStaff } from "@opsell/db";
import { desc, eq, sql } from "drizzle-orm";

/** What a Platform Staff console action did; every action is recorded under one of these. */
export type PlatformAction =
  | "staff.passkey_enrolled"
  | "staff.signed_in"
  | "demo_organization.created";

/** Where a console request came from, recorded with each action. */
export interface RequestOrigin {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface PlatformAuditEntry {
  id: string;
  action: PlatformAction;
  staff: { id: string; name: string; email: string };
  organizationId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  occurredAt: Date;
}

/**
 * One spelling per address, whichever layer saw it: IPv4-mapped IPv6 becomes plain IPv4, and
 * IPv6 takes its compressed canonical form ("::1", not "0000:...:0001").
 */
export function normalizeIpAddress(ip: string | null): string | null {
  const address = ip?.trim();
  if (!address) return null;
  const mapped = address.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i)?.[1];
  if (mapped) return mapped;
  if (!address.includes(":")) return address;
  try {
    // The URL standard serializes IPv6 hosts in their canonical compressed form.
    return new URL(`http://[${address}]`).hostname.slice(1, -1);
  } catch {
    return address;
  }
}

/**
 * Appends one entry to the platform audit log as the transaction's staff member, in the same
 * transaction as the action, so the action and its record commit or roll back together.
 */
export async function recordPlatformAction(
  tx: PlatformTx,
  entry: {
    action: PlatformAction;
    organizationId?: string | null;
    details?: Record<string, unknown>;
    origin: RequestOrigin;
    occurredAt: Date;
  },
): Promise<void> {
  await tx.insert(platformAuditLog).values({
    staffId: sql`${currentStaffId}`,
    action: entry.action,
    organizationId: entry.organizationId ?? null,
    details: entry.details ?? {},
    ipAddress: normalizeIpAddress(entry.origin.ipAddress),
    userAgent: entry.origin.userAgent,
    occurredAt: entry.occurredAt,
  });
}

/** The most recent console actions, newest first. */
export async function listPlatformAuditLog(
  tx: PlatformTx,
  { limit }: { limit: number },
): Promise<PlatformAuditEntry[]> {
  const rows = await tx
    .select({
      id: platformAuditLog.id,
      action: platformAuditLog.action,
      staff: { id: platformStaff.id, name: platformStaff.name, email: platformStaff.email },
      organizationId: platformAuditLog.organizationId,
      details: platformAuditLog.details,
      ipAddress: platformAuditLog.ipAddress,
      userAgent: platformAuditLog.userAgent,
      occurredAt: platformAuditLog.occurredAt,
    })
    .from(platformAuditLog)
    .innerJoin(platformStaff, eq(platformStaff.id, platformAuditLog.staffId))
    .orderBy(desc(platformAuditLog.sequence))
    .limit(limit);
  return rows.map((row) => ({ ...row, action: row.action as PlatformAction }));
}

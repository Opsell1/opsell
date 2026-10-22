// Platform Staff accounts are passkey-only (ADR 0006). A new staff member registers their first
// passkey through a one-time enrollment link that an operator issues from the command line; the
// link's token is the only credential that ever exists besides the passkey, and it is single-use,
// short-lived and stored only as a hash.
import { createHash, randomBytes } from "node:crypto";
import { platformStaff, platformStaffEnrollments, type Schema } from "@opsell/db";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

/** How long an enrollment link works. */
export const ENROLLMENT_TTL_HOURS = 24;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface StaffEnrollment {
  staff: { id: string; name: string; email: string };
  /** Shown once, inside the enrollment link; never stored. */
  token: string;
  expiresAt: Date;
}

/**
 * Creates the Platform Staff member if their email is new, and issues an enrollment link that
 * registers a passkey to them. Issuing one for an existing member lets them add a passkey after
 * losing their last one; whoever can run this already holds the database credentials.
 */
export async function issueStaffEnrollment(
  db: NodePgDatabase<Schema>,
  input: { name: string; email: string },
  now: Date,
): Promise<StaffEnrollment> {
  return db.transaction(async (tx) => {
    const email = input.email.trim().toLowerCase();
    const [staff] = await tx
      .insert(platformStaff)
      .values({
        name: input.name.trim(),
        email,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({ target: platformStaff.email, set: { updatedAt: now } })
      .returning({ id: platformStaff.id, name: platformStaff.name, email: platformStaff.email });
    if (!staff) throw new Error("The Platform Staff member was not created");

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(now.getTime() + ENROLLMENT_TTL_HOURS * 60 * 60 * 1000);
    await tx.insert(platformStaffEnrollments).values({
      staffId: staff.id,
      tokenHash: hashToken(token),
      expiresAt,
      createdAt: now,
    });
    return { staff, token, expiresAt };
  });
}

/** The staff member an unused, unexpired enrollment token belongs to, or null. */
export async function findStaffByEnrollmentToken(
  db: NodePgDatabase<Schema>,
  token: string,
  now: Date,
): Promise<{ id: string; name: string; email: string } | null> {
  const [row] = await db
    .select({ id: platformStaff.id, name: platformStaff.name, email: platformStaff.email })
    .from(platformStaffEnrollments)
    .innerJoin(platformStaff, eq(platformStaff.id, platformStaffEnrollments.staffId))
    .where(
      and(
        eq(platformStaffEnrollments.tokenHash, hashToken(token)),
        isNull(platformStaffEnrollments.usedAt),
        gt(platformStaffEnrollments.expiresAt, now),
      ),
    );
  return row ?? null;
}

/**
 * Uses up an enrollment token, atomically, and returns its staff member's id; null if the token
 * is unknown, expired or already used, including by a concurrent registration.
 */
export async function consumeEnrollmentToken(
  db: NodePgDatabase<Schema>,
  token: string,
  now: Date,
): Promise<string | null> {
  const [row] = await db
    .update(platformStaffEnrollments)
    .set({ usedAt: now })
    .where(
      and(
        eq(platformStaffEnrollments.tokenHash, hashToken(token)),
        isNull(platformStaffEnrollments.usedAt),
        gt(platformStaffEnrollments.expiresAt, now),
      ),
    )
    .returning({ staffId: platformStaffEnrollments.staffId });
  return row?.staffId ?? null;
}

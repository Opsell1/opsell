import {
  currentOrganizationId,
  memberships,
  organizations,
  type TenantTx,
  type UserTx,
  users,
} from "@opsell/db";
import { and, asc, eq } from "drizzle-orm";

export type Role = (typeof memberships.$inferSelect)["role"];

/** The Organizations a User holds a Role in, oldest first, to pick an active one at sign-in. */
export function listMembershipsOfUser(
  tx: UserTx,
  userId: string,
): Promise<{ organizationId: string; role: Role }[]> {
  return tx
    .select({ organizationId: memberships.organizationId, role: memberships.role })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(asc(memberships.createdAt));
}

export interface Membership {
  role: Role;
  user: { id: string; name: string; email: string };
  organization: { id: string; name: string; isDemo: boolean };
}

/** The User's Role in the transaction's Organization, or null if they hold none there. */
export async function getMembership(tx: TenantTx, userId: string): Promise<Membership | null> {
  const [row] = await tx
    .select({
      role: memberships.role,
      user: { id: users.id, name: users.name, email: users.email },
      organization: {
        id: organizations.id,
        name: organizations.name,
        isDemo: organizations.isDemo,
      },
    })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.organizationId))
    .innerJoin(users, eq(users.id, memberships.userId))
    // The read policy also shows a User their memberships in other Organizations.
    .where(
      and(eq(memberships.userId, userId), eq(memberships.organizationId, currentOrganizationId)),
    );
  return row ?? null;
}

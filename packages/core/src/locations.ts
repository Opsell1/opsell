import { locations, type TenantTx } from "@opsell/db";
import { asc, eq } from "drizzle-orm";

export type LocationRecord = typeof locations.$inferSelect;

/** The tenant's Locations, by name. Row-Level Security scopes them to the Organization. */
export function listLocations(tx: TenantTx): Promise<LocationRecord[]> {
  return tx.select().from(locations).orderBy(asc(locations.name));
}

export async function getLocation(tx: TenantTx, id: string): Promise<LocationRecord | null> {
  const [row] = await tx.select().from(locations).where(eq(locations.id, id));
  return row ?? null;
}

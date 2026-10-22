import { currentOrganizationId, organizations, type TenantTx } from "@opsell/db";
import { eq } from "drizzle-orm";
import { type DemoScenario, demoScenario, SMALL_BAKERY_CAFE } from "../demo/scenario.ts";
import type { DataSource } from "./ports.ts";

/** Thrown when anything asks for the mock data source outside a Demo Organization (ADR 0005). */
export class DataSourceRefusedError extends Error {
  constructor() {
    super("The mock data source serves only Demo Organizations.");
    this.name = "DataSourceRefusedError";
  }
}

/** The mock data source: the deterministic demo generator behind the source ports. */
export function createMockDataSource(scenario: DemoScenario): DataSource {
  return {
    kind: "mock",
    stores: async () => scenario.stores,
    roster: {
      jobs: async () => scenario.jobs,
      people: async () => scenario.people,
    },
    sales: {
      salesOrders: async (store, businessDate) => scenario.day(store, businessDate).salesOrders,
    },
    timeEntries: {
      timeEntries: async (store, businessDate) => scenario.day(store, businessDate).timeEntries,
    },
    tipEntries: {
      tipEntries: async (store, businessDate) => scenario.day(store, businessDate).tipEntries,
    },
  };
}

/**
 * The data source of the transaction's Organization. The MVP's only source is the mock one, so a
 * regular Organization has none, and asking is refused. The flag is read here, inside the tenant
 * transaction, so neither the API nor the worker can pass a stale or forged one.
 */
export async function openDataSource(tx: TenantTx): Promise<DataSource> {
  const [organization] = await tx
    .select({ isDemo: organizations.isDemo, demoSeed: organizations.demoSeed })
    .from(organizations)
    .where(eq(organizations.id, currentOrganizationId));
  if (!organization?.isDemo || organization.demoSeed === null) throw new DataSourceRefusedError();
  // Every Demo Organization is the small bakery-cafe chain until the full scenario arrives (#123).
  return createMockDataSource(
    demoScenario({ seed: organization.demoSeed, spec: SMALL_BAKERY_CAFE }),
  );
}

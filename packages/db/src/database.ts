import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.ts";

export type Schema = typeof schema;

declare const tenantBrand: unique symbol;
declare const userBrand: unique symbol;
declare const platformBrand: unique symbol;

/**
 * A transaction whose tenant context is set (ADR 0011). Domain functions take it as their first
 * argument, so a query cannot run outside the tenant context without the type checker noticing.
 * `$client` is the transaction's connection, for libraries such as pg-boss that must join it.
 */
export type TenantTx = NodePgDatabase<Schema> & {
  readonly $client: pg.PoolClient;
  readonly [tenantBrand]: true;
};

/** A transaction that knows the signed-in User but no Organization yet, to list memberships. */
export type UserTx = NodePgDatabase<Schema> & {
  readonly $client: pg.PoolClient;
  readonly [userBrand]: true;
};

/**
 * A transaction acting as a signed-in Platform Staff member (ADR 0006): it reads the platform
 * audit log and Demo Organizations, and appends to the log only as that staff member.
 */
export type PlatformTx = NodePgDatabase<Schema> & {
  readonly $client: pg.PoolClient;
  readonly [platformBrand]: true;
};

/** A Platform Staff console action inside one Organization's tenant context. */
export type PlatformTenantTx = TenantTx & PlatformTx;

export interface Database {
  /**
   * Runs `fn` in a transaction with the tenant context set transaction-locally, so it can never
   * outlive the transaction on a pooled connection. `userId` is null for system work.
   */
  withTenant<T>(
    organizationId: string,
    userId: string | null,
    fn: (tx: TenantTx) => Promise<T>,
  ): Promise<T>;
  /** Runs `fn` in a transaction where only the User is known. */
  withUser<T>(userId: string, fn: (tx: UserTx) => Promise<T>): Promise<T>;
  /** Runs `fn` as a Platform Staff member, outside every Organization. */
  withPlatform<T>(staffId: string, fn: (tx: PlatformTx) => Promise<T>): Promise<T>;
  /**
   * Runs `fn` as a Platform Staff member inside `organizationId`'s tenant context. Callers must
   * check what the staff member may do there: Platform Staff have no standing access to a regular
   * Organization's data (ADR 0006).
   */
  withPlatformTenant<T>(
    staffId: string,
    organizationId: string,
    fn: (tx: PlatformTenantTx) => Promise<T>,
  ): Promise<T>;
  /**
   * Queries outside any tenant context, for the global identity tables (ADR 0010). Row-Level
   * Security returns no tenant rows here.
   */
  readonly global: NodePgDatabase<Schema>;
  readonly pool: pg.Pool;
  close(): Promise<void>;
}

export function createDatabase(connectionString: string, options: { max?: number } = {}): Database {
  const pool = new pg.Pool({ connectionString, max: options.max ?? 10 });

  async function inTransaction<T, Tx>(
    settings: Record<string, string | null>,
    fn: (tx: Tx) => Promise<T>,
  ): Promise<T> {
    const client = await pool.connect();
    let broken = false;
    try {
      await client.query("begin");
      for (const [name, value] of Object.entries(settings)) {
        await client.query("select set_config($1, $2, true)", [name, value ?? ""]);
      }
      const tx = drizzle({ client, schema }) as unknown as Tx;
      const result = await fn(tx);
      await client.query("commit");
      return result;
    } catch (error) {
      try {
        await client.query("rollback");
      } catch {
        broken = true;
      }
      throw error;
    } finally {
      // A connection whose rollback failed is in an unknown state; destroy it rather than reuse it.
      client.release(broken);
    }
  }

  return {
    withTenant: (organizationId, userId, fn) =>
      inTransaction({ "app.organization_id": organizationId, "app.user_id": userId }, fn),
    withUser: (userId, fn) => inTransaction({ "app.user_id": userId }, fn),
    withPlatform: (staffId, fn) => inTransaction({ "app.staff_id": staffId }, fn),
    withPlatformTenant: (staffId, organizationId, fn) =>
      inTransaction({ "app.staff_id": staffId, "app.organization_id": organizationId }, fn),
    global: drizzle({ client: pool, schema }),
    pool,
    close: () => pool.end(),
  };
}

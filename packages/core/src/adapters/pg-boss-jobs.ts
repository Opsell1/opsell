import type { TenantTx } from "@opsell/db";
import type { PgBoss } from "pg-boss";
import type { JobDefinition, JobEnvelope } from "../jobs.ts";
import type { Clock, Jobs } from "../ports.ts";

/**
 * Creates the definitions' queues; idempotent, and needs no DDL for pg-boss's default queues.
 * Both the API and the worker run it at start, since either may send before the other is up.
 */
export async function createQueues(boss: PgBoss, definitions: JobDefinition[]): Promise<void> {
  for (const { queue } of definitions) await boss.createQueue(queue);
}

/** pg-boss behind the Jobs port, sending on the caller's transaction connection. */
export function createPgBossJobs(boss: PgBoss, clock: Clock): Jobs {
  return {
    async send(tx, queue, data, options = {}) {
      const envelope: JobEnvelope<typeof data> = { ...(await tenantOf(tx)), data };
      const id = await boss.send(queue, envelope, {
        startAfter: options.startAfter ?? clock.now(),
        db: { executeSql: (text, values) => tx.$client.query(text, values) },
      });
      if (!id) throw new Error(`pg-boss did not enqueue a ${queue} job`);
      return id;
    },
  };
}

/** Reads the tenant context back from the transaction, so a job cannot name another Organization. */
async function tenantOf(tx: TenantTx): Promise<Omit<JobEnvelope, "data">> {
  const { rows } = await tx.$client.query<{ organization_id: string; user_id: string | null }>(
    `select current_setting('app.organization_id') as organization_id,
            nullif(current_setting('app.user_id', true), '') as user_id`,
  );
  const row = rows[0];
  if (!row) throw new Error("No tenant context on this transaction");
  return { organizationId: row.organization_id, userId: row.user_id };
}

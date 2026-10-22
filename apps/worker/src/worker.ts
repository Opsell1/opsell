import { type Deps, type JobDefinition, type JobEnvelope, runJob } from "@opsell/core";
import type { PgBoss } from "pg-boss";

export interface WorkerOptions {
  boss: PgBoss;
  definitions: JobDefinition[];
}

/**
 * Works pg-boss queues with the job definitions from core. Each job runs in its own tenant
 * transaction through the same withTenant path as an API request (ADR 0011).
 */
export function createWorker(deps: Deps, { boss, definitions }: WorkerOptions) {
  const workers: { queue: string; id: string }[] = [];

  /** Creates the queues; idempotent, and needs no DDL for pg-boss's default queues. */
  async function ensureQueues(): Promise<void> {
    for (const { queue } of definitions) await boss.createQueue(queue);
  }

  return {
    ensureQueues,

    async start(options: { pollingIntervalSeconds?: number } = {}): Promise<void> {
      await ensureQueues();
      for (const definition of definitions) {
        const id = await boss.work<JobEnvelope>(
          definition.queue,
          { pollingIntervalSeconds: options.pollingIntervalSeconds ?? 2 },
          async ([job]) => {
            if (job) await runJob(deps, definition, job);
          },
        );
        workers.push({ queue: definition.queue, id });
      }
    },

    async stop(): Promise<void> {
      for (const { queue, id } of workers.splice(0)) await boss.offWork(queue, { id, wait: true });
    },
  };
}

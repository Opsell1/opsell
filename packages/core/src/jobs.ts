import type { TenantTx } from "@opsell/db";
import type { Deps } from "./ports.ts";

/** What a job carries: its payload and the tenant context it was enqueued in. */
export interface JobEnvelope<T = unknown> {
  organizationId: string;
  userId: string | null;
  data: T;
}

export interface JobContext {
  jobId: string;
  deps: Deps;
}

/** A queue and the handler that works it, inside the job's tenant transaction. */
export interface JobDefinition<T = unknown> {
  queue: string;
  handle(tx: TenantTx, data: T, context: JobContext): Promise<void>;
}

export function defineJob<T>(definition: JobDefinition<T>): JobDefinition<T> {
  return definition;
}

/** Runs one job's handler through the same withTenant path as an API request (ADR 0011). */
export function runJob<T>(
  deps: Deps,
  definition: JobDefinition<T>,
  job: { id: string; data: JobEnvelope<T> },
): Promise<void> {
  const { organizationId, userId, data } = job.data;
  return deps.db.withTenant(organizationId, userId, (tx) =>
    definition.handle(tx, data, { jobId: job.id, deps }),
  );
}

/** The jobs the worker runs. Later tickets register theirs here. */
export const jobDefinitions: JobDefinition[] = [];

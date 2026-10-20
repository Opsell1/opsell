import { type Deps, type JobDefinition, type JobEnvelope, runJob } from "@opsell/core";
import { JOBS_SCHEMA } from "@opsell/db";
import { PgBoss } from "pg-boss";

/** A pg-boss instance for tests: it sends and settles jobs but never polls or schedules. */
export async function startTestBoss(connectionString: string): Promise<PgBoss> {
  const boss = new PgBoss({
    connectionString,
    schema: JOBS_SCHEMA,
    migrate: false,
    supervise: false,
    schedule: false,
    max: 2,
  });
  boss.on("error", (error) => console.error(error));
  await boss.start();
  return boss;
}

interface DueJob {
  id: string;
  name: string;
  data: JobEnvelope;
}

/**
 * Runs, inline and in order, the real handlers of every job due by the fake Clock, including
 * jobs those handlers enqueue that are already due. Production scheduling is pg-boss's concern;
 * this only decides "due" by `clock.now()` (ADR 0009). Returns how many jobs ran. A handler that
 * throws fails the call and leaves its job queued.
 */
export async function runDueJobs(options: {
  boss: PgBoss;
  deps: Deps;
  definitions: JobDefinition[];
}): Promise<number> {
  const { boss, deps, definitions } = options;
  const byQueue = new Map(definitions.map((d) => [d.queue, d]));
  let ran = 0;
  for (;;) {
    const { rows } = await deps.db.pool.query<DueJob>(
      `select id, name, data from ${JOBS_SCHEMA}.job
        where state = 'created' and start_after <= $1 and name = any($2)
        order by start_after, created_on
        limit 1`,
      [deps.clock.now(), [...byQueue.keys()]],
    );
    const job = rows[0];
    if (!job) return ran;
    const definition = byQueue.get(job.name);
    if (!definition) throw new Error(`No handler for queue ${job.name}`);
    await runJob(deps, definition, job);
    await boss.complete(job.name, job.id, null, { includeQueued: true });
    ran++;
  }
}

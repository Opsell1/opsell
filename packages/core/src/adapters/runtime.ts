import { createDatabase, JOBS_SCHEMA } from "@opsell/db";
import { PgBoss } from "pg-boss";
import { jobDefinitions } from "../job-definitions.ts";
import type { Deps } from "../ports.ts";
import { createPgBossJobs, createQueues } from "./pg-boss-jobs.ts";
import { createSmtpMailer } from "./smtp-mailer.ts";
import { createClaudeClient, systemClock, unconfiguredSms } from "./system.ts";

export interface RuntimeConfig {
  /** A role without BYPASSRLS: the API's or the worker's. */
  databaseUrl: string;
  smtpUrl: string;
  mailFrom: string;
  anthropicApiKey: string | undefined;
  /** Only the worker runs pg-boss maintenance and schedules. */
  maintainJobs: boolean;
}

/** Real adapters for the API and the worker. Migrations have already installed pg-boss. */
export async function startRuntime(config: RuntimeConfig) {
  const db = createDatabase(config.databaseUrl);
  const boss = new PgBoss({
    connectionString: config.databaseUrl,
    schema: JOBS_SCHEMA,
    migrate: false,
    supervise: config.maintainJobs,
    schedule: config.maintainJobs,
  });
  boss.on("error", (error) => console.error("pg-boss", error));
  await boss.start();
  await createQueues(boss, jobDefinitions);

  const clock = systemClock;
  const deps: Deps = {
    db,
    clock,
    mailer: createSmtpMailer(config.smtpUrl, config.mailFrom),
    sms: unconfiguredSms,
    claude: createClaudeClient(config.anthropicApiKey),
    jobs: createPgBossJobs(boss, clock),
  };

  return {
    deps,
    boss,
    async stop() {
      await boss.stop({ graceful: true });
      await db.close();
    },
  };
}

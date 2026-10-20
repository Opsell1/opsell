import type { Deps } from "@opsell/core";
import { createPgBossJobs } from "@opsell/core/adapters";
import { createDatabase } from "@opsell/db";
import { FakeClaude } from "./claude.ts";
import { FakeClock } from "./clock.ts";
import { startTestBoss } from "./jobs.ts";
import { Outbox } from "./outbox.ts";

/**
 * The deps the API and worker are built from, for a test: the real database and pg-boss,
 * connected as `databaseUrl`'s role, with fakes for time, mail, SMS and Claude (ADR 0009).
 */
export async function createTestDeps(databaseUrl: string) {
  const clock = new FakeClock();
  const outbox = new Outbox();
  const claude = new FakeClaude();
  const db = createDatabase(databaseUrl, { max: 4 });
  const boss = await startTestBoss(databaseUrl);
  const deps: Deps = {
    db,
    clock,
    mailer: outbox.mailer,
    sms: outbox.sms,
    claude,
    jobs: createPgBossJobs(boss, clock),
  };
  return {
    deps,
    clock,
    outbox,
    claude,
    boss,
    async stop() {
      await boss.stop({ graceful: false });
      await db.close();
    },
  };
}

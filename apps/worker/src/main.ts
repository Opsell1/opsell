import { jobDefinitions } from "@opsell/core";
import { startRuntime } from "@opsell/core/adapters";
import { createWorker } from "./worker.ts";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const runtime = await startRuntime({
  databaseUrl: requireEnv("DATABASE_WORKER_URL"),
  smtpUrl: requireEnv("SMTP_URL"),
  mailFrom: requireEnv("MAIL_FROM"),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  maintainJobs: true,
});

const worker = createWorker(runtime.deps, { boss: runtime.boss, definitions: jobDefinitions });
await worker.start();
console.info(`Worker started with ${jobDefinitions.length} queues.`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    await worker.stop();
    await runtime.stop();
    process.exit(0);
  });
}

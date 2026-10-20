import { startRuntime } from "@opsell/core/adapters";
import * as z from "zod";
import { createApp } from "./app.ts";

const env = z
  .object({
    DATABASE_API_URL: z.url(),
    SMTP_URL: z.url(),
    MAIL_FROM: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    WEB_ORIGIN: z.url(),
    API_PORT: z.coerce.number().int().default(4000),
    ANTHROPIC_API_KEY: z.string().optional(),
  })
  .parse(process.env);

const runtime = await startRuntime({
  databaseUrl: env.DATABASE_API_URL,
  smtpUrl: env.SMTP_URL,
  mailFrom: env.MAIL_FROM,
  anthropicApiKey: env.ANTHROPIC_API_KEY,
  maintainJobs: false,
});

const server = createApp(runtime.deps, {
  webOrigin: env.WEB_ORIGIN,
  authSecret: env.BETTER_AUTH_SECRET,
}).listen(env.API_PORT, () => console.info(`API listening on :${env.API_PORT}`));

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(async () => {
      await runtime.stop();
      process.exit(0);
    });
  });
}

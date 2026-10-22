// `pnpm dev`: start Postgres and Mailpit, prepare the database, then run the API, worker and
// web app on the host with turbo. Safe to re-run; every step is idempotent.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.info("Created .env from .env.example.");
}

run("docker", ["compose", "up", "--detach", "--wait"]);
run("pnpm", ["db:bootstrap"]);
run("pnpm", ["db:migrate"]);
run("pnpm", ["db:seed"]);
console.info(
  "\nWeb: http://localhost:3000 · Console: http://localhost:3001 · API: http://localhost:4000 · Mail: http://localhost:8025",
);
console.info("Sign in as dana@larkspur.example or riley@juniper.example; codes land in Mailpit.");
console.info(
  'For the console, run `pnpm staff:invite --name "Your Name" --email you@opsell.example` and open the link.\n',
);
run("pnpm", [
  "turbo",
  "run",
  "dev",
  "--filter=@opsell/api",
  "--filter=@opsell/worker",
  "--filter=@opsell/web",
  "--filter=@opsell/console",
]);

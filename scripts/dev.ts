// `pnpm dev`: make sure Postgres and Mailpit are up, prepare the database, then run the API,
// worker and web app on the host with turbo. Safe to re-run; every step is idempotent.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { createConnection } from "node:net";

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

/** Whether something accepts connections at the host and port of `url`. */
function listening(url: string, defaultPort: number): Promise<boolean> {
  const { hostname, port } = new URL(url);
  return new Promise((resolve) => {
    const socket = createConnection({ host: hostname, port: Number(port) || defaultPort });
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });
}

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.info("Created .env from .env.example.");
}
process.loadEnvFile(".env");

// Postgres and Mailpit can run natively (Homebrew) or in Docker. Docker starts only the
// services nothing is already serving, so a native install never collides with a container.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const services = [
  { name: "postgres", url: requireEnv("DATABASE_ADMIN_URL"), defaultPort: 5432 },
  { name: "mailpit", url: requireEnv("SMTP_URL"), defaultPort: 1025 },
];
const missing: string[] = [];
for (const { name, url, defaultPort } of services) {
  if (!(await listening(url, defaultPort))) missing.push(name);
}
if (missing.length) {
  const docker = spawnSync("docker", ["compose", "up", "--detach", "--wait", ...missing], {
    stdio: "inherit",
  });
  if (docker.status !== 0) {
    console.error(
      `\nCould not start ${missing.join(" and ")} in Docker. To run Postgres and Mailpit natively instead:\n` +
        "  brew install postgresql@18 mailpit\n" +
        "  brew services start postgresql@18 && brew services start mailpit\n" +
        "  $(brew --prefix postgresql@18)/bin/createuser -s postgres\n",
    );
    process.exit(docker.status ?? 1);
  }
} else {
  console.info("Postgres and Mailpit are already running; not starting Docker.");
}

run("pnpm", ["db:bootstrap"]);
run("pnpm", ["db:migrate"]);
run("pnpm", ["db:seed"]);
console.info(
  "\nWeb: http://localhost:3000 · API: http://localhost:4000 · Mail: http://localhost:8025",
);
console.info("Sign in as dana@larkspur.example or riley@juniper.example; codes land in Mailpit.\n");
run("pnpm", [
  "turbo",
  "run",
  "dev",
  "--filter=@opsell/api",
  "--filter=@opsell/worker",
  "--filter=@opsell/web",
]);

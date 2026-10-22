// Connection settings for tests. Defaults match .env.example and the CI services.
export const testEnv = {
  adminUrl:
    process.env.DATABASE_ADMIN_URL ?? "postgres://postgres:postgres@localhost:5432/postgres",
  ownerUrl:
    process.env.DATABASE_OWNER_URL ?? "postgres://opsell_owner:opsell_owner@localhost:5432/opsell",
  apiUrl: process.env.DATABASE_API_URL ?? "postgres://opsell_api:opsell_api@localhost:5432/opsell",
  workerUrl:
    process.env.DATABASE_WORKER_URL ??
    "postgres://opsell_worker:opsell_worker@localhost:5432/opsell",
};

export function ownerRole(): string {
  return decodeURIComponent(new URL(testEnv.ownerUrl).username);
}

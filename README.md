# Opsell

Operations software for multi-location restaurant groups.
Domain language lives in [GLOSSARY.md](GLOSSARY.md) and decisions in [docs/adr](docs/adr).
For a stage-by-stage tour of how the pieces fit together, read [docs/walking-skeleton.md](docs/walking-skeleton.md).

## Run it locally

You need Node 24 (see `.nvmrc`), pnpm 11 (`corepack enable`), and Postgres 18 and Mailpit.
On a Mac, run them natively with Homebrew, which is much lighter than Docker Desktop (one time):

```sh
brew install postgresql@18 mailpit
brew services start postgresql@18 && brew services start mailpit
$(brew --prefix postgresql@18)/bin/createuser -s postgres
```

Then:

```sh
pnpm install
pnpm dev
```

`pnpm dev` uses Postgres and Mailpit if they are already running, and otherwise starts the missing ones in Docker.
It then creates the database roles, migrates and seeds, and runs the API, worker and web app.
Open http://localhost:3000 and sign in as `dana@larkspur.example` (Larkspur Bakehouse) or `riley@juniper.example` (Juniper Coffee).
Sign-in codes arrive in Mailpit at http://localhost:8025.

## Layout

| Path | What it is |
| --- | --- |
| `apps/api` | Express 5 API; all business logic and authorization (ADR 0004) |
| `apps/worker` | pg-boss worker, same codebase and database as the API |
| `apps/web` | Next.js web app, a pure client of the API |
| `packages/contract` | Zod schemas that generate the OpenAPI contract and the typed client |
| `packages/db` | Drizzle tables, Row-Level Security policies, migrations, `withTenant` |
| `packages/core` | Domain logic and ports shared by the API and worker |
| `packages/ui` | Design tokens from Claude Design and base components |
| `packages/testing` | Test harness: database per run, Clock, outbox, fake Claude, scenario builder |
| `packages/config` | Shared TypeScript and Biome configuration |

## Checks

```sh
pnpm typecheck   # every package
pnpm lint        # Biome
pnpm test        # Vitest unit and contract tests against real Postgres (needs Postgres running)
pnpm build && pnpm test:e2e   # Playwright against production builds (needs a migrated, seeded database)
```

The API connects as a Postgres role without `BYPASSRLS`, and every request runs in a transaction that sets the tenant context (ADR 0001, ADR 0011).
Contract tests connect as that role too, so Row-Level Security is exercised on every query (ADR 0009).
After changing `packages/contract/src/schemas.ts`, run `pnpm generate` and commit the output; CI fails on drift.

## Deploy

Each app has a Dockerfile, built from the repository root, for example `docker build -f apps/api/Dockerfile .`.
Before starting a new release, run `node dist/migrate.mjs` in the API image with `DATABASE_OWNER_URL` set.

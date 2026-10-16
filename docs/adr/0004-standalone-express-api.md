# Standalone Express API with Next.js as a pure client

The desktop-first web app comes first, but native iOS and Android apps will follow on the same backend, so all business logic lives in a standalone Express API in the TypeScript monorepo, not inside Next.js.
Next.js renders UI only and never touches Postgres, so the web app, the later Expo app, and any future client go through exactly the same authorization and Row-Level Security path.
The OpenAPI contract is generated from Zod schemas in a shared package, which also validate requests in Express and forms in the UI, so the documented contract cannot drift from the code.

## Considered Options

- **Next.js full-stack (server actions and routes)**: faster to start, but server actions are tied to the web client and long-running polling workers fit poorly.
- **tRPC without OpenAPI**: zero codegen, but no documented, versionable HTTP contract for native apps already installed on phones.
- **Backend-as-a-service**: domain rules such as state-aware tip eligibility and Write-up signing would be split across SQL policies and edge functions, and it ties us to the vendor.

## Consequences

- Background work (Toast and Harri polling, HR Flag extraction, PDFs, notifications) runs as pg-boss jobs in the same codebase and the same Postgres, so a job can be queued in the same transaction as the record that triggers it.

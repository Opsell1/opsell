# Tenant isolation through a shared Postgres database with Row-Level Security

All Organizations share one Postgres database.
Every tenant-owned row carries `organization_id`, and Postgres Row-Level Security policies (declared next to the tables in Drizzle and versioned in migrations) filter on the Organization and user that the API sets at the start of each request's transaction.
The API connects as a role without `BYPASSRLS`, and migrations run as a separate owner role, so a missed filter in application code still cannot leak another Organization's Write-ups, tips, or Employee records.

## Considered Options

- **Application-level filtering only**: simpler, but a single missed `WHERE` becomes a cross-tenant leak of disciplinary and wage data.
- **Schema per Organization**: stronger isolation, but every migration runs N times and connection pooling and Platform Staff tooling get harder.
- **Database per Organization**: strongest isolation, but its infrastructure and migration cost is unjustified until a contract demands it.

## Consequences

- Every query runs inside a transaction that sets the tenant context; pooled connections must never carry it across requests.
- Platform Staff access is a separate, audited path, decided with the audit log.

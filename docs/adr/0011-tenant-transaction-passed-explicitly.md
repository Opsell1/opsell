# The tenant transaction is passed explicitly, never held in ambient context

Every API request and every job runs inside `withTenant(organizationId, userId, fn)`, which opens a transaction, sets the tenant context with transaction-local `set_config`, and hands `fn` a typed tenant transaction.
Domain functions take that transaction as their first argument, so a query cannot run outside the tenant context without the type checker noticing, and the context can never outlive the transaction on a pooled connection.
We chose this over AsyncLocalStorage because ambient context fails silently: a query started from a detached promise or a timer runs without the context, which Row-Level Security turns into an empty result rather than an error.

## Consequences

- Call sites are more verbose: every domain function signature carries the transaction.
- The worker uses the same `withTenant`, so jobs and requests share one tenant path.

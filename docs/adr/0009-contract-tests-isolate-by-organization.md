# Contract tests isolate by Organization in one shared database, with time, jobs and outbound calls behind fakes

API contract tests run in-process against one migrated Postgres per test run, cloned per test worker, and connect as the API role so Row-Level Security is exercised on every query.
Tests never truncate or roll back: each test builds its own Organizations through the scenario builder, and Row-Level Security keeps them apart, so tests run in parallel and every test doubles as a tenant isolation check.
Time, jobs and outbound calls are injected seams: a Clock that every business timestamp comes from, a `runDueJobs()` helper that runs the real pg-boss handlers inline for jobs due by that Clock, an in-memory outbox behind the Mailer and SMS ports, and a fake at the Claude Messages API boundary so our prompt building and response validation still run.

## Considered Options

- **Truncate between tests**: a simple mental model, but tests must run serially per database, and a forgotten table leaks state between tests.
- **Roll back a transaction per test**: fast, but the API opens its own transaction per request and pg-boss commits jobs, so it would hide exactly the behaviour under test.
- **Real time with polling for jobs**: no clock seam, but slow, flaky, and unable to test deadlines such as Overdue at 10:00 the next morning.
- **Fake at the use-case level for Claude**: simpler fakes, but the evidence and roster-ref validation the spec relies on would go untested.

## Consequences

- Business timestamps are never taken from a database default such as `now()`, since the Clock and the database would disagree in tests.
- Jobs are enqueued with a start time computed from the Clock, and pg-boss scheduling only matters in production.
- Assertions must be scoped to the test's own Organizations, never to whole-table counts.
- Playwright runs the production builds against Postgres and a Mailpit mail catcher, reading sign-in codes from Mailpit, so the API carries no test-only endpoints.

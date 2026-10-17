# Demo Organizations live in production behind a permanent flag, with a persona switcher

Prospects are shown Opsell in Demo Organizations: ordinary Organizations in the production deployment, marked by a flag that Platform Staff set at creation and that can never be changed.
Only a Demo Organization can use the mock data source, it can never connect a real source or hold real people, and inside it alone a presenter (Platform Staff, or a prospect holding an email-bound guest link) can act as any seeded user through an audited persona switcher, without a sign-in code.
We chose this over a separate demo environment so demos always run the exact code customers run and keep working after launch, accepting a gated auth path in production that Row-Level Security and the immutable flag contain.

## Considered Options

- **Separate demo environment**: strongest separation and no persona switcher in production, but a second deployment to run forever, and demos drift from what customers actually use.
- **Mock data only during the Render period**: simplest, but leaves no way to demo to the next prospect once the first customer is live.
- **Fixed sign-in codes for seeded users**: fast to present, but puts a static credential into the auth system.

## Consequences

- The persona switcher and the mock source must refuse to run unless the Organization is a Demo Organization, and both are covered by tests that try it on a regular Organization.
- Seeded users have no real email or phone, so Demo Organizations send notifications in-app only; the guest sign-in code is the one outbound message.
- Live AI extraction in a Demo Organization is capped per day, so a guest cannot run up cost.

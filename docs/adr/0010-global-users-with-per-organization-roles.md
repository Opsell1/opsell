# Users are global, and a User's Role is held per Organization

A User's sign-in identity (email or phone, sessions, passkeys) is platform-wide and holds no tenant data, so the Better Auth tables carry no `organization_id` and no Row-Level Security.
Each Role a User holds lives on a tenant-owned membership row in that Organization, and the session carries the active Organization, from which the API sets the tenant context for the request's transaction.
We chose this so one person can hold Roles in two Organizations with one sign-in, and so a sign-in code never has to ask which Organization it is for.

## Considered Options

- **One User per Organization**: Row-Level Security would cover the identity tables too, but the same email at two Organizations would need two accounts, and sign-in would be ambiguous.

## Consequences

- Anything about a person that belongs to an Organization (Role, access Locations, Employee link, invite status) lives on tenant-owned rows, never on the User.
- Platform Staff stay a separate identity, outside every Organization, as ADR 0006 requires.
- Switching the active Organization changes the tenant context without signing in again.

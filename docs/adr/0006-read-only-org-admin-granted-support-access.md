# Read-only, Org-Admin-granted Support Access

Platform Staff have no standing access to any Organization's data.
They see a tenant only through Support Access: a read-only view, under their own Platform Staff identity, that an Org Admin grants for a set time (default 24 hours, at most 7 days) and that excludes Write-ups, HR Flags and Rebuttals unless the Org Admin includes them.
When no Org Admin can grant it, Break-glass Access opens the same read-only view for 4 hours with a mandatory reason and a second Platform Staff approval, never includes HR records, and notifies every Org Admin by email immediately.
We chose this over impersonation because a support session acting as a customer user would blur who did what in the Audit Log and could put a forged signature on a Write-up; any fix is made by the Org Admin or through an audited console action.

## Considered Options

- **Impersonate a user**: best for reproducing bugs, but actions and signatures become indistinguishable from the customer's own.
- **Read plus scoped writes to setup**: more helpful during onboarding, but adds a write path to secure and audit for little gain over the Org Admin acting on the call.
- **Staff self-grant with reason**: faster support, but the customer never says yes, which undercuts the promise that discipline and wage data stay theirs.

## Consequences

- Platform Staff use a separate console with passkey-only accounts that are never Organization users.
- Every Platform Staff read is written to the Audit Log, and Org Admins see each grant and the records viewed in Settings, plus a banner while a grant is live.
- The API needs a read-only tenant context for Platform Staff that RLS (ADR 0001) enforces, rather than a bypass role.

# The Platform Staff console is a separate app, and staff enroll their passkey by one-time link

Platform Staff use their own Next.js app on its own origin, signing in to a second Better Auth instance in the same Express API, whose tables are separate from Users', so a staff session can never act as a User and a User can never reach the console (ADR 0006, ADR 0010).
Staff accounts are passkey-only: an operator runs the API image's `staff-cli invite` command, which prints a one-time enrollment link, valid for 24 hours and stored only as a hash, whose token registers the staff member's first passkey and signs them in.
We chose a separate origin over a `/console` section of the web app so that staff passkeys are bound to the console's host, staff cookies never coexist with customer cookies, and the console can be deployed and network-restricted on its own.

## Considered Options

- **A `/console` section of the web app**: one deployment less, but staff and customer sessions share an origin, so a script running there could ride a staff session, and passkeys could not be bound to a staff-only host.
- **Email a sign-in code to start enrollment**: no command to run, but it makes email a standing way into the console, which passkey-only exists to rule out.
- **Platform Staff as Users with a platform Role**: one identity system, but it breaks ADR 0006's promise that staff are never Organization users.

## Consequences

- The console has its own `/api` proxy (ADR 0012), and `CONSOLE_ORIGIN` names its public origin, where passkeys are bound; changing that host means re-enrolling every passkey.
- Every console action is written to the append-only platform audit log, with its IP address resolved the same way for every entry.
  Actions on Opsell's own records commit in the same transaction as their entry; sign-ins and passkey enrollments are written right after Better Auth's own write, which cannot join that transaction.
- A lost passkey is replaced by issuing a new enrollment link; whoever can run the command already holds production credentials.

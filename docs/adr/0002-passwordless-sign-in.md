# Passwordless sign-in with redundant code delivery

Many Team Members have no work email and share a back-office computer with their GM, Manager, and Senior-sup, while their own-account sign-in is what binds a Write-up signature to them.
We chose passwordless sign-in through Better Auth, self-hosted in the Express API: a one-time code by email or SMS, an optional passkey kept only on the person's own phone (used on a shared computer by scanning a QR code), and audited assisted recovery (Org Admin for their users, Platform Staff for Org Admins) as the last resort.
Passwords were rejected because a password reset depends on the same email or SMS delivery it would back up, while adding credential stuffing and reset work at the store; the design leaves room to add a password method later.

## Consequences

- In production, each channel has two providers with automatic failover (SES and Postmark for email, Twilio and AWS SMS); the interim demo host uses one provider per channel.
- Passkeys are never registered in a shared computer's keychain, since anyone who can unlock it could use them.
- A browser an Org Admin or GM marks as a Location shared device gets no "remember me", an idle sign-out, a visible signed-in name, and one-click Switch user.

import type { Outbox } from "./outbox.ts";

/**
 * Signs in through the real email one-time-code flow and returns the session cookie header.
 * `apiOrigin` is where the API listens; `webOrigin` is sent as the Origin, as a browser would.
 */
export async function signIn(options: {
  apiOrigin: string;
  webOrigin: string;
  outbox: Outbox;
  email: string;
}): Promise<string> {
  const { apiOrigin, webOrigin, outbox, email } = options;
  const seen = outbox.emailsTo(email).length;
  const post = (path: string, body: unknown) =>
    fetch(`${apiOrigin}/api/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: webOrigin },
      body: JSON.stringify(body),
    });

  const sent = await post("/email-otp/send-verification-otp", { email, type: "sign-in" });
  if (!sent.ok)
    throw new Error(`Sending the sign-in code failed: ${sent.status} ${await sent.text()}`);
  const code = signInCodeFrom((await outbox.nextEmailTo(email, seen)).text);

  const signedIn = await post("/sign-in/email-otp", { email, otp: code });
  if (!signedIn.ok) throw new Error(`Sign-in failed: ${signedIn.status} ${await signedIn.text()}`);
  return signedIn.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

export function signInCodeFrom(text: string): string {
  const match = text.match(/\b(\d{6})\b/);
  if (!match?.[1]) throw new Error(`No sign-in code in: ${text}`);
  return match[1];
}

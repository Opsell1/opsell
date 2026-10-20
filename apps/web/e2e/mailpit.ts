// Reads sign-in codes from Mailpit's API, the way a person would read their inbox. The API has
// no test-only endpoints (ADR 0009).
const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://localhost:8025";

interface MailpitMessage {
  Created: string;
  Subject: string;
}

/** Waits for a sign-in email to `to` sent after `since`, and returns its 6-digit code. */
export async function signInCodeFor(to: string, since: Date, timeoutMs = 10_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  const query = encodeURIComponent(`to:"${to}"`);
  while (Date.now() < deadline) {
    const response = await fetch(`${MAILPIT_URL}/api/v1/search?query=${query}`);
    const { messages } = (await response.json()) as { messages: MailpitMessage[] };
    const fresh = messages.find((m) => Date.parse(m.Created) >= since.getTime());
    const code = fresh?.Subject.match(/\b(\d{6})\b/)?.[1];
    if (code) return code;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`No sign-in email to ${to} within ${timeoutMs}ms`);
}

import type { EmailMessage, Mailer, Sms, SmsMessage } from "@opsell/core";

/** In-memory Mailer and SMS ports that keep every message for assertions. */
export class Outbox {
  readonly emails: EmailMessage[] = [];
  readonly texts: SmsMessage[] = [];

  readonly mailer: Mailer = {
    send: async (message) => {
      this.emails.push(message);
    },
  };

  readonly sms: Sms = {
    send: async (message) => {
      this.texts.push(message);
    },
  };

  emailsTo(to: string): EmailMessage[] {
    return this.emails.filter((email) => email.to === to);
  }

  /**
   * Waits for the next email to `to` beyond the `seen` already received. Mail can be sent
   * without being awaited, so it may land just after the response that caused it.
   */
  async nextEmailTo(to: string, seen = 0, timeoutMs = 2000): Promise<EmailMessage> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const email = this.emailsTo(to)[seen];
      if (email) return email;
      if (Date.now() > deadline) throw new Error(`No email to ${to} within ${timeoutMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

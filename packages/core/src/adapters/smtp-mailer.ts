import nodemailer from "nodemailer";
import type { Mailer } from "../ports.ts";

/** Sends email over SMTP: Mailpit locally and in CI, a real provider in production. */
export function createSmtpMailer(url: string, from: string): Mailer {
  const transport = nodemailer.createTransport(url);
  return {
    async send({ to, subject, text }) {
      await transport.sendMail({ from, to, subject, text });
    },
  };
}

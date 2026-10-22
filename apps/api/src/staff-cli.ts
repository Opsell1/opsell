// Onboards Platform Staff, who are passkey-only (ADR 0006): issues a one-time enrollment link
// that registers the staff member's first passkey in the console. Run it where the API runs:
//
//   node dist/staff-cli.mjs invite --name "Sam Rivera" --email sam@opsell.com
//
// The link is printed once and works for 24 hours; send it to the person over a trusted channel.
import { parseArgs } from "node:util";
import { ENROLLMENT_TTL_HOURS, issueStaffEnrollment } from "@opsell/core";
import { systemClock } from "@opsell/core/adapters";
import { createDatabase } from "@opsell/db";
import * as z from "zod";

const USAGE = 'Usage: staff-cli invite --name "Sam Rivera" --email sam@opsell.com';

const env = z.object({ DATABASE_API_URL: z.url(), CONSOLE_ORIGIN: z.url() }).parse(process.env);

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { name: { type: "string" }, email: { type: "string" } },
});
const input = z.object({ name: z.string().trim().min(1), email: z.email() }).safeParse(values);
if (positionals[0] !== "invite" || !input.success) {
  console.error(USAGE);
  process.exit(2);
}

const db = createDatabase(env.DATABASE_API_URL, { max: 1 });
try {
  const { staff, token, expiresAt } = await issueStaffEnrollment(
    db.global,
    input.data,
    systemClock.now(),
  );
  const link = new URL("/enroll", env.CONSOLE_ORIGIN);
  // In the fragment, so the token never reaches a server log or a Referer header.
  link.hash = new URLSearchParams({ token }).toString();
  console.info(
    `Enrollment link for ${staff.name} <${staff.email}>, valid ${ENROLLMENT_TTL_HOURS} hours:`,
  );
  console.info(link.toString());
  console.info(`Expires ${expiresAt.toISOString()}.`);
} finally {
  await db.close();
}

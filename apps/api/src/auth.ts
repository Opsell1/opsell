import { type Deps, listMembershipsOfUser } from "@opsell/core";
import { accounts, sessions, users, verifications } from "@opsell/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import type { AppConfig } from "./app.ts";

const CODE_TTL_SECONDS = 10 * 60;

/**
 * Passwordless sign-in with an email one-time code (ADR 0002); SMS and passkeys come later.
 * Users are global (ADR 0010) and only existing Users can sign in. Each new session starts in
 * the User's oldest membership's Organization, which the API then uses as the tenant context.
 */
export function createAuth(deps: Deps, config: AppConfig) {
  return betterAuth({
    appName: "Opsell",
    // Browsers reach the API through the web app's /api proxy, so the web origin is public.
    baseURL: config.webOrigin,
    basePath: "/api/auth",
    secret: config.authSecret,
    trustedOrigins: [config.webOrigin],
    database: drizzleAdapter(deps.db.global, {
      provider: "pg",
      usePlural: true,
      schema: { users, sessions, accounts, verifications },
    }),
    advanced: {
      cookiePrefix: "opsell",
      database: { generateId: "uuid" },
    },
    session: {
      additionalFields: {
        activeOrganizationId: { type: "string", required: false, input: false },
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const [first] = await deps.db.withUser(session.userId, (tx) =>
              listMembershipsOfUser(tx, session.userId),
            );
            return { data: { ...session, activeOrganizationId: first?.organizationId ?? null } };
          },
        },
      },
    },
    plugins: [
      emailOTP({
        disableSignUp: true,
        otpLength: 6,
        expiresIn: CODE_TTL_SECONDS,
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== "sign-in") return;
          // Not awaited, so response time does not reveal whether the address has an account.
          deps.mailer
            .send({
              to: email,
              subject: `${otp} is your Opsell sign-in code`,
              text: `Your Opsell sign-in code is ${otp}. It expires in ${CODE_TTL_SECONDS / 60} minutes.\n\nIf you did not try to sign in, you can ignore this email.`,
            })
            .catch((error) => console.error("Sending a sign-in code failed", error));
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

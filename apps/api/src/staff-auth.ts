import { getIP } from "@better-auth/core/utils/ip";
import { passkey } from "@better-auth/passkey";
import {
  consumeEnrollmentToken,
  type Deps,
  findStaffByEnrollmentToken,
  type PlatformAction,
  type RequestOrigin,
  recordPlatformAction,
} from "@opsell/core";
import {
  platformStaff,
  platformStaffAccounts,
  platformStaffPasskeys,
  platformStaffSessions,
  platformStaffVerifications,
} from "@opsell/db";
import { APIError, type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { AppConfig } from "./app.ts";

const SESSION_HOURS = 12;
const ENROLLMENT_REFUSED = "This enrollment link is invalid, used or expired.";

/**
 * How the console resolves a client's IP address, for its sessions and every audit entry alike.
 * Better Auth masks IPv6 to a /64 by default, which suits rate limiting but not an audit log.
 */
const IP_OPTIONS = { advanced: { ipAddress: { ipv6Subnet: 128 } } } satisfies BetterAuthOptions;

/** Where a console request came from, resolved the same way for every platform audit entry. */
export function requestOriginOf(headers: Headers | undefined): RequestOrigin {
  return {
    ipAddress: headers ? getIP(headers, IP_OPTIONS) : null,
    userAgent: headers?.get("user-agent") ?? null,
  };
}

/**
 * The Platform Staff console's sign-in: a second Better Auth instance, on the Platform Staff
 * tables, so a staff member is never a User and a User can never reach the console (ADR 0006).
 * It is passkey-only. A new staff member registers their first passkey with a one-time
 * enrollment token passed as the registration's context; nothing else creates an account.
 *
 * Like the Users' auth, Better Auth stamps its own bookkeeping with the system clock; enrollment
 * expiry is a business rule and follows the injected Clock.
 */
export function createStaffAuth(deps: Deps, config: AppConfig) {
  const record = (
    staffId: string,
    action: Extract<PlatformAction, `staff.${string}`>,
    origin: RequestOrigin,
  ) =>
    deps.db.withPlatform(staffId, (tx) =>
      recordPlatformAction(tx, { action, origin, occurredAt: deps.clock.now() }),
    );

  return betterAuth({
    appName: "Opsell console",
    // Browsers reach the API through the console's own /api proxy, like the web app's (ADR 0012).
    baseURL: config.consoleOrigin,
    basePath: "/api/console/auth",
    secret: config.authSecret,
    trustedOrigins: [config.consoleOrigin],
    database: drizzleAdapter(deps.db.global, {
      provider: "pg",
      schema: {
        platformStaff,
        platformStaffSessions,
        platformStaffAccounts,
        platformStaffVerifications,
        platformStaffPasskeys,
      },
    }),
    user: { modelName: "platformStaff" },
    session: {
      modelName: "platformStaffSessions",
      expiresIn: SESSION_HOURS * 60 * 60,
      updateAge: 60 * 60,
    },
    account: { modelName: "platformStaffAccounts" },
    verification: { modelName: "platformStaffVerifications" },
    emailAndPassword: { enabled: false },
    advanced: {
      ...IP_OPTIONS.advanced,
      cookiePrefix: "opsell-console",
      database: { generateId: "uuid" },
    },
    databaseHooks: {
      session: {
        create: {
          after: async (session) => {
            await record(session.userId, "staff.signed_in", {
              ipAddress: session.ipAddress ?? null,
              userAgent: session.userAgent ?? null,
            });
          },
        },
      },
    },
    plugins: [
      passkey({
        rpID: new URL(config.consoleOrigin).hostname,
        rpName: "Opsell console",
        origin: config.consoleOrigin,
        schema: { passkey: { modelName: "platformStaffPasskeys" } },
        registration: {
          // A signed-out browser registers a first passkey with an enrollment token.
          requireSession: false,
          async resolveUser({ context }) {
            const staff = context
              ? await findStaffByEnrollmentToken(deps.db.global, context, deps.clock.now())
              : null;
            if (!staff) {
              throw new APIError("BAD_REQUEST", {
                message: ENROLLMENT_REFUSED,
              });
            }
            return { id: staff.id, name: staff.email, displayName: staff.name };
          },
          async afterVerification({ ctx, context, user }) {
            // A signed-in staff member adding another passkey needs no token.
            if (!context) return;
            const staffId = await consumeEnrollmentToken(deps.db.global, context, deps.clock.now());
            if (staffId !== user.id) {
              throw new APIError("BAD_REQUEST", {
                message: ENROLLMENT_REFUSED,
              });
            }
            await record(staffId, "staff.passkey_enrolled", requestOriginOf(ctx.headers));
            return { userId: staffId };
          },
        },
      }),
    ],
  });
}

export type StaffAuth = ReturnType<typeof createStaffAuth>;

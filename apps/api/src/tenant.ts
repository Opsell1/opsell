import type { ApiError, ErrorCode } from "@opsell/contract";
import { type Deps, getMembership, type Membership } from "@opsell/core";
import type { TenantTx } from "@opsell/db";
import { fromNodeHeaders } from "better-auth/node";
import type { Request, RequestHandler } from "express";
import type { Auth } from "./auth.ts";

export interface Reply {
  status: number;
  body: unknown;
}

export interface TenantContext {
  tx: TenantTx;
  membership: Membership;
  req: Request;
}

const STATUS: Record<ErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  internal: 500,
};

export function error(code: ErrorCode, message: string): Reply {
  return { status: STATUS[code], body: { error: { code, message } } satisfies ApiError };
}

export const ok = (body: unknown): Reply => ({ status: 200, body });

/**
 * Wraps a route so it runs inside withTenant for the session's active Organization (ADR 0011),
 * only for a User who holds a Role there. The reply is sent after the transaction commits, so a
 * client never sees success for work that rolled back.
 */
export function tenantRoute(
  deps: Deps,
  auth: Auth,
  handler: (context: TenantContext) => Promise<Reply>,
): RequestHandler {
  return async (req, res) => {
    const reply = await (async (): Promise<Reply> => {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
      if (!session) return error("unauthorized", "Sign in to continue.");
      const organizationId = session.session.activeOrganizationId;
      if (!organizationId) return error("forbidden", "You have no Role in any Organization.");
      return deps.db.withTenant(organizationId, session.user.id, async (tx) => {
        const membership = await getMembership(tx, session.user.id);
        if (!membership) return error("forbidden", "You have no Role in this Organization.");
        return handler({ tx, membership, req });
      });
    })();
    res.status(reply.status).json(reply.body);
  };
}

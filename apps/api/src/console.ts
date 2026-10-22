// The Platform Staff console's endpoints, under /api/console. Every request runs as the signed-in
// staff member; every action is written to the platform audit log in the same transaction.
import {
  DemoOrganization,
  DemoOrganizationInput,
  DemoOrganizationList,
  DemoOrganizationParams,
  PlatformAuditLog,
  StaffMe,
} from "@opsell/contract";
import {
  createDemoOrganization,
  type DemoOrganizationSummary,
  type Deps,
  getDemoOrganization,
  listDemoOrganizations,
  listPlatformAuditLog,
  type RequestOrigin,
} from "@opsell/core";
import { fromNodeHeaders } from "better-auth/node";
import express, { type Request, type RequestHandler } from "express";
import { requestOriginOf, type StaffAuth } from "./staff-auth.ts";
import { error, ok, type Reply, send } from "./tenant.ts";

const AUDIT_LOG_PAGE = 100;

interface StaffContext {
  staff: StaffMe;
  origin: RequestOrigin;
  req: Request;
}

/** Wraps a route so it runs only for a signed-in Platform Staff member. */
function staffRoute(
  staffAuth: StaffAuth,
  handler: (context: StaffContext) => Promise<Reply>,
): RequestHandler {
  return async (req, res) => {
    const headers = fromNodeHeaders(req.headers);
    const session = await staffAuth.api.getSession({ headers });
    if (!session) {
      send(res, error("unauthorized", "Sign in to the console with your passkey."));
      return;
    }
    const { id, name, email } = session.user;
    send(res, await handler({ staff: { id, name, email }, origin: requestOriginOf(headers), req }));
  };
}

function demoOrganizationJson(summary: DemoOrganizationSummary): DemoOrganization {
  return DemoOrganization.parse({ ...summary, createdAt: summary.createdAt.toISOString() });
}

export function createConsoleRouter(deps: Deps, staffAuth: StaffAuth): express.Router {
  const route = (handler: Parameters<typeof staffRoute>[1]) => staffRoute(staffAuth, handler);
  const router = express.Router();

  router.get(
    "/me",
    route(async ({ staff }) => ok(StaffMe.parse(staff))),
  );

  router.get(
    "/demo-organizations",
    route(async ({ staff }) => {
      const items = await deps.db.withPlatform(staff.id, listDemoOrganizations);
      return ok(
        DemoOrganizationList.parse({
          demoOrganizations: items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          })),
        }),
      );
    }),
  );

  router.post(
    "/demo-organizations",
    route(async ({ staff, origin, req }) => {
      const input = DemoOrganizationInput.safeParse(req.body);
      if (!input.success) {
        return error("bad_request", input.error.issues.map((i) => i.message).join("; "));
      }
      // The new Organization's id is the transaction's tenant context, so the insert can only
      // ever create that one Organization.
      const summary = await deps.db.withPlatformTenant(
        staff.id,
        crypto.randomUUID(),
        async (tx) => {
          await createDemoOrganization(tx, input.data, { ...deps, origin });
          return getDemoOrganization(tx);
        },
      );
      if (!summary) throw new Error("A Demo Organization just created could not be read back");
      return { status: 201, body: demoOrganizationJson(summary) };
    }),
  );

  router.get(
    "/demo-organizations/:organizationId",
    route(async ({ staff, req }) => {
      const params = DemoOrganizationParams.safeParse(req.params);
      if (!params.success) return error("bad_request", "organizationId must be a UUID.");
      // A regular Organization answers as if it did not exist (ADR 0006).
      const summary = await deps.db.withPlatformTenant(
        staff.id,
        params.data.organizationId,
        getDemoOrganization,
      );
      if (!summary) return error("not_found", "No such Demo Organization.");
      return ok(demoOrganizationJson(summary));
    }),
  );

  router.get(
    "/audit-log",
    route(async ({ staff }) => {
      const entries = await deps.db.withPlatform(staff.id, (tx) =>
        listPlatformAuditLog(tx, { limit: AUDIT_LOG_PAGE }),
      );
      return ok(
        PlatformAuditLog.parse({
          entries: entries.map((entry) => ({
            ...entry,
            occurredAt: entry.occurredAt.toISOString(),
          })),
        }),
      );
    }),
  );

  return router;
}

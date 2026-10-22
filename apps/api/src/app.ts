import {
  type Role as ContractRole,
  Location,
  LocationList,
  LocationParams,
  Me,
} from "@opsell/contract";
import { type Deps, getLocation, listLocations, type Role } from "@opsell/core";
import { toNodeHandler } from "better-auth/node";
import express, { type ErrorRequestHandler } from "express";
import { createAuth } from "./auth.ts";
import { createConsoleRouter } from "./console.ts";
import { createStaffAuth } from "./staff-auth.ts";
import { error, ok, send, tenantRoute } from "./tenant.ts";

// The contract cannot import the database's role enum (web clients import the contract), so the
// two lists of Roles are kept equal here, where both are visible.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const rolesMatch: Same<ContractRole, Role> = true;
void rolesMatch;

export interface AppConfig {
  /** The web app's public origin, the only one Organization users' browsers call the API from. */
  webOrigin: string;
  /** The Platform Staff console's public origin, where staff passkeys are bound. */
  consoleOrigin: string;
  authSecret: string;
}

export function createApp(deps: Deps, config: AppConfig): express.Express {
  const auth = createAuth(deps, config);
  const staffAuth = createStaffAuth(deps, config);
  const route = (handler: Parameters<typeof tenantRoute>[2]) => tenantRoute(deps, auth, handler);

  const app = express();
  app.disable("x-powered-by");
  // Liveness for the host and Docker; deliberately outside the contract and the database.
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });
  // Better Auth reads the raw body, so both instances are mounted before the JSON parser.
  app.all("/api/auth/{*any}", toNodeHandler(auth));
  app.all("/api/console/auth/{*any}", toNodeHandler(staffAuth));
  app.use(express.json());
  app.use("/api/console", createConsoleRouter(deps, staffAuth));

  const api = express.Router();
  api.get(
    "/me",
    route(async ({ membership }) => ok(Me.parse(membership))),
  );
  api.get(
    "/locations",
    route(async ({ tx }) => ok(LocationList.parse({ locations: await listLocations(tx) }))),
  );
  api.get(
    "/locations/:locationId",
    route(async ({ tx, req }) => {
      const params = LocationParams.safeParse(req.params);
      if (!params.success) return error("bad_request", "locationId must be a UUID.");
      // Another Organization's Location is invisible under Row-Level Security, so it is a 404.
      const location = await getLocation(tx, params.data.locationId);
      if (!location) return error("not_found", "No such Location.");
      return ok(Location.parse(location));
    }),
  );
  app.use("/api", api);

  app.use("/api", (_req, res) => {
    send(res, error("not_found", "No such endpoint."));
  });
  app.use(((err, _req, res, _next) => {
    console.error(err);
    send(res, error("internal", "Something went wrong."));
  }) satisfies ErrorRequestHandler);

  return app;
}

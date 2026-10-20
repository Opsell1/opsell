import { Location, LocationList, LocationParams, Me } from "@opsell/contract";
import { type Deps, getLocation, listLocations } from "@opsell/core";
import { toNodeHandler } from "better-auth/node";
import express, { type ErrorRequestHandler } from "express";
import { createAuth } from "./auth.ts";
import { error, ok, tenantRoute } from "./tenant.ts";

export interface AppConfig {
  /** The web app's public origin, the only one browsers call the API from. */
  webOrigin: string;
  authSecret: string;
}

export function createApp(deps: Deps, config: AppConfig): express.Express {
  const auth = createAuth(deps, config);
  const route = (handler: Parameters<typeof tenantRoute>[2]) => tenantRoute(deps, auth, handler);

  const app = express();
  app.disable("x-powered-by");
  // Liveness for the host and Docker; deliberately outside the contract and the database.
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });
  // Better Auth reads the raw body, so it is mounted before the JSON parser.
  app.all("/api/auth/{*any}", toNodeHandler(auth));
  app.use(express.json());

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
    const reply = error("not_found", "No such endpoint.");
    res.status(reply.status).json(reply.body);
  });
  app.use(((err, _req, res, _next) => {
    console.error(err);
    const reply = error("internal", "Something went wrong.");
    res.status(reply.status).json(reply.body);
  }) satisfies ErrorRequestHandler);

  return app;
}

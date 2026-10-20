// The API's request and response shapes. These Zod schemas generate the OpenAPI contract and
// the typed client, and validate requests in Express, so the contract cannot drift (ADR 0004).
import * as z from "zod";

export const Id = z.uuid();

export const Role = z.enum(["org_admin"]).meta({
  id: "Role",
  description: "A User's Role in the active Organization.",
});

export const Location = z
  .object({
    id: Id,
    name: z.string().meta({ example: "Valencia St" }),
    city: z.string().meta({ example: "San Francisco" }),
    state: z.string().meta({ description: "US state code", example: "CA" }),
    timeZone: z.string().meta({ description: "IANA time zone", example: "America/Los_Angeles" }),
  })
  .meta({ id: "Location", description: "A single physical store operated by an Organization." });

export const LocationList = z.object({ locations: z.array(Location) }).meta({ id: "LocationList" });

export const LocationParams = z.object({ locationId: Id });

export const Me = z
  .object({
    user: z.object({ id: Id, name: z.string(), email: z.email() }),
    organization: z.object({ id: Id, name: z.string(), isDemo: z.boolean() }),
    role: Role,
  })
  .meta({ id: "Me", description: "The signed-in User and the Organization they are acting in." });

export const ErrorCode = z.enum([
  "bad_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "internal",
]);

export const ApiError = z
  .object({ error: z.object({ code: ErrorCode, message: z.string() }) })
  .meta({ id: "Error" });

export type Location = z.infer<typeof Location>;
export type LocationList = z.infer<typeof LocationList>;
export type Me = z.infer<typeof Me>;
export type Role = z.infer<typeof Role>;
export type ErrorCode = z.infer<typeof ErrorCode>;
export type ApiError = z.infer<typeof ApiError>;

import { createDocument, type ZodOpenApiResponsesObject } from "zod-openapi";
import { ApiError, Location, LocationList, LocationParams, Me } from "./schemas.ts";

const json = <T>(schema: T) => ({ content: { "application/json": { schema } } });

const unauthorized = { description: "Not signed in", ...json(ApiError) };
const forbidden = { description: "No Role in the active Organization", ...json(ApiError) };

const signedIn = {
  "401": unauthorized,
  "403": forbidden,
} satisfies ZodOpenApiResponsesObject;

export const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Opsell API",
    version: "0.1.0",
    description:
      "Every operation runs in the signed-in User's active Organization, under Row-Level Security.",
  },
  servers: [{ url: "/api" }],
  paths: {
    "/me": {
      get: {
        operationId: "getMe",
        summary: "The signed-in User, their active Organization and Role",
        responses: { "200": { description: "OK", ...json(Me) }, ...signedIn },
      },
    },
    "/locations": {
      get: {
        operationId: "listLocations",
        summary: "The active Organization's Locations, by name",
        responses: { "200": { description: "OK", ...json(LocationList) }, ...signedIn },
      },
    },
    "/locations/{locationId}": {
      get: {
        operationId: "getLocation",
        summary: "One of the active Organization's Locations",
        requestParams: { path: LocationParams },
        responses: {
          "200": { description: "OK", ...json(Location) },
          "400": { description: "Malformed id", ...json(ApiError) },
          ...signedIn,
          "404": { description: "No such Location in this Organization", ...json(ApiError) },
        },
      },
    },
  },
});

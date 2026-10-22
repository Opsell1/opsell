import { createDocument, type ZodOpenApiResponsesObject } from "zod-openapi";
import {
  DemoOrganization,
  DemoOrganizationInput,
  DemoOrganizationList,
  DemoOrganizationParams,
  PlatformAuditLog,
  StaffMe,
} from "./console-schemas.ts";
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

const staffSignedIn = {
  "401": { description: "No Platform Staff session", ...json(ApiError) },
} satisfies ZodOpenApiResponsesObject;

/**
 * The Platform Staff console's API. Staff sign in with a passkey under `/api/console/auth`, an
 * identity separate from Organization users (ADR 0006), and see Demo Organizations only.
 */
export const consoleDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Opsell console API",
    version: "0.1.0",
    description:
      "Platform Staff console operations. Every action is written to the platform audit log.",
  },
  servers: [{ url: "/api/console" }],
  paths: {
    "/me": {
      get: {
        operationId: "getStaffMe",
        summary: "The signed-in Platform Staff member",
        responses: { "200": { description: "OK", ...json(StaffMe) }, ...staffSignedIn },
      },
    },
    "/demo-organizations": {
      get: {
        operationId: "listDemoOrganizations",
        summary: "Every Demo Organization, newest first",
        responses: {
          "200": { description: "OK", ...json(DemoOrganizationList) },
          ...staffSignedIn,
        },
      },
      post: {
        operationId: "createDemoOrganization",
        summary: "Create a Demo Organization from a seed",
        description:
          "Imports Locations, Positions and Employees from the mock data source at once, and backfills the recent Business Days' sales, time entries and tips in a job.",
        requestBody: json(DemoOrganizationInput),
        responses: {
          "201": { description: "Created", ...json(DemoOrganization) },
          "400": { description: "Invalid input", ...json(ApiError) },
          ...staffSignedIn,
        },
      },
    },
    "/demo-organizations/{organizationId}": {
      get: {
        operationId: "getDemoOrganization",
        summary: "One Demo Organization and what it holds",
        requestParams: { path: DemoOrganizationParams },
        responses: {
          "200": { description: "OK", ...json(DemoOrganization) },
          "400": { description: "Malformed id", ...json(ApiError) },
          ...staffSignedIn,
          "404": { description: "No such Demo Organization", ...json(ApiError) },
        },
      },
    },
    "/audit-log": {
      get: {
        operationId: "listPlatformAuditLog",
        summary: "The most recent console actions",
        responses: { "200": { description: "OK", ...json(PlatformAuditLog) }, ...staffSignedIn },
      },
    },
  },
});

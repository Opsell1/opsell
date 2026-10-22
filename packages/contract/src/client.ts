import createClient, { type ClientOptions } from "openapi-fetch";
import type { paths } from "./generated/openapi.ts";

export type { components, paths } from "./generated/openapi.ts";

/**
 * The typed Opsell API client. `baseUrl` ends in `/api`, the contract's server prefix: the API's
 * own origin on the server side, or the web app's origin in the browser.
 */
export function createApiClient(options: ClientOptions & { baseUrl: string }) {
  return createClient<paths>(options);
}

export type ApiClient = ReturnType<typeof createApiClient>;

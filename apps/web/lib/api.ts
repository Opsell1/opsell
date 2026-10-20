import { createApiClient, type Me } from "@opsell/contract";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { apiUrl } from "./api-url.ts";

/** The typed API client for server components, carrying the signed-in User's session cookie. */
export async function serverApi() {
  const cookie = (await cookies()).toString();
  return createApiClient({ baseUrl: `${apiUrl()}/api`, headers: { cookie }, cache: "no-store" });
}

/** The signed-in User, or null without a session. Fetched once per request. */
export const getMe = cache(async (): Promise<Me | null> => {
  const { data, response } = await (await serverApi()).GET("/me");
  if (response.status === 401 || response.status === 403) return null;
  if (!data) throw new Error(`GET /me failed with ${response.status}`);
  return data;
});

/** The signed-in User; sends anyone else to sign in. */
export async function requireMe(): Promise<Me> {
  const me = await getMe();
  if (!me) redirect("/sign-in");
  return me;
}

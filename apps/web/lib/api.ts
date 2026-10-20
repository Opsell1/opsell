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

export type Session =
  | { status: "signed-in"; me: Me }
  | { status: "signed-out" }
  /** Signed in, but holding no Role in any Organization. */
  | { status: "no-role" };

/** Who is asking, fetched once per request. */
export const getSession = cache(async (): Promise<Session> => {
  const { data, response } = await (await serverApi()).GET("/me");
  if (response.status === 401) return { status: "signed-out" };
  if (response.status === 403) return { status: "no-role" };
  if (!data) throw new Error(`GET /me failed with ${response.status}`);
  return { status: "signed-in", me: data };
});

/** Sends a request the API refused for lack of a session or Role to the page that explains it. */
export function redirectForStatus(status: number): void {
  if (status === 401) redirect("/sign-in");
  if (status === 403) redirect("/no-access");
}

/** The signed-in User; sends anyone else to sign in, or to the no-access page. */
export async function requireMe(): Promise<Me> {
  const session = await getSession();
  if (session.status === "signed-out") redirect("/sign-in");
  if (session.status === "no-role") redirect("/no-access");
  return session.me;
}

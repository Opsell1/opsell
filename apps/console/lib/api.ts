import { createConsoleClient, type StaffMe } from "@opsell/contract";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { apiUrl } from "./api-url.ts";

/** The typed console client for server components, carrying the staff member's session cookie. */
export async function serverConsoleApi() {
  const cookie = (await cookies()).toString();
  return createConsoleClient({
    baseUrl: `${apiUrl()}/api/console`,
    headers: { cookie },
    cache: "no-store",
  });
}

/** The signed-in Platform Staff member, or null; fetched once per request. */
export const getStaff = cache(async (): Promise<StaffMe | null> => {
  const { data, response } = await (await serverConsoleApi()).GET("/me");
  if (response.status === 401) return null;
  if (!data) throw new Error(`GET /me failed with ${response.status}`);
  return data;
});

/** Sends a request the API refused for lack of a staff session to sign in. */
export function redirectForStatus(status: number): void {
  if (status === 401) redirect("/sign-in");
}

/** The signed-in staff member; sends anyone else to sign in. */
export async function requireStaff(): Promise<StaffMe> {
  const staff = await getStaff();
  if (!staff) redirect("/sign-in");
  return staff;
}

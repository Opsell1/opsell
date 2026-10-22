import { OpsellMark } from "@opsell/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/api";

export const metadata: Metadata = { title: "No access" };

/** For a signed-in User who holds no Role in any Organization. */
export default async function NoAccessPage() {
  const session = await getSession();
  if (session.status === "signed-out") redirect("/sign-in");
  if (session.status === "signed-in") redirect("/locations");

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="grid max-w-[380px] justify-items-center gap-4 text-center">
        <OpsellMark size={40} />
        <h1 className="m-0 text-h2">You do not have access yet</h1>
        <p className="m-0 text-[13px] text-text-secondary leading-[18px]">
          Your account is not part of an Organization in Opsell. Ask your Org Admin to add you, then
          sign in again.
        </p>
        <SignOutButton />
      </div>
    </main>
  );
}

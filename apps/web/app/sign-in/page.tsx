import { OpsellMark } from "@opsell/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  if (await getMe()) redirect("/locations");

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="grid w-full max-w-[380px] gap-6">
        <div className="grid justify-items-center gap-4 text-center">
          <OpsellMark size={40} />
          <h1 className="m-0 text-h2">Sign in to Opsell</h1>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-card p-6 shadow-elev-card">
          <SignInForm />
        </div>
      </div>
    </main>
  );
}

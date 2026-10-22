import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignedOutCard } from "@/components/signed-out-card";
import { getStaff } from "@/lib/api";
import { PasskeySignIn } from "./passkey-sign-in";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  if (await getStaff()) redirect("/demo-organizations");

  return (
    <SignedOutCard title="Sign in to the Opsell console">
      <PasskeySignIn />
    </SignedOutCard>
  );
}

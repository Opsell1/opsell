import type { Metadata } from "next";
import { SignedOutCard } from "@/components/signed-out-card";
import { EnrollPasskey } from "./enroll-passkey";

export const metadata: Metadata = { title: "Create your passkey" };

/** Where an enrollment link lands; its token rides in the URL fragment, read in the browser. */
export default function EnrollPage() {
  return (
    <SignedOutCard title="Create your console passkey">
      <EnrollPasskey />
    </SignedOutCard>
  );
}

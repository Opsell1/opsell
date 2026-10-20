import type { ReactNode } from "react";
import { requireMe } from "@/lib/api";
import { Shell } from "./shell";

/** Every signed-in page sits in the app shell; anyone without a session is sent to sign in. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  return <Shell me={await requireMe()}>{children}</Shell>;
}

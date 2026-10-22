import type { ReactNode } from "react";
import { requireStaff } from "@/lib/api";
import { Shell } from "./shell";

/** Every console page sits in the shell; anyone without a staff session is sent to sign in. */
export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  return <Shell staff={await requireStaff()}>{children}</Shell>;
}

import type { ReactNode } from "react";
import { requireMe } from "@/lib/api";
import { Shell } from "./shell";

/** Every signed-in page sits in the app shell; anyone without a session is sent to sign in. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const me = await requireMe();
  return (
    <Shell
      organization={{ name: me.organization.name, isDemo: me.organization.isDemo }}
      user={{ name: me.user.name, email: me.user.email }}
    >
      {children}
    </Shell>
  );
}

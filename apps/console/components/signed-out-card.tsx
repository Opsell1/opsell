import { OpsellMark } from "@opsell/ui";
import type { ReactNode } from "react";

/** The centered card the sign-in and enrollment pages share, as on the web app's sign-in. */
export function SignedOutCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="grid w-full max-w-[380px] gap-6">
        <div className="grid justify-items-center gap-4 text-center">
          <OpsellMark size={40} />
          <div className="grid gap-1">
            <h1 className="m-0 text-h2">{title}</h1>
            <p className="m-0 text-[13px] text-text-secondary leading-[18px]">
              For Opsell Platform Staff
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-card p-6 shadow-elev-card">
          {children}
        </div>
      </div>
    </main>
  );
}

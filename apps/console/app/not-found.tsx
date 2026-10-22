import { Button, OpsellMark } from "@opsell/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="grid max-w-[380px] justify-items-center gap-4 text-center">
        <OpsellMark size={40} />
        <h1 className="m-0 text-h2">Page not found</h1>
        <p className="m-0 text-[13px] text-text-secondary leading-[18px]">
          This page does not exist, or it is not a Demo Organization.
        </p>
        <Button asChild>
          <Link href="/demo-organizations">Go to Demo Organizations</Link>
        </Button>
      </div>
    </main>
  );
}

"use client";

import { Button, OpsellMark } from "@opsell/ui";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";

/** Catches failures outside a page's own boundary, such as the API being unreachable. */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="grid max-w-[380px] justify-items-center gap-4 text-center">
        <OpsellMark size={40} />
        <h1 className="m-0 text-h2">Opsell is not responding</h1>
        <p className="m-0 text-[13px] text-text-secondary leading-[18px]">
          Something went wrong on our side. Try again in a moment.
        </p>
        <Button onClick={() => retry()}>
          <RotateCw size={14} aria-hidden />
          Try again
        </Button>
      </div>
    </main>
  );
}

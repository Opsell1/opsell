"use client";

import { Button, ErrorAlert, Page, PageHead } from "@opsell/ui";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";

export default function LocationsError({
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
    <Page>
      <PageHead title="Locations" />
      <ErrorAlert
        title="Locations could not be loaded"
        action={
          <Button size="sm" onClick={() => retry()}>
            <RotateCw size={14} aria-hidden />
            Try again
          </Button>
        }
      >
        <span>Something went wrong on our side. Try again in a moment.</span>
      </ErrorAlert>
    </Page>
  );
}

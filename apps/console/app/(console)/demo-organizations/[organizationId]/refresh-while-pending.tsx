"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const INTERVAL_MS = 2000;

/** Re-renders the page from the server every few seconds while the backfill job is running. */
export function RefreshWhilePending({ pending }: { pending: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => router.refresh(), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pending, router]);
  return null;
}

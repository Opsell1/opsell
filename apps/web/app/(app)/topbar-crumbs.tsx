"use client";

import { Breadcrumbs, CurrentCrumb } from "@opsell/ui";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = { "/locations": "Locations" };

export function TopbarCrumbs() {
  const title = TITLES[usePathname()];
  if (!title) return null;
  return (
    <Breadcrumbs>
      <CurrentCrumb>{title}</CurrentCrumb>
    </Breadcrumbs>
  );
}

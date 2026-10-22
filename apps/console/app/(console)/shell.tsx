"use client";

import type { StaffMe } from "@opsell/contract";
import {
  AppShell,
  Avatar,
  Breadcrumbs,
  CurrentCrumb,
  Sidebar,
  SidebarGroupLabel,
  SidebarNavItem,
  Topbar,
} from "@opsell/ui";
import { Presentation, ScrollText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";

const NAV = [
  { group: "Demos", href: "/demo-organizations", label: "Demo Organizations", icon: Presentation },
  { group: "Oversight", href: "/audit-log", label: "Audit log", icon: ScrollText },
] as const;

export function Shell({ staff, children }: { staff: StaffMe; children: ReactNode }) {
  const pathname = usePathname();
  const current = NAV.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  return (
    <AppShell
      navKey={pathname}
      sidebar={
        <Sidebar organizationName="Opsell console">
          {NAV.map(({ group, href, label, icon: Icon }) => (
            <div key={href} className="contents">
              <SidebarGroupLabel>{group}</SidebarGroupLabel>
              <SidebarNavItem active={current?.href === href}>
                <Link href={href}>
                  <Icon size={20} aria-hidden />
                  <span>{label}</span>
                </Link>
              </SidebarNavItem>
            </div>
          ))}
        </Sidebar>
      }
    >
      <Topbar actions={<StaffMenu staff={staff} />}>
        {current ? (
          <Breadcrumbs>
            {pathname === current.href ? (
              <CurrentCrumb>{current.label}</CurrentCrumb>
            ) : (
              // Below a section's own page, its crumb leads back up; the page names itself.
              <Link href={current.href} className="hover:text-text-primary">
                {current.label}
              </Link>
            )}
          </Breadcrumbs>
        ) : null}
      </Topbar>
      {children}
    </AppShell>
  );
}

function StaffMenu({ staff }: { staff: StaffMe }) {
  return (
    <>
      <span className="flex items-center gap-2" title={staff.email}>
        <Avatar name={staff.name} size={28} />
        <span className="font-medium text-[13px] leading-[18px] max-tablet:hidden">
          {staff.name}
        </span>
      </span>
      <SignOutButton variant="ghost" size="sm" />
    </>
  );
}

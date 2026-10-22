"use client";

import type { Me } from "@opsell/contract";
import { AppShell, Avatar, Sidebar, SidebarGroupLabel, SidebarNavItem, Topbar } from "@opsell/ui";
import { Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { TopbarCrumbs } from "./topbar-crumbs";

const NAV = [{ href: "/locations", label: "Locations", icon: Store }] as const;

export function Shell({ me, children }: { me: Me; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AppShell
      navKey={pathname}
      sidebar={
        <Sidebar organizationName={me.organization.name} isDemo={me.organization.isDemo}>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          {NAV.map(({ href, label, icon: Icon }) => (
            <SidebarNavItem
              key={href}
              active={pathname === href || pathname.startsWith(`${href}/`)}
            >
              <Link href={href}>
                <Icon size={20} aria-hidden />
                <span>{label}</span>
              </Link>
            </SidebarNavItem>
          ))}
        </Sidebar>
      }
    >
      <Topbar actions={<UserMenu user={me.user} />}>
        <TopbarCrumbs />
      </Topbar>
      {children}
    </AppShell>
  );
}

function UserMenu({ user }: { user: Me["user"] }) {
  return (
    <>
      <span className="flex items-center gap-2" title={user.email}>
        <Avatar name={user.name} size={28} />
        <span className="font-medium text-[13px] leading-[18px] max-tablet:hidden">
          {user.name}
        </span>
      </span>
      <SignOutButton variant="ghost" size="sm" />
    </>
  );
}

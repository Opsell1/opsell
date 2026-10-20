"use client";

import {
  AppShell,
  Avatar,
  Button,
  Sidebar,
  SidebarGroupLabel,
  SidebarNavItem,
  Topbar,
} from "@opsell/ui";
import { LogOut, Store } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { TopbarCrumbs } from "./topbar-crumbs";

const NAV = [{ href: "/locations", label: "Locations", icon: Store }] as const;

export function Shell({
  organization,
  user,
  children,
}: {
  organization: { name: string; isDemo: boolean };
  user: { name: string; email: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AppShell
      navKey={pathname}
      sidebar={
        <Sidebar organizationName={organization.name} isDemo={organization.isDemo}>
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
      <Topbar actions={<UserMenu user={user} />}>
        <TopbarCrumbs />
      </Topbar>
      {children}
    </AppShell>
  );
}

function UserMenu({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <>
      <span className="flex items-center gap-2" title={user.email}>
        <Avatar name={user.name} size={28} />
        <span className="font-medium text-[13px] leading-[18px] max-tablet:hidden">
          {user.name}
        </span>
      </span>
      <Button variant="ghost" size="sm" onClick={signOut} aria-busy={signingOut || undefined}>
        <LogOut size={16} aria-hidden />
        Sign out
      </Button>
    </>
  );
}

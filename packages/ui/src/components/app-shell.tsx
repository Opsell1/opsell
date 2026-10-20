"use client";

// The app shell from corporate-dashboards v2 variant B: a sidebar with the Organization and the
// nav, and a column with the topbar over a scrolling page. Below the tablet breakpoint the
// sidebar becomes a drawer opened from the topbar's menu button.
import { Menu } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "../cn.ts";
import { Button } from "./button.tsx";
import { OpsellMark } from "./opsell-mark.tsx";

const ShellContext = createContext<{ navOpen: boolean; setNavOpen(open: boolean): void } | null>(
  null,
);

function useShell() {
  const context = useContext(ShellContext);
  if (!context) throw new Error("Shell parts must be inside <AppShell>");
  return context;
}

export function AppShell({
  sidebar,
  children,
  navKey,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  /** Changes on navigation, closing the drawer; pass the current path. */
  navKey?: string;
}) {
  const [navOpen, setOpen] = useState(false);
  const setNavOpen = useCallback((open: boolean) => setOpen(open), []);
  const value = useMemo(() => ({ navOpen, setNavOpen }), [navOpen, setNavOpen]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: navKey changes mean "navigated".
  useEffect(() => setOpen(false), [navKey]);

  return (
    <ShellContext.Provider value={value}>
      <div className="relative flex h-dvh min-h-0 overflow-hidden">
        {navOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-surface-scrim tablet:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}
        {sidebar}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </ShellContext.Provider>
  );
}

export function Sidebar({
  organizationName,
  isDemo,
  children,
}: {
  organizationName: string;
  isDemo?: boolean;
  children: ReactNode;
}) {
  const { navOpen } = useShell();
  return (
    <nav
      aria-label="Main"
      data-open={navOpen}
      className={cn(
        "flex w-60 flex-none flex-col gap-0.5 overflow-y-auto border-border-default border-r bg-surface-sidebar p-3",
        "max-tablet:fixed max-tablet:inset-y-0 max-tablet:left-0 max-tablet:z-40 max-tablet:shadow-elev-drawer",
        "max-tablet:-translate-x-full max-tablet:transition-transform max-tablet:duration-(--duration-panel) max-tablet:ease-enter",
        "max-tablet:data-[open=true]:translate-x-0 motion-reduce:transition-none",
      )}
    >
      <div className="mb-3 flex h-10 items-center gap-2.5 rounded-md px-2">
        <OpsellMark size={24} />
        <b className="flex-1 truncate font-semibold text-[14px]">{organizationName}</b>
        {isDemo ? (
          <span className="inline-flex h-[18px] items-center rounded-xs bg-accent-bg px-1.5 font-semibold text-[11px] text-accent-text tracking-[0.02em]">
            DEMO
          </span>
        ) : null}
      </div>
      {children}
    </nav>
  );
}

export function SidebarGroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2 pt-4 pb-1 font-medium text-[11px] text-text-tertiary">{children}</div>
  );
}

/**
 * A nav link. Pass the router's link element, holding a 20px icon and the label, as the only
 * child, and `active` on the current page.
 */
export function SidebarNavItem({ active, children }: { active?: boolean; children: ReactNode }) {
  return (
    <Slot.Root
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 cursor-pointer items-center gap-2.5 rounded-sm px-2 font-medium text-[14px] text-text-secondary no-underline",
        "transition-colors duration-(--duration-instant) ease-standard",
        "hover:bg-surface-hover hover:text-text-primary focus-visible:shadow-elev-focus focus-visible:outline-none",
        "aria-[current=page]:bg-accent-bg aria-[current=page]:text-text-primary",
        "[&>svg]:text-text-tertiary hover:[&>svg]:text-text-secondary aria-[current=page]:[&>svg]:text-accent-text",
      )}
    >
      {children}
    </Slot.Root>
  );
}

export function Topbar({ children, actions }: { children?: ReactNode; actions?: ReactNode }) {
  const { navOpen, setNavOpen } = useShell();
  return (
    <header className="flex h-14 flex-none items-center gap-3 border-border-default border-b bg-surface-canvas px-6 max-tablet:px-4">
      <Button
        variant="ghost"
        icon
        aria-label="Open navigation"
        aria-expanded={navOpen}
        className="tablet:hidden"
        onClick={() => setNavOpen(true)}
      >
        <Menu size={20} aria-hidden />
      </Button>
      {children}
      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </header>
  );
}

export function Breadcrumbs({ children }: { children: ReactNode }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1.5 text-[14px] text-text-secondary"
    >
      {children}
    </nav>
  );
}

export function CurrentCrumb({ children }: { children: ReactNode }) {
  return (
    <span aria-current="page" className="font-medium text-text-primary">
      {children}
    </span>
  );
}

/** The scrolling page area under the topbar. */
export function Page({ className, ...props }: ComponentProps<"main">) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <main
        className={cn(
          "grid max-w-[1440px] content-start gap-5 px-8 pt-6 pb-16 max-tablet:px-4 max-tablet:pt-4",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/** A page's title with its scope line (for example "5 Locations"), and optional actions. */
export function PageHead({
  title,
  scope,
  actions,
}: {
  title: ReactNode;
  scope?: ReactNode[];
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid min-w-0 gap-1">
        <h1 className="m-0 text-h1">{title}</h1>
        {scope?.length ? (
          <span className="flex flex-wrap items-center gap-2 text-[13px] text-text-secondary">
            {scope.map((part, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: the scope line is static per render.
              <span key={i} className="contents">
                {i > 0 ? (
                  <span aria-hidden className="size-[3px] rounded-full bg-text-disabled" />
                ) : null}
                <span>{part}</span>
              </span>
            ))}
          </span>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

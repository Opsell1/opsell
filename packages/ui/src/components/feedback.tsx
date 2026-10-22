import { CircleAlert, type LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn.ts";

/** A shimmering placeholder for content that is loading. */
export function Skeleton({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-shimmer rounded-xs bg-[linear-gradient(90deg,var(--surface-hover)_0%,var(--border-subtle)_50%,var(--surface-hover)_100%)] bg-size-[200%_100%] motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid justify-items-center gap-2 px-6 py-10 text-center">
      <span className="mb-1 grid size-10 place-items-center rounded-md bg-surface-hover text-text-secondary">
        <Icon size={20} aria-hidden />
      </span>
      <b className="font-semibold text-[15px]">{title}</b>
      {children ? (
        <p className="m-0 mb-2 max-w-[280px] text-[13px] text-text-secondary leading-[18px]">
          {children}
        </p>
      ) : null}
      {action}
    </div>
  );
}

/** An inline message that something went wrong, with an optional action. */
export function ErrorAlert({
  title,
  children,
  action,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-md border border-danger-border bg-danger-bg px-3 py-2.5 text-[13px] text-danger-text leading-[18px]",
        className,
      )}
    >
      <CircleAlert size={16} aria-hidden className="mt-px flex-none" />
      <div className="grid flex-1 gap-0.5">
        <b className="font-semibold">{title}</b>
        {children}
      </div>
      {action ? <div className="flex-none">{action}</div> : null}
    </div>
  );
}

import type { ComponentProps } from "react";
import { cn } from "../cn.ts";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-auto rounded-lg border border-border-default bg-surface-card">
      <table
        className={cn(
          "w-full border-separate border-spacing-0 text-[14px] tabular-nums leading-5",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("[&>tr:last-child>td]:border-b-0", className)} {...props} />;
}

export function TableRow(props: ComponentProps<"tr">) {
  return <tr {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "sticky top-0 z-1 h-9 whitespace-nowrap border-border-default border-b bg-surface-card px-4 text-left font-medium text-[12px] text-text-tertiary",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "h-11 whitespace-nowrap border-border-subtle border-b bg-surface-card px-4",
        className,
      )}
      {...props}
    />
  );
}

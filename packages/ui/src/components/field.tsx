import { Label as LabelPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn.ts";

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("font-medium text-[13px] text-text-primary leading-[18px]", className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-border-strong bg-surface-card px-2.5 text-[14px] text-text-primary leading-5",
        "placeholder:text-text-tertiary hover:border-text-tertiary",
        "focus:border-accent-solid focus:shadow-elev-focus focus:outline-none",
        "aria-invalid:border-danger-text disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-text-disabled",
        className,
      )}
      {...props}
    />
  );
}

/** A label, its control, and optional help or error text, stacked. */
export function Field({
  label,
  htmlFor,
  help,
  error,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  help?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="m-0 text-[12px] text-danger-text leading-4">
          {error}
        </p>
      ) : help ? (
        <p id={`${htmlFor}-help`} className="m-0 text-[12px] text-text-tertiary leading-4">
          {help}
        </p>
      ) : null}
    </div>
  );
}

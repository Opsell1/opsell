import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../cn.ts";

export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap",
    "rounded-md border border-transparent font-medium no-underline",
    "transition-[background-color,border-color,color,box-shadow] duration-(--duration-instant) ease-standard",
    "focus-visible:shadow-elev-focus focus-visible:outline-none active:enabled:translate-y-[0.5px]",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-hover disabled:text-text-disabled disabled:shadow-none",
    "aria-busy:pointer-events-none aria-busy:cursor-progress",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-accent-solid text-accent-on-solid hover:bg-accent-solid-hover active:bg-cobalt-800",
        secondary:
          "border-border-default bg-surface-card text-text-primary shadow-elev-card hover:border-border-strong hover:bg-surface-hover active:bg-border-subtle",
        ghost:
          "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary active:bg-border-default active:text-text-primary disabled:bg-transparent",
      },
      size: {
        sm: "h-7 px-2.5 text-[13px] leading-5",
        md: "h-8 px-3 text-[14px] leading-5",
        lg: "h-10 px-4 text-[14px] leading-5",
      },
      icon: { true: "px-0" },
    },
    compoundVariants: [
      { icon: true, size: "sm", className: "w-7" },
      { icon: true, size: "md", className: "w-8" },
      { icon: true, size: "lg", className: "w-10" },
    ],
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, icon, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";
  return (
    <Component className={cn(buttonVariants({ variant, size, icon }), className)} {...props} />
  );
}

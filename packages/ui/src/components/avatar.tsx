import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "../cn.ts";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  size = 28,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn("inline-grid flex-none place-items-center rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <AvatarPrimitive.Fallback
        className="grid size-full place-items-center rounded-full bg-neutral-700 font-semibold text-neutral-100 tracking-[0.02em]"
        style={{ fontSize: Math.round(size * 0.4) }}
      >
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

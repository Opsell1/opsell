import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The design system replaces Tailwind's type scale, so teach tailwind-merge its text-* sizes;
// otherwise it would treat text-body and text-text-primary as the same group.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "kpi",
            "kpi-sm",
            "number",
            "display",
            "h1",
            "h2",
            "h3",
            "body",
            "body-strong",
            "small",
            "caption",
            "label",
            "code",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

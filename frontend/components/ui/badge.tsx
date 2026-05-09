import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-1)]/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--wave-teal)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

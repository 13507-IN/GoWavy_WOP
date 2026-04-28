import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-none border border-[color:var(--border-strong)] bg-[color:var(--surface-1)] px-4 text-sm text-[color:var(--wave-ink)] shadow-sm backdrop-blur placeholder:text-[color:var(--text-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wave-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--wave-cream)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

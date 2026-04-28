import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "glow";
type ButtonSize = "default" | "lg" | "sm" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-none text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wave-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--wave-cream)] disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[color:var(--wave-teal)] text-white shadow-[0_20px_60px_-40px_var(--text-subtle)] hover:translate-y-[-1px] hover:brightness-95",
  outline:
    "border border-[color:var(--border-strong)] bg-[color:var(--surface-1)] text-[color:var(--wave-ink)] backdrop-blur hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-3)]",
  ghost:
    "text-[color:var(--wave-teal)] hover:text-[color:var(--wave-ink)] hover:bg-[color:var(--surface-4)]",
  glow:
    "bg-[color:var(--wave-red)] text-white shadow-[0_25px_70px_-35px_rgba(255,93,115,0.6)] hover:translate-y-[-1px] hover:brightness-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-6",
  lg: "h-12 px-7 text-base",
  sm: "h-9 px-4 text-xs",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "default", asChild = false, children, ...props },
    ref
  ) => {
    const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        ...props,
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

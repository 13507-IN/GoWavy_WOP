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
  "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wave-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--wave-cream)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[linear-gradient(135deg,var(--wave-teal),var(--wave-blue))] text-white shadow-[0_24px_60px_-38px_var(--glow)] hover:translate-y-[-1px] hover:shadow-[0_28px_70px_-38px_var(--glow)]",
  outline:
    "border border-[color:var(--border-strong)] bg-[color:var(--surface-1)]/90 text-[color:var(--wave-ink)] backdrop-blur hover:border-[color:var(--wave-teal)]/45 hover:bg-[color:var(--surface-3)]",
  ghost:
    "text-[color:var(--wave-teal)] hover:text-[color:var(--wave-ink)] hover:bg-[color:var(--surface-4)]/80",
  glow:
    "bg-[linear-gradient(135deg,var(--wave-red),#ff8897)] text-white shadow-[0_30px_75px_-35px_rgba(255,93,115,0.7)] hover:translate-y-[-1px] hover:shadow-[0_35px_84px_-35px_rgba(255,93,115,0.8)]",
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

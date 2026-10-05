import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-dark shadow-sm disabled:opacity-60 disabled:cursor-not-allowed",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-surface-2 disabled:opacity-60 disabled:cursor-not-allowed",
  ghost: "text-foreground hover:bg-surface-2 disabled:opacity-60 disabled:cursor-not-allowed",
  danger: "bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-60 disabled:cursor-not-allowed",
  icon: "border border-border bg-surface text-foreground hover:bg-surface-2 p-2 disabled:opacity-60 disabled:cursor-not-allowed"
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  icon: "h-9 w-9 p-0 justify-center"
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </button>
  )
);
Button.displayName = "Button";

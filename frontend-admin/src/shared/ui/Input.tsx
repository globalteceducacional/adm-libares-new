import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground",
        "placeholder:text-muted transition-colors",
        "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        invalid && "border-danger focus:border-danger focus:ring-danger/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

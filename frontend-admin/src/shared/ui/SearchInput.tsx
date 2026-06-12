import { Search } from "lucide-react";
import { cn } from "../lib/cn";
import { Input, type InputProps } from "./Input";

export function SearchInput({ className, ...props }: InputProps) {
  return (
    <label className={cn("relative block min-w-0", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <Input className="pl-9" {...props} />
    </label>
  );
}

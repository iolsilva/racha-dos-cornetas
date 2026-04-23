import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-white/20 bg-slate-900 text-amber-400 focus:ring-amber-400/40",
        className,
      )}
      {...props}
    />
  );
}

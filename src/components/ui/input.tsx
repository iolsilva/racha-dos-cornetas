import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "h-11 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

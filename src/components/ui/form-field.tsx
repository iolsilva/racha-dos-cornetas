import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function FormField({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("grid gap-2 text-sm text-slate-300", className)}>
      <span className="font-medium text-slate-200">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

import type { HTMLAttributes, TableHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cn("w-full text-left text-sm text-slate-200", className)} {...props} />
  );
}

export function Th({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-3 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export function Td({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-t border-white/5 px-3 py-3 align-middle text-slate-200",
        className,
      )}
      {...props}
    />
  );
}

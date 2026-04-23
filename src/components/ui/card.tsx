import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.4)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

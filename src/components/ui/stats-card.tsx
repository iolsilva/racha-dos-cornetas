import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3">
          <Icon className="h-5 w-5 text-amber-300" />
        </div>
      </div>
    </Card>
  );
}

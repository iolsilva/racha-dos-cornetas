import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <Badge>{eyebrow}</Badge> : null}
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

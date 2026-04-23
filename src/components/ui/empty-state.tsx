import { Trophy } from "lucide-react";

import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full bg-white/5 p-4">
        <Trophy className="h-8 w-8 text-amber-300" />
      </div>
      <div>
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="mt-1 max-w-md text-sm text-slate-400">{description}</p>
      </div>
    </Card>
  );
}

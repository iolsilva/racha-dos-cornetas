"use client";

import { ChevronDown, PencilLine } from "lucide-react";
import { useState } from "react";

import { MatchEditorForm } from "@/components/forms/match-editor-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MatchRow = {
  id: string;
  match_date: string;
  starts_at: string | null;
  location: string;
  status: "scheduled" | "completed" | "cancelled";
  counts_for_ranking: boolean;
  blue_score: number | null;
  red_score: number | null;
  notes: string | null;
};

type PlayerRow = {
  id: string;
  full_name: string;
  nickname: string;
  position: "line" | "goalkeeper";
  player_type: "fixed" | "guest" | "goalkeeper";
  fee_exempt: boolean;
  active: boolean;
};

type AssignmentRow = {
  id: string;
  match_id: string;
  player_id: string;
  match_date: string;
  nickname: string;
  team_color: "blue" | "red";
  is_goalkeeper: boolean;
  is_reserve: boolean;
  lineup_order: number | null;
};

export function MatchEditorPanel({
  matches,
  players,
  assignments,
}: {
  matches: MatchRow[];
  players: PlayerRow[];
  assignments: AssignmentRow[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Editar partida existente
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Correcao completa com recalculo seguro do ranking
          </h3>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Abra o editor apenas quando precisar corrigir data, participantes,
            diaristas, times, observacoes, placar ou status da rodada.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-amber-400/30 bg-amber-400/10 text-amber-100">
            Edicao robusta
          </Badge>
          <Button
            type="button"
            variant={isOpen ? "secondary" : "primary"}
            onClick={() => setIsOpen((current) => !current)}
          >
            <PencilLine className="h-4 w-4" />
            {isOpen ? "Fechar editor" : "Editar partida"}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isOpen ? "rotate-180" : "rotate-0",
              )}
            />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-1">
            <MatchEditorForm
              matches={matches}
              players={players}
              assignments={assignments}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

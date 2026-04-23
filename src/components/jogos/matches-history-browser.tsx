"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { teamColors } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { formatMatchStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

type MatchRow = {
  id: string;
  match_date: string;
  location: string;
  status: string;
  blue_score: number | null;
  red_score: number | null;
  notes?: string | null;
};

type AssignmentRow = {
  id: string;
  match_id: string;
  player_id: string;
  match_date: string;
  team_color: keyof typeof teamColors;
  nickname: string;
  is_goalkeeper: boolean;
  is_reserve: boolean;
};

export function MatchesHistoryBrowser({
  matches,
  assignments,
}: {
  matches: MatchRow[];
  assignments: AssignmentRow[];
}) {
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id ?? null);

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === selectedMatchId) ?? matches[0] ?? null,
    [matches, selectedMatchId],
  );

  const selectedAssignments = useMemo(
    () =>
      assignments.filter((assignment) => assignment.match_id === selectedMatch?.id),
    [assignments, selectedMatch],
  );

  const blueTeam = selectedAssignments.filter(
    (assignment) => assignment.team_color === "blue",
  );
  const redTeam = selectedAssignments.filter(
    (assignment) => assignment.team_color === "red",
  );

  function getWinner(teamColor: "blue" | "red") {
    if (!selectedMatch || selectedMatch.blue_score === null || selectedMatch.red_score === null) {
      return false;
    }

    if (selectedMatch.blue_score === selectedMatch.red_score) {
      return false;
    }

    return teamColor === "blue"
      ? selectedMatch.blue_score > selectedMatch.red_score
      : selectedMatch.red_score > selectedMatch.blue_score;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card className="mesh-panel overflow-hidden">
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Historico de partidas
            </p>
            <div className="rounded-full border border-white/10 bg-white/5 p-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
          </div>
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            Toque em um card para abrir a escalacao daquele dia no painel ao lado.
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          {matches.length === 0 ? (
            <EmptyState
              title="Sem partidas no historico"
              description="Quando os jogos forem registrados, eles aparecem aqui em formato de cards."
            />
          ) : (
            matches.map((match) => {
              const isSelected = match.id === selectedMatch?.id;

              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => setSelectedMatchId(match.id)}
                  className={cn(
                    "group rounded-[26px] border p-4 text-left transition",
                    isSelected
                      ? "border-amber-400/40 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(15,23,42,0.9))] shadow-[0_18px_40px_rgba(250,204,21,0.12)]"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {formatDate(match.match_date)}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>{match.location}</span>
                      </div>
                    </div>
                    <Badge>{formatMatchStatusLabel(match.status)}</Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100">
                      {match.blue_score ?? "-"} x {match.red_score ?? "-"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>Ver times</span>
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Times do dia
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {selectedMatch ? formatDate(selectedMatch.match_date) : "Selecione uma partida"}
            </h3>
            {selectedMatch ? (
              <p className="mt-1 text-sm text-slate-400">{selectedMatch.location}</p>
            ) : null}
          </div>
          {selectedMatch ? (
            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(15,23,42,0.85))] px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Placar</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {selectedMatch.blue_score ?? "-"} x {selectedMatch.red_score ?? "-"}
              </p>
            </div>
          ) : null}
        </div>

        {!selectedMatch ? (
          <div className="mt-4">
            <EmptyState
              title="Nenhuma partida selecionada"
              description="Escolha um card do historico para ver os times completos daquele dia."
            />
          </div>
        ) : selectedAssignments.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Sem times salvos"
              description="Essa partida existe no historico, mas ainda nao possui escalacao registrada."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div
              className={cn(
                "rounded-[28px] border p-4",
                getWinner("blue")
                  ? "border-sky-300/30 bg-[linear-gradient(160deg,rgba(14,165,233,0.22),rgba(15,23,42,0.94))] shadow-[0_20px_40px_rgba(14,165,233,0.14)]"
                  : "border-sky-400/20 bg-sky-500/10",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sky-200" />
                  <p className="font-semibold uppercase tracking-[0.14em] text-sky-100">
                    Azul
                  </p>
                </div>
                <Badge className={teamColors.blue.classes}>
                  {getWinner("blue") ? "Vencedor" : "Time azul"}
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                {blueTeam.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{player.nickname}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {player.is_goalkeeper
                          ? "Goleiro"
                          : player.is_reserve
                            ? "Reserva"
                            : "Titular"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={cn(
                "rounded-[28px] border p-4",
                getWinner("red")
                  ? "border-rose-300/30 bg-[linear-gradient(160deg,rgba(244,63,94,0.22),rgba(15,23,42,0.94))] shadow-[0_20px_40px_rgba(244,63,94,0.14)]"
                  : "border-rose-400/20 bg-rose-500/10",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-rose-200" />
                  <p className="font-semibold uppercase tracking-[0.14em] text-rose-100">
                    Vermelho
                  </p>
                </div>
                <Badge className={teamColors.red.classes}>
                  {getWinner("red") ? "Vencedor" : "Time vermelho"}
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                {redTeam.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{player.nickname}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {player.is_goalkeeper
                          ? "Goleiro"
                          : player.is_reserve
                            ? "Reserva"
                            : "Titular"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedMatch?.notes ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-300">
              <CalendarDays className="h-4 w-4 text-amber-300" />
              <p className="text-sm">{selectedMatch.notes}</p>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

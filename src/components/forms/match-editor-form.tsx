"use client";

import { useState } from "react";

import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { teamColors } from "@/lib/constants";
import {
  formatMatchStatusLabel,
  formatPlayerStatusLabel,
  formatPlayerTypeLabel,
} from "@/lib/labels";
import { cn } from "@/lib/utils";
import { updateMatchAction } from "@/server/actions/admin";

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
  player_type: "fixed" | "guest" | "goalkeeper";
  active: boolean;
};

type AssignmentRow = {
  id: string;
  match_id: string;
  player_id: string;
  team_color: "blue" | "red";
  is_goalkeeper: boolean;
  is_reserve: boolean;
  lineup_order: number | null;
};

type AssignmentDraft = {
  included: boolean;
  teamColor: "blue" | "red";
  isGoalkeeper: boolean;
  isReserve: boolean;
  lineupOrder: string;
};

type MatchDraft = {
  matchDate: string;
  startTime: string;
  location: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
  countsForRanking: boolean;
  blueScore: string;
  redScore: string;
  assignmentMap: Record<string, AssignmentDraft>;
};

function extractTime(startsAt: string | null) {
  if (!startsAt) {
    return "";
  }

  const match = startsAt.match(/T(\d{2}:\d{2})/);
  return match?.[1] ?? "";
}

function buildAssignmentMap(players: PlayerRow[], assignments: AssignmentRow[]) {
  const map: Record<string, AssignmentDraft> = Object.fromEntries(
    players.map((player) => [
      player.id,
      {
        included: false,
        teamColor: "blue" as const,
        isGoalkeeper: player.player_type === "goalkeeper",
        isReserve: false,
        lineupOrder: "",
      },
    ]),
  );

  assignments.forEach((assignment) => {
    map[assignment.player_id] = {
      included: true,
      teamColor: assignment.team_color,
      isGoalkeeper: assignment.is_goalkeeper,
      isReserve: assignment.is_reserve,
      lineupOrder: assignment.lineup_order ? String(assignment.lineup_order) : "",
    };
  });

  return map;
}

function buildMatchDraft(
  matchId: string | null,
  matches: MatchRow[],
  players: PlayerRow[],
  assignments: AssignmentRow[],
) {
  const match = matches.find((item) => item.id === matchId);

  if (!match) {
    return null;
  }

  const selectedAssignments = assignments.filter(
    (assignment) => assignment.match_id === match.id,
  );

  return {
    matchDate: match.match_date,
    startTime: extractTime(match.starts_at),
    location: match.location,
    notes: match.notes ?? "",
    status: match.status,
    countsForRanking: match.counts_for_ranking,
    blueScore: match.blue_score === null ? "" : String(match.blue_score),
    redScore: match.red_score === null ? "" : String(match.red_score),
    assignmentMap: buildAssignmentMap(players, selectedAssignments),
  } satisfies MatchDraft;
}

export function MatchEditorForm({
  matches,
  players,
  assignments,
}: {
  matches: MatchRow[];
  players: PlayerRow[];
  assignments: AssignmentRow[];
}) {
  const { formAction } = useServerAction(updateMatchAction);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
    matches[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<MatchDraft | null>(() =>
    buildMatchDraft(matches[0]?.id ?? null, matches, players, assignments),
  );

  function updateAssignment(
    playerId: string,
    nextValue: Partial<AssignmentDraft>,
  ) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        assignmentMap: {
          ...current.assignmentMap,
          [playerId]: {
            ...current.assignmentMap[playerId],
            ...nextValue,
          },
        },
      };
    });
  }

  function renderPlayerGroup(
    title: string,
    description: string,
    groupPlayers: PlayerRow[],
  ) {
    if (groupPlayers.length === 0 || !draft) {
      return null;
    }

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="grid gap-3">
          {groupPlayers.map((player) => {
            const assignment = draft.assignmentMap[player.id];
            const isForcedGoalkeeper = player.player_type === "goalkeeper";

            return (
              <div
                key={player.id}
                className={cn(
                  "rounded-[26px] border p-4 transition",
                  assignment.included
                    ? "border-amber-400/30 bg-amber-400/10"
                    : "border-white/10 bg-white/5",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{player.nickname}</p>
                    <p className="mt-1 text-sm text-slate-400">{player.full_name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{formatPlayerTypeLabel(player.player_type)}</Badge>
                    <Badge
                      className={
                        player.active
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                          : "border-white/10 bg-slate-800/80 text-slate-300"
                      }
                    >
                      {formatPlayerStatusLabel(player.active)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[0.95fr_0.9fr_0.7fr_0.8fr_0.8fr]">
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                    <Checkbox
                      checked={assignment.included}
                      onChange={(event) =>
                        updateAssignment(player.id, {
                          included: event.target.checked,
                          isGoalkeeper:
                            event.target.checked && isForcedGoalkeeper
                              ? true
                              : assignment.isGoalkeeper,
                        })
                      }
                    />
                    Incluir na partida
                  </label>

                  <FormField label="Time">
                    <Select
                      value={assignment.teamColor}
                      disabled={!assignment.included}
                      onChange={(event) =>
                        updateAssignment(player.id, {
                          teamColor: event.target.value as "blue" | "red",
                        })
                      }
                    >
                      <option value="blue">{teamColors.blue.label}</option>
                      <option value="red">{teamColors.red.label}</option>
                    </Select>
                  </FormField>

                  <FormField label="Ordem">
                    <Input
                      type="number"
                      min="1"
                      value={assignment.lineupOrder}
                      disabled={!assignment.included}
                      onChange={(event) =>
                        updateAssignment(player.id, {
                          lineupOrder: event.target.value,
                        })
                      }
                    />
                  </FormField>

                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 xl:mt-[1.65rem]">
                    <Checkbox
                      checked={assignment.isGoalkeeper}
                      disabled={!assignment.included || isForcedGoalkeeper}
                      onChange={(event) =>
                        updateAssignment(player.id, {
                          isGoalkeeper: event.target.checked || isForcedGoalkeeper,
                        })
                      }
                    />
                    Goleiro
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200 xl:mt-[1.65rem]">
                    <Checkbox
                      checked={assignment.isReserve}
                      disabled={!assignment.included}
                      onChange={(event) =>
                        updateAssignment(player.id, {
                          isReserve: event.target.checked,
                        })
                      }
                    />
                    Reserva
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        title="Nenhuma partida para editar"
        description="Crie a primeira rodada para liberar a edicao completa."
      />
    );
  }

  if (!draft || !selectedMatchId) {
    return null;
  }

  const serializedAssignments = JSON.stringify(
    Object.entries(draft.assignmentMap)
      .filter(([, assignment]) => assignment.included)
      .map(([playerId, assignment]) => ({
        playerId,
        teamColor: assignment.teamColor,
        isGoalkeeper: assignment.isGoalkeeper,
        isReserve: assignment.isReserve,
        lineupOrder: assignment.lineupOrder
          ? Number(assignment.lineupOrder)
          : null,
      })),
  );

  const selectedCount = Object.values(draft.assignmentMap).filter(
    (assignment) => assignment.included,
  ).length;

  const activeFixedPlayers = players.filter(
    (player) => player.player_type === "fixed" && player.active,
  );
  const activeGoalkeepers = players.filter(
    (player) => player.player_type === "goalkeeper" && player.active,
  );
  const activeGuests = players.filter(
    (player) => player.player_type === "guest" && player.active,
  );
  const inactivePlayers = players.filter((player) => !player.active);

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="assignments" value={serializedAssignments} />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <FormField
          label="Partida"
          hint="A edicao troca data, participantes, times, placar e ranking em uma unica operacao."
        >
          <Select
            name="matchId"
            value={selectedMatchId}
            onChange={(event) => {
              const nextMatchId = event.target.value;

              setSelectedMatchId(nextMatchId);
              setDraft(buildMatchDraft(nextMatchId, matches, players, assignments));
            }}
          >
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.match_date} - {match.location}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid gap-3 rounded-[26px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Status</p>
            <p className="mt-2 font-semibold text-white">
              {formatMatchStatusLabel(draft.status)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Participantes
            </p>
            <p className="mt-2 font-semibold text-white">{selectedCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Ranking
            </p>
            <p className="mt-2 font-semibold text-white">
              {draft.countsForRanking ? "Conta na temporada" : "Ignorar ranking"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FormField label="Data da partida">
          <Input
            name="matchDate"
            type="date"
            value={draft.matchDate}
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, matchDate: event.target.value } : current,
              )
            }
          />
        </FormField>
        <FormField label="Horario">
          <Input
            name="startTime"
            type="time"
            value={draft.startTime}
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, startTime: event.target.value } : current,
              )
            }
          />
        </FormField>
        <FormField label="Local" className="xl:col-span-2">
          <Input
            name="location"
            value={draft.location}
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, location: event.target.value } : current,
              )
            }
          />
        </FormField>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_0.9fr_0.6fr_0.6fr]">
        <FormField label="Status da partida">
          <Select
            name="status"
            value={draft.status}
            onChange={(event) =>
              setDraft((current) => {
                if (!current) {
                  return current;
                }

                const nextStatus = event.target.value as MatchDraft["status"];

                return {
                  ...current,
                  status: nextStatus,
                  blueScore: nextStatus === "completed" ? current.blueScore : "",
                  redScore: nextStatus === "completed" ? current.redScore : "",
                };
              })
            }
          >
            <option value="scheduled">Agendada</option>
            <option value="completed">Concluida</option>
            <option value="cancelled">Cancelada</option>
          </Select>
        </FormField>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 xl:mt-[1.65rem]">
          <Checkbox
            name="countsForRanking"
            checked={draft.countsForRanking}
            onChange={(event) =>
              setDraft((current) =>
                current
                  ? { ...current, countsForRanking: event.target.checked }
                  : current,
              )
            }
          />
          Contar no ranking
        </label>
        <FormField label="Placar azul">
          <Input
            name="blueScore"
            type="number"
            min="0"
            value={draft.blueScore}
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, blueScore: event.target.value } : current,
              )
            }
          />
        </FormField>
        <FormField label="Placar vermelho">
          <Input
            name="redScore"
            type="number"
            min="0"
            value={draft.redScore}
            onChange={(event) =>
              setDraft((current) =>
                current ? { ...current, redScore: event.target.value } : current,
              )
            }
          />
        </FormField>
      </div>

      <FormField label="Observacoes">
        <Textarea
          name="notes"
          value={draft.notes}
          onChange={(event) =>
            setDraft((current) =>
              current ? { ...current, notes: event.target.value } : current,
            )
          }
        />
      </FormField>

      <div className="grid gap-6">
        {renderPlayerGroup(
          "Mensalistas ativos",
          "Base fixa que entra nas listas operacionais e no ranking principal.",
          activeFixedPlayers,
        )}
        {renderPlayerGroup(
          "Goleiros ativos",
          "Mantidos em grupo proprio para facilitar a montagem da rodada.",
          activeGoalkeepers,
        )}
        {renderPlayerGroup(
          "Diaristas ativos",
          "Ficam separados dos mensalistas para nao confundir a lista principal.",
          activeGuests,
        )}
        {renderPlayerGroup(
          "Arquivo inativo",
          "Jogadores que sairam do grupo continuam disponiveis aqui para preservar e corrigir historico.",
          inactivePlayers,
        )}
      </div>

      <div className="flex justify-end">
        <SubmitButton className="min-w-56">Salvar edicao completa</SubmitButton>
      </div>
    </form>
  );
}

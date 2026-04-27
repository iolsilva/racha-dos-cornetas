"use client";

import { useState } from "react";

import { TeamWhatsappPreview } from "@/components/admin/team-whatsapp-preview";
import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { teamColors } from "@/lib/constants";
import {
  formatMatchStatusLabel,
  formatPlayerRegistrationLabel,
  formatPlayerStatusLabel,
  formatPositionLabel,
} from "@/lib/labels";
import { cn } from "@/lib/utils";
import { saveTeamBuilderAction } from "@/server/actions/admin";

type MatchRow = {
  id: string;
  match_date: string;
  location: string;
  status: "scheduled" | "completed" | "cancelled";
};

type PlayerRow = {
  id: string;
  full_name: string;
  nickname: string;
  player_type: "fixed" | "guest" | "goalkeeper";
  position: "line" | "goalkeeper";
  active: boolean;
  fee_exempt: boolean;
};

type AttendanceRecordRow = {
  match_id: string;
  player_id: string;
  status: "confirmed" | "waitlist" | "declined";
};

type AssignmentRow = {
  id: string;
  match_id: string;
  player_id: string;
  nickname: string;
  team_color: "blue" | "red";
  is_goalkeeper: boolean;
  is_reserve: boolean;
  lineup_order: number | null;
};

type TeamColor = "blue" | "red";
type SlotKind = "line" | "goalkeeper" | "reserve";

type Slot = {
  key: string;
  teamColor: TeamColor;
  kind: SlotKind;
  index: number;
  label: string;
};

type TeamBuilderDraft = {
  presentPlayerIds: string[];
  slotAssignments: Record<string, string | null>;
  linesPerTeam: number;
  reservesPerTeam: number;
};

type PreviewEntry = {
  label: string;
  nickname: string;
  fullName: string;
  marker: "D" | "GD" | null;
};

const teamOrder: TeamColor[] = ["blue", "red"];
const defaultLinesPerTeam = 6;
const defaultReservesPerTeam = 2;

function buildSlotKey(teamColor: TeamColor, kind: SlotKind, index: number) {
  return `${teamColor}:${kind}:${index}`;
}

function buildSlots(linesPerTeam: number, reservesPerTeam: number) {
  return teamOrder.flatMap((teamColor) => [
    ...Array.from({ length: linesPerTeam }, (_, index) => ({
      key: buildSlotKey(teamColor, "line", index + 1),
      teamColor,
      kind: "line" as const,
      index: index + 1,
      label: `Linha ${index + 1}`,
    })),
    {
      key: buildSlotKey(teamColor, "goalkeeper", 1),
      teamColor,
      kind: "goalkeeper" as const,
      index: 1,
      label: "Goleiro",
    },
    ...Array.from({ length: reservesPerTeam }, (_, index) => ({
      key: buildSlotKey(teamColor, "reserve", index + 1),
      teamColor,
      kind: "reserve" as const,
      index: index + 1,
      label: `Reserva ${index + 1}`,
    })),
  ]);
}

function compareAssignments(left: AssignmentRow, right: AssignmentRow) {
  const leftOrder = left.lineup_order ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.lineup_order ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.nickname.localeCompare(right.nickname, "pt-BR", {
    sensitivity: "base",
  });
}

function buildMatchDraft(
  matchId: string | null,
  attendanceRecords: AttendanceRecordRow[],
  assignments: AssignmentRow[],
) {
  if (!matchId) {
    return null;
  }

  const matchAssignments = assignments
    .filter((assignment) => assignment.match_id === matchId)
    .sort(compareAssignments);
  const confirmedAttendance = attendanceRecords
    .filter(
      (record) => record.match_id === matchId && record.status === "confirmed",
    )
    .map((record) => record.player_id);
  const presentPlayerIds = Array.from(
    new Set([
      ...confirmedAttendance,
      ...matchAssignments.map((assignment) => assignment.player_id),
    ]),
  );

  const linesPerTeam = teamOrder.reduce((maxValue, teamColor) => {
    const total = matchAssignments.filter(
      (assignment) =>
        assignment.team_color === teamColor &&
        !assignment.is_goalkeeper &&
        !assignment.is_reserve,
    ).length;

    return Math.max(maxValue, total);
  }, defaultLinesPerTeam);

  const reservesPerTeam = teamOrder.reduce((maxValue, teamColor) => {
    const total = matchAssignments.filter(
      (assignment) =>
        assignment.team_color === teamColor &&
        assignment.is_reserve &&
        !assignment.is_goalkeeper,
    ).length;

    return Math.max(maxValue, total);
  }, defaultReservesPerTeam);

  const slots = buildSlots(linesPerTeam, reservesPerTeam);
  const slotAssignments = Object.fromEntries(
    slots.map((slot) => [slot.key, null]),
  ) as Record<string, string | null>;

  teamOrder.forEach((teamColor) => {
    const teamAssignments = matchAssignments.filter(
      (assignment) => assignment.team_color === teamColor,
    );
    const lineAssignments = teamAssignments.filter(
      (assignment) => !assignment.is_goalkeeper && !assignment.is_reserve,
    );
    const goalkeeperAssignments = teamAssignments.filter(
      (assignment) => assignment.is_goalkeeper,
    );
    const reserveAssignments = teamAssignments.filter(
      (assignment) => assignment.is_reserve && !assignment.is_goalkeeper,
    );

    lineAssignments.forEach((assignment, index) => {
      const slotKey = buildSlotKey(teamColor, "line", index + 1);
      if (slotKey in slotAssignments) {
        slotAssignments[slotKey] = assignment.player_id;
      }
    });

    if (goalkeeperAssignments[0]) {
      const slotKey = buildSlotKey(teamColor, "goalkeeper", 1);
      slotAssignments[slotKey] = goalkeeperAssignments[0].player_id;
    }

    reserveAssignments.forEach((assignment, index) => {
      const slotKey = buildSlotKey(teamColor, "reserve", index + 1);
      if (slotKey in slotAssignments) {
        slotAssignments[slotKey] = assignment.player_id;
      }
    });
  });

  return {
    presentPlayerIds,
    slotAssignments,
    linesPerTeam,
    reservesPerTeam,
  } satisfies TeamBuilderDraft;
}

function getAssignedPlayerIds(slotAssignments: Record<string, string | null>) {
  return Object.values(slotAssignments).filter(
    (playerId): playerId is string => Boolean(playerId),
  );
}

function getPlayerMarker(player: PlayerRow | undefined) {
  if (!player || player.player_type !== "guest") {
    return null;
  }

  return player.position === "goalkeeper" ? "GD" : "D";
}

function buildPreviewEntries(
  matchId: string | null,
  assignments: AssignmentRow[],
  playerMap: Record<string, PlayerRow>,
  teamColor: TeamColor,
) {
  if (!matchId) {
    return [];
  }

  const teamAssignments = assignments
    .filter(
      (assignment) =>
        assignment.match_id === matchId && assignment.team_color === teamColor,
    )
    .sort(compareAssignments);

  const lineEntries = teamAssignments
    .filter((assignment) => !assignment.is_goalkeeper && !assignment.is_reserve)
    .map((assignment, index) => {
      const player = playerMap[assignment.player_id];

      return {
        label: `Linha ${index + 1}`,
        nickname: player?.nickname ?? assignment.nickname,
        fullName: player?.full_name ?? assignment.nickname,
        marker: getPlayerMarker(player),
      } satisfies PreviewEntry;
    });

  const goalkeeperEntry = teamAssignments
    .filter((assignment) => assignment.is_goalkeeper)
    .slice(0, 1)
    .map((assignment) => {
      const player = playerMap[assignment.player_id];

      return {
        label: "Goleiro",
        nickname: player?.nickname ?? assignment.nickname,
        fullName: player?.full_name ?? assignment.nickname,
        marker: getPlayerMarker(player),
      } satisfies PreviewEntry;
    });

  const reserveEntries = teamAssignments
    .filter((assignment) => assignment.is_reserve && !assignment.is_goalkeeper)
    .map((assignment, index) => {
      const player = playerMap[assignment.player_id];

      return {
        label: `Reserva ${index + 1}`,
        nickname: player?.nickname ?? assignment.nickname,
        fullName: player?.full_name ?? assignment.nickname,
        marker: getPlayerMarker(player),
      } satisfies PreviewEntry;
    });

  return [...lineEntries, ...goalkeeperEntry, ...reserveEntries];
}

function getSlotPlayerCount(
  draft: TeamBuilderDraft,
  teamColor: TeamColor,
  kind: SlotKind,
) {
  return Object.entries(draft.slotAssignments).filter(([slotKey, playerId]) => {
    if (!playerId) {
      return false;
    }

    return slotKey.startsWith(`${teamColor}:${kind}:`);
  }).length;
}

function isGoalkeeper(player: PlayerRow) {
  return player.player_type === "goalkeeper" || player.position === "goalkeeper";
}

function canPlayerFillSlot(player: PlayerRow | undefined, slot: Slot) {
  if (!player) {
    return false;
  }

  if (slot.kind === "goalkeeper") {
    return isGoalkeeper(player);
  }

  return !isGoalkeeper(player);
}

function normalizeSlotAssignments(
  currentAssignments: Record<string, string | null>,
  linesPerTeam: number,
  reservesPerTeam: number,
) {
  const nextSlots = buildSlots(linesPerTeam, reservesPerTeam);
  const nextAssignments = Object.fromEntries(
    nextSlots.map((slot) => [slot.key, null]),
  ) as Record<string, string | null>;

  nextSlots.forEach((slot) => {
    if (slot.key in currentAssignments) {
      nextAssignments[slot.key] = currentAssignments[slot.key];
    }
  });

  return nextAssignments;
}

function getLineCountLowerBound(draft: TeamBuilderDraft, teamColor: TeamColor) {
  return getSlotPlayerCount(draft, teamColor, "line");
}

function getReserveCountLowerBound(draft: TeamBuilderDraft, teamColor: TeamColor) {
  return getSlotPlayerCount(draft, teamColor, "reserve");
}

function buildAssignmentsPayload(draft: TeamBuilderDraft) {
  return buildSlots(draft.linesPerTeam, draft.reservesPerTeam)
    .map((slot) => {
      const playerId = draft.slotAssignments[slot.key];

      if (!playerId) {
        return null;
      }

      return {
        playerId,
        teamColor: slot.teamColor,
        isGoalkeeper: slot.kind === "goalkeeper",
        isReserve: slot.kind === "reserve",
        lineupOrder:
          slot.kind === "line"
            ? slot.index
            : slot.kind === "goalkeeper"
              ? draft.linesPerTeam + 1
              : draft.linesPerTeam + 1 + slot.index,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

function getSlotCode(slot: Slot) {
  if (slot.kind === "goalkeeper") {
    return "GOL";
  }

  if (slot.kind === "reserve") {
    return `R${slot.index}`;
  }

  return String(slot.index);
}

export function TeamBuilder({
  matches,
  players,
  attendanceRecords,
  assignments,
}: {
  matches: MatchRow[];
  players: PlayerRow[];
  attendanceRecords: AttendanceRecordRow[];
  assignments: AssignmentRow[];
}) {
  const { formAction } = useServerAction(saveTeamBuilderAction);
  const defaultMatchId =
    matches.find((match) => match.status === "scheduled")?.id ?? matches[0]?.id ?? null;
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(defaultMatchId);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [showWhatsappPreview, setShowWhatsappPreview] = useState(false);
  const [draft, setDraft] = useState<TeamBuilderDraft | null>(() =>
    buildMatchDraft(defaultMatchId, attendanceRecords, assignments),
  );

  if (matches.length === 0) {
    return (
      <EmptyState
        title="Nenhuma partida disponivel"
        description="Crie a rodada primeiro para liberar a presenca e a montagem visual dos times."
      />
    );
  }

  if (!draft || !selectedMatchId) {
    return null;
  }

  const activeDraft = draft;

  const selectedMatch =
    matches.find((match) => match.id === selectedMatchId) ?? matches[0] ?? null;
  const selectedMatchPlayerIds = new Set([
    ...activeDraft.presentPlayerIds,
    ...getAssignedPlayerIds(activeDraft.slotAssignments),
  ]);
  const relevantPlayers = players.filter(
    (player) => player.active || selectedMatchPlayerIds.has(player.id),
  );
  const playerMap = Object.fromEntries(
    relevantPlayers.map((player) => [player.id, player]),
  ) as Record<string, PlayerRow>;
  const groupedPlayers = {
    fixed: relevantPlayers.filter(
      (player) => player.player_type === "fixed" && player.active,
    ),
    goalkeepers: relevantPlayers.filter(
      (player) =>
        player.player_type === "goalkeeper" &&
        player.position === "goalkeeper" &&
        player.active,
    ),
    guests: relevantPlayers.filter(
      (player) =>
        player.player_type === "guest" &&
        player.position === "line" &&
        player.active,
    ),
    guestGoalkeepers: relevantPlayers.filter(
      (player) =>
        player.player_type === "guest" &&
        player.position === "goalkeeper" &&
        player.active,
    ),
    inactiveLinked: relevantPlayers.filter(
      (player) => !player.active && selectedMatchPlayerIds.has(player.id),
    ),
  };
  const slots = buildSlots(activeDraft.linesPerTeam, activeDraft.reservesPerTeam);
  const selectedSlot = slots.find((slot) => slot.key === selectedSlotKey) ?? null;
  const assignedPlayerIds = new Set(getAssignedPlayerIds(activeDraft.slotAssignments));
  const availablePlayers = relevantPlayers
    .filter(
      (player) =>
        activeDraft.presentPlayerIds.includes(player.id) &&
        !assignedPlayerIds.has(player.id),
    )
    .filter((player) => !selectedSlot || canPlayerFillSlot(player, selectedSlot))
    .filter((player) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return true;
      }

      return (
        player.nickname.toLowerCase().includes(term) ||
        player.full_name.toLowerCase().includes(term)
      );
    })
    .sort((left, right) =>
      left.nickname.localeCompare(right.nickname, "pt-BR", {
        sensitivity: "base",
      }),
    );

  const missingSlots =
    slots.filter((slot) => !activeDraft.slotAssignments[slot.key]).length;
  const availableCount = availablePlayers.length;
  const serializedPresence = JSON.stringify(activeDraft.presentPlayerIds);
  const serializedAssignments = JSON.stringify(buildAssignmentsPayload(activeDraft));
  const savedAssignmentsForMatch = assignments
    .filter((assignment) => assignment.match_id === selectedMatchId)
    .sort(compareAssignments);
  const hasSavedLineup = savedAssignmentsForMatch.length > 0;
  const bluePreviewEntries = buildPreviewEntries(
    selectedMatchId,
    savedAssignmentsForMatch,
    playerMap,
    "blue",
  );
  const redPreviewEntries = buildPreviewEntries(
    selectedMatchId,
    savedAssignmentsForMatch,
    playerMap,
    "red",
  );

  function clearPlayerFromSlots(playerId: string, currentDraft: TeamBuilderDraft) {
    const nextAssignments = { ...currentDraft.slotAssignments };

    Object.entries(nextAssignments).forEach(([slotKey, assignedPlayerId]) => {
      if (assignedPlayerId === playerId) {
        nextAssignments[slotKey] = null;
      }
    });

    return nextAssignments;
  }

  function togglePresence(playerId: string) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const isPresent = current.presentPlayerIds.includes(playerId);
      const nextPresentPlayerIds = isPresent
        ? current.presentPlayerIds.filter((id) => id !== playerId)
        : [...current.presentPlayerIds, playerId];
      const nextAssignments = isPresent
        ? clearPlayerFromSlots(playerId, current)
        : current.slotAssignments;

      return {
        ...current,
        presentPlayerIds: nextPresentPlayerIds,
        slotAssignments: nextAssignments,
      };
    });

    if (selectedSlotKey && activeDraft.slotAssignments[selectedSlotKey] === playerId) {
      setSelectedSlotKey(null);
    }
  }

  function assignPlayerToSlot(playerId: string, slot: Slot) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const player = playerMap[playerId];

      if (!canPlayerFillSlot(player, slot)) {
        return current;
      }

      const nextAssignments = clearPlayerFromSlots(playerId, current);
      nextAssignments[slot.key] = playerId;

      return {
        ...current,
        slotAssignments: nextAssignments,
      };
    });
    setSelectedSlotKey(slot.key);
  }

  function removePlayerFromSlot(slotKey: string) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        slotAssignments: {
          ...current.slotAssignments,
          [slotKey]: null,
        },
      };
    });
    setSelectedSlotKey((current) => (current === slotKey ? null : current));
  }

  function moveOrSwapSlot(sourceKey: string, targetKey: string) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const sourceSlot = slots.find((slot) => slot.key === sourceKey);
      const targetSlot = slots.find((slot) => slot.key === targetKey);

      if (!sourceSlot || !targetSlot) {
        return current;
      }

      const sourcePlayerId = current.slotAssignments[sourceKey];
      const targetPlayerId = current.slotAssignments[targetKey];

      if (!sourcePlayerId) {
        return current;
      }

      const sourcePlayer = playerMap[sourcePlayerId];
      const targetPlayer = targetPlayerId ? playerMap[targetPlayerId] : undefined;

      if (!canPlayerFillSlot(sourcePlayer, targetSlot)) {
        return current;
      }

      if (targetPlayerId && !canPlayerFillSlot(targetPlayer, sourceSlot)) {
        return current;
      }

      return {
        ...current,
        slotAssignments: {
          ...current.slotAssignments,
          [sourceKey]: targetPlayerId ?? null,
          [targetKey]: sourcePlayerId,
        },
      };
    });
    setSelectedSlotKey(null);
  }

  function handleSlotClick(slot: Slot) {
    if (!selectedSlotKey) {
      setSelectedSlotKey(slot.key);
      return;
    }

    if (selectedSlotKey === slot.key) {
      setSelectedSlotKey(null);
      return;
    }

    const selectedPlayerId = activeDraft.slotAssignments[selectedSlotKey];

    if (!selectedPlayerId) {
      setSelectedSlotKey(slot.key);
      return;
    }

    moveOrSwapSlot(selectedSlotKey, slot.key);
  }

  function updateLinesPerTeam(nextValue: number) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const lowerBound = Math.max(
        getLineCountLowerBound(current, "blue"),
        getLineCountLowerBound(current, "red"),
      );
      const normalizedValue = Math.max(nextValue, lowerBound, 1);

      return {
        ...current,
        linesPerTeam: normalizedValue,
        slotAssignments: normalizeSlotAssignments(
          current.slotAssignments,
          normalizedValue,
          current.reservesPerTeam,
        ),
      };
    });
    setSelectedSlotKey(null);
  }

  function updateReservesPerTeam(nextValue: number) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const lowerBound = Math.max(
        getReserveCountLowerBound(current, "blue"),
        getReserveCountLowerBound(current, "red"),
      );
      const normalizedValue = Math.max(nextValue, lowerBound, 0);

      return {
        ...current,
        reservesPerTeam: normalizedValue,
        slotAssignments: normalizeSlotAssignments(
          current.slotAssignments,
          current.linesPerTeam,
          normalizedValue,
        ),
      };
    });
    setSelectedSlotKey(null);
  }

  async function copyWhatsappText() {
    if (!selectedMatch) {
      return;
    }

    const lines = [
      "Racha dos Cornetas",
      `Times da rodada - ${selectedMatch.match_date} - ${selectedMatch.location}`,
      "",
      "TIME AZUL | TIME VERMELHO",
      ...Array.from(
        { length: Math.max(bluePreviewEntries.length, redPreviewEntries.length) },
        (_, index) =>
          `${bluePreviewEntries[index] ? `${bluePreviewEntries[index].label} - ${bluePreviewEntries[index].nickname}${bluePreviewEntries[index].marker ? ` (${bluePreviewEntries[index].marker})` : ""}` : "-"}` +
          ` | ` +
          `${redPreviewEntries[index] ? `${redPreviewEntries[index].label} - ${redPreviewEntries[index].nickname}${redPreviewEntries[index].marker ? ` (${redPreviewEntries[index].marker})` : ""}` : "-"}`,
      ),
    ].join("\n");

    await navigator.clipboard.writeText(lines);
  }

  function renderPresenceGroup(
    title: string,
    description: string,
    groupPlayers: PlayerRow[],
  ) {
    if (groupPlayers.length === 0) {
      return null;
    }

    const orderedPlayers = [...groupPlayers].sort((left, right) =>
      left.nickname.localeCompare(right.nickname, "pt-BR", {
        sensitivity: "base",
      }),
    );

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {orderedPlayers.map((player) => {
            const isPresent = activeDraft.presentPlayerIds.includes(player.id);
            const isAssigned = assignedPlayerIds.has(player.id);

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePresence(player.id)}
                className={cn(
                  "rounded-[24px] border p-4 text-left transition",
                  isPresent
                    ? "border-emerald-400/30 bg-emerald-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{player.nickname}</p>
                    <p className="mt-1 text-sm text-slate-400">{player.full_name}</p>
                  </div>
                  <Badge
                    className={
                      isPresent
                        ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                        : "border-white/10 bg-slate-900/80 text-slate-300"
                    }
                  >
                    {isPresent ? "Presente" : "Fora"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>
                    {formatPlayerRegistrationLabel(
                      player.player_type,
                      player.position,
                    )}
                  </Badge>
                  <Badge>{formatPositionLabel(player.position)}</Badge>
                  {!player.active ? (
                    <Badge className="border-white/10 bg-slate-900/80 text-slate-300">
                      {formatPlayerStatusLabel(player.active)}
                    </Badge>
                  ) : null}
                  {isAssigned ? (
                    <Badge className="border-amber-400/30 bg-amber-400/15 text-amber-100">
                      Alocado
                    </Badge>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSlot(slot: Slot) {
    const assignedPlayerId = activeDraft.slotAssignments[slot.key];
    const player = assignedPlayerId ? playerMap[assignedPlayerId] : undefined;
    const isSelected = selectedSlotKey === slot.key;
    const isGoalieSlot = slot.kind === "goalkeeper";
    const slotCode = getSlotCode(slot);

    return (
      <div
        key={slot.key}
        className={cn(
          "rounded-[20px] border px-3 py-2.5 transition",
          isGoalieSlot
            ? "border-cyan-400/30 bg-cyan-500/10"
            : "border-white/10 bg-white/5 hover:bg-white/10",
          isSelected ? "ring-2 ring-amber-400/60" : "",
        )}
      >
        <button
          type="button"
          onClick={() => handleSlotClick(slot)}
          className="w-full text-left"
        >
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "min-w-11 justify-center px-2 py-1 text-[10px]",
                isGoalieSlot
                  ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-100"
                  : slot.kind === "reserve"
                    ? "border-white/10 bg-white/10 text-slate-100"
                    : "border-white/10 bg-slate-950/70 text-slate-200",
              )}
            >
              {slotCode}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-white">
                  {player ? player.nickname : slot.label}
                </p>
                {!player ? (
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Vago
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {player
                  ? player.full_name
                  : "Clique para preencher com um nome disponivel."}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {isSelected ? "Ativa" : "Editar"}
            </span>
          </div>
        </button>

        {player ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
            <div className="flex flex-wrap gap-1.5">
              <Badge className="px-2 py-0.5 text-[10px]">
                {formatPlayerRegistrationLabel(
                  player.player_type,
                  player.position,
                )}
              </Badge>
              {!player.active ? (
                <Badge className="border-white/10 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300">
                  {formatPlayerStatusLabel(player.active)}
                </Badge>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => removePlayerFromSlot(slot.key)}
            >
              Remover
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <TeamWhatsappPreview
        open={showWhatsappPreview}
        onClose={() => setShowWhatsappPreview(false)}
        onCopyText={() => {
          void copyWhatsappText();
        }}
        onPrint={() => window.print()}
        match={
          selectedMatch
            ? {
                match_date: selectedMatch.match_date,
                location: selectedMatch.location,
              }
            : null
        }
        blueEntries={bluePreviewEntries}
        redEntries={redPreviewEntries}
      />

      <form action={formAction} className="grid gap-6">
        <input type="hidden" name="matchId" value={selectedMatchId} />
        <input type="hidden" name="presentPlayerIds" value={serializedPresence} />
        <input type="hidden" name="assignments" value={serializedAssignments} />

        <Card className="mesh-panel">
        <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
          <FormField
            label="Partida"
            hint="Escolha a rodada e monte tudo no mesmo painel: presenca, times, goleiros e reservas."
          >
            <Select
              value={selectedMatchId}
              onChange={(event) => {
                const nextMatchId = event.target.value;
                setSelectedMatchId(nextMatchId);
                setSearchTerm("");
                setSelectedSlotKey(null);
                setShowWhatsappPreview(false);
                setDraft(buildMatchDraft(nextMatchId, attendanceRecords, assignments));
              }}
            >
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.match_date} - {match.location}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid gap-3 rounded-[26px] border border-white/10 bg-white/5 p-4 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Status</p>
              <p className="mt-2 font-semibold text-white">
                {selectedMatch ? formatMatchStatusLabel(selectedMatch.status) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Presentes</p>
              <p className="mt-2 font-semibold text-white">
                {activeDraft.presentPlayerIds.length}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Alocados</p>
              <p className="mt-2 font-semibold text-white">{assignedPlayerIds.size}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Livres</p>
              <p className="mt-2 font-semibold text-white">
                {activeDraft.presentPlayerIds.length - assignedPlayerIds.size}
              </p>
            </div>
          </div>
        </div>
        </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Etapa 1
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Lista de presenca da rodada
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Marque quem vai para o racha. Essa lista alimenta a montagem visual e
              mantem os confirmados salvos no banco mesmo que ainda nao estejam em um time.
            </p>
          </div>
          <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-100">
            {activeDraft.presentPlayerIds.length} confirmados
          </Badge>
        </div>

        <div className="mt-6 grid gap-6">
          {renderPresenceGroup(
            "Mensalistas",
            "Base fixa da rodada. Aqui voce bate o olho e marca quem realmente vem.",
            groupedPlayers.fixed,
          )}
          {renderPresenceGroup(
            "Goleiros fixos",
            "Ficam separados para facilitar o encaixe final de cada lado e preservar o grupo ranqueavel.",
            groupedPlayers.goalkeepers,
          )}
          {renderPresenceGroup(
            "Diaristas de linha",
            "Entram na lista do dia sem misturar com os mensalistas fixos.",
            groupedPlayers.guests,
          )}
          {renderPresenceGroup(
            "Goleiros diaristas",
            "Aparecem apenas como opcao operacional para a vaga de goleiro.",
            groupedPlayers.guestGoalkeepers,
          )}
          {groupedPlayers.inactiveLinked.length > 0
            ? renderPresenceGroup(
                "Vinculos inativos",
                "Jogadores inativos que ja estavam salvos nesta partida continuam visiveis para revisao.",
                groupedPlayers.inactiveLinked,
              )
            : null}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Etapa 2
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Estrutura da montagem
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Ajuste a quantidade de vagas visuais para refletir o formato da rodada.
              Cada time sempre reserva uma vaga de goleiro destacada.
            </p>
          </div>
          <Badge>{missingSlots} vagas abertas</Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <FormField label="Jogadores de linha por time">
            <Input
              type="number"
              min="1"
              value={activeDraft.linesPerTeam}
              onChange={(event) => updateLinesPerTeam(Number(event.target.value || 0))}
            />
          </FormField>
          <FormField label="Goleiros por time">
            <Input type="number" value="1" disabled />
          </FormField>
          <FormField label="Reservas por time">
            <Input
              type="number"
              min="0"
              value={activeDraft.reservesPerTeam}
              onChange={(event) =>
                updateReservesPerTeam(Number(event.target.value || 0))
              }
            />
          </FormField>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Painel de apoio
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Busca, selecao rapida e jogadores disponiveis
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Esta faixa superior concentra o que o administrador precisa para
              preencher as vagas com rapidez: busca, vaga selecionada, contadores e
              a lista de nomes ainda livres naquela rodada.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{availableCount} livres</Badge>
            <Badge>{missingSlots} vagas em aberto</Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="grid gap-4">
            <FormField
              label="Busca por nome"
              hint={
                selectedSlot
                  ? `Vaga selecionada: ${teamColors[selectedSlot.teamColor].label} / ${selectedSlot.label}`
                  : "Selecione uma vaga nos times abaixo para habilitar a alocacao rapida."
              }
            >
              <Input
                placeholder="Buscar por apelido ou nome"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </FormField>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Foco atual
                </p>
                <p className="mt-1.5 text-sm text-slate-300">
                  {selectedSlot
                    ? `${teamColors[selectedSlot.teamColor].label} / ${selectedSlot.label}`
                    : "Nenhuma vaga selecionada"}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Instrucao
                </p>
                <p className="mt-1.5 text-sm text-slate-300">
                  Clique em uma vaga do Azul ou Vermelho e depois em um nome da lista.
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Troca rapida
                </p>
                <p className="mt-1.5 text-sm text-slate-300">
                  Clique entre duas vagas ocupadas para mover ou trocar jogadores sem
                  remontar tudo.
                </p>
              </div>
            </div>

            {selectedSlot ? (
              <div className="rounded-[20px] border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
                Clique em um nome da lista ao lado para preencher{" "}
                <strong>
                  {teamColors[selectedSlot.teamColor].label} / {selectedSlot.label}
                </strong>
                . Se clicar em outra vaga ocupada, o sistema move ou troca os nomes sem
                duplicidade.
              </div>
            ) : (
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
                Escolha uma vaga nos times abaixo para ativar a selecao rapida. Assim a
                alocacao fica visual e previsivel.
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Jogadores disponiveis
                </p>
                <h4 className="mt-2 text-lg font-semibold text-white">
                  Lista filtrada pela presenca
                </h4>
              </div>
              <Badge>{availableCount} nomes livres</Badge>
            </div>

            <div className="max-h-[24rem] overflow-y-auto pr-1">
              <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
                {availablePlayers.length > 0 ? (
                  availablePlayers.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      disabled={!selectedSlot}
                      onClick={() => selectedSlot && assignPlayerToSlot(player.id, selectedSlot)}
                      className={cn(
                        "rounded-[18px] border px-3 py-2.5 text-left transition",
                        selectedSlot
                          ? "border-white/10 bg-white/5 hover:border-amber-400/30 hover:bg-white/10"
                          : "border-white/10 bg-slate-950/60 opacity-70",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {player.nickname}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {player.full_name}
                          </p>
                        </div>
                        <Badge className="px-2 py-0.5 text-[10px]">
                          {formatPlayerRegistrationLabel(
                            player.player_type,
                            player.position,
                          )}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge className="px-2 py-0.5 text-[10px]">
                          {formatPositionLabel(player.position)}
                        </Badge>
                        {!player.active ? (
                          <Badge className="border-white/10 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300">
                            {formatPlayerStatusLabel(player.active)}
                          </Badge>
                        ) : null}
                      </div>
                    </button>
                  ))
                ) : (
                  <EmptyState
                    title="Nenhum nome livre nesta combinacao"
                    description="Ajuste a busca, marque mais presentes ou troque a vaga selecionada para liberar outras opcoes."
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {teamOrder.map((teamColor) => {
          const teamSlots = slots.filter((slot) => slot.teamColor === teamColor);
          const lineSlots = teamSlots.filter((slot) => slot.kind === "line");
          const goalkeeperSlot = teamSlots.find((slot) => slot.kind === "goalkeeper");
          const reserveSlots = teamSlots.filter((slot) => slot.kind === "reserve");
          const allocatedCount = teamSlots.filter(
            (slot) => activeDraft.slotAssignments[slot.key],
          ).length;

          return (
            <Card key={teamColor} className="min-w-0 overflow-hidden">
              <div
                className={cn(
                  "-mx-5 -mt-5 border-b px-5 py-4",
                  teamColor === "blue"
                    ? "border-cyan-400/20 bg-cyan-500/10"
                    : "border-rose-400/20 bg-rose-500/10",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      Time {teamColors[teamColor].label}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {allocatedCount} de {teamSlots.length} vagas preenchidas
                    </h3>
                  </div>
                  <Badge
                    className={
                      teamColor === "blue"
                        ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-100"
                        : "border-rose-400/30 bg-rose-500/15 text-rose-100"
                    }
                  >
                    {teamColors[teamColor].label}
                  </Badge>
                </div>
              </div>

              <div className="mt-5 grid gap-3.5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Linha</p>
                    <Badge>{lineSlots.length} vagas</Badge>
                  </div>
                  <div className="grid gap-2">
                    {lineSlots.map((slot) => renderSlot(slot))}
                  </div>
                </div>

                {goalkeeperSlot ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Goleiro</p>
                      <Badge className="border-cyan-400/30 bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-100">
                        Vaga destacada
                      </Badge>
                    </div>
                    {renderSlot(goalkeeperSlot)}
                  </div>
                ) : null}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Reservas</p>
                    <Badge>{reserveSlots.length} vagas</Badge>
                  </div>
                  {reserveSlots.length > 0 ? (
                    <div className="grid gap-2">
                      {reserveSlots.map((slot) => renderSlot(slot))}
                    </div>
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-500">
                      Sem vagas de reserva configuradas para este lado.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            Presenca:{" "}
            <strong className="text-white">{activeDraft.presentPlayerIds.length}</strong> |
            Alocados: <strong className="text-white"> {assignedPlayerIds.size}</strong> |
            Livres:{" "}
            <strong className="text-white">
              {activeDraft.presentPlayerIds.length - assignedPlayerIds.size}
            </strong>
          </div>
          <div className="flex flex-wrap gap-3">
            {hasSavedLineup ? (
              <Button
                type="button"
                variant="secondary"
                className="min-w-56"
                onClick={() => setShowWhatsappPreview(true)}
              >
                Visualizar para WhatsApp
              </Button>
            ) : null}
            <SubmitButton className="min-w-64">Salvar presenca e montagem</SubmitButton>
          </div>
        </div>
      </form>
    </>
  );
}

"use server";

import type { ActionState } from "@/lib/action-state";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReferenceMonth } from "@/lib/utils";
import {
  attendanceSchema,
  expenseSchema,
  matchSchema,
  playerStatusSchema,
  paymentSchema,
  playerSchema,
  resultSchema,
  teamBuilderSchema,
  updateMatchSchema,
} from "@/lib/validation";

import {
  actionError,
  actionSuccess,
  getActionContext,
  refreshPaths,
} from "./helpers";

function parseJsonArrayField(formData: FormData, fieldName: string, errorMessage: string) {
  const rawValue = formData.get(fieldName);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(String(rawValue));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error(errorMessage);
  }
}

function parseAssignmentsFromFormData(formData: FormData) {
  return parseJsonArrayField(
    formData,
    "assignments",
    "Nao foi possivel ler a escalacao enviada. Atualize a pagina e tente novamente.",
  );
}

export async function createPlayerAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    const supabase = await getActionContext({ adminOnly: true });
    const parsed = playerSchema.parse({
      fullName: formData.get("fullName"),
      nickname: formData.get("nickname"),
      playerType: formData.get("playerType"),
      position: formData.get("position"),
      phone: formData.get("phone"),
      active: formData.get("active") === "on",
      feeExempt: formData.get("feeExempt") === "on",
    });

    const normalizedPosition =
      parsed.playerType === "goalkeeper" ? "goalkeeper" : "line";
    const normalizedFeeExempt =
      parsed.playerType === "goalkeeper" ? true : parsed.feeExempt;

    const { error } = await supabase.from("players").insert({
      full_name: parsed.fullName,
      nickname: parsed.nickname,
      player_type: parsed.playerType,
      position: normalizedPosition,
      phone: parsed.phone || null,
      active: parsed.active,
      fee_exempt: normalizedFeeExempt,
    });

    if (error) {
      throw new Error(error.message);
    }

    refreshPaths([
      "/admin",
      "/admin/jogadores",
      "/admin/financeiro",
      "/admin/partidas",
      "/dashboard",
    ]);
    return actionSuccess("Jogador cadastrado.");
  } catch (error) {
    return actionError(error);
  }
}

export async function createPaymentAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    const supabase = await getActionContext({ adminOnly: true });
    const parsed = paymentSchema.parse({
      playerId: formData.get("playerId"),
      referenceMonth: formData.get("referenceMonth") || getReferenceMonth(),
      amount: formData.get("amount"),
      paymentType: formData.get("paymentType"),
      paidAt: formData.get("paidAt"),
      notes: formData.get("notes"),
    });

    const { error } = await supabase.from("payments").insert({
      player_id: parsed.playerId,
      reference_month: parsed.referenceMonth,
      amount: parsed.amount,
      payment_type: parsed.paymentType,
      paid_at: parsed.paidAt,
      notes: parsed.notes || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    refreshPaths(["/admin", "/admin/financeiro", "/financeiro", "/dashboard"]);
    return actionSuccess("Pagamento registrado.");
  } catch (error) {
    return actionError(error);
  }
}

export async function togglePlayerActiveAction(
  _prevState: ActionState,
  formData: FormData,
) {
  return togglePlayerActiveInternal(formData);
}

export async function togglePlayerActiveDirectAction(formData: FormData) {
  return togglePlayerActiveInternal(formData);
}

async function togglePlayerActiveInternal(formData: FormData) {
  try {
    await getActionContext({ adminOnly: true });
    const adminClient = createAdminClient();
    const parsed = playerStatusSchema.parse({
      playerId: formData.get("playerId"),
      active: formData.get("active"),
    });

    const { data, error } = await adminClient
      .from("players")
      .update({ active: parsed.active })
      .eq("id", parsed.playerId)
      .select("id, active")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Nao foi possivel localizar o jogador para atualizar o status.");
    }

    refreshPaths([
      "/admin",
      "/admin/jogadores",
      "/admin/financeiro",
      "/admin/partidas",
      "/dashboard",
      "/ranking",
      "/jogos",
    ]);
    return actionSuccess(
      data.active ? "Jogador reativado." : "Jogador marcado como inativo.",
    );
  } catch (error) {
    return actionError(error);
  }
}

export async function createExpenseAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    const supabase = await getActionContext({ adminOnly: true });
    const parsed = expenseSchema.parse({
      referenceMonth: formData.get("referenceMonth") || getReferenceMonth(),
      amount: formData.get("amount"),
      category: formData.get("category"),
      expenseDate: formData.get("expenseDate"),
      description: formData.get("description"),
      reserveForAwards: formData.get("reserveForAwards") === "on",
    });

    const { error } = await supabase.from("expenses").insert({
      reference_month: parsed.referenceMonth,
      amount: parsed.amount,
      category: parsed.category,
      expense_date: parsed.expenseDate,
      description: parsed.description,
      reserve_for_awards: parsed.reserveForAwards,
    });

    if (error) {
      throw new Error(error.message);
    }

    refreshPaths(["/admin", "/admin/financeiro", "/financeiro", "/dashboard"]);
    return actionSuccess("Despesa registrada.");
  } catch (error) {
    return actionError(error);
  }
}

export async function createMatchAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    const supabase = await getActionContext({ adminOnly: true });
    const parsed = matchSchema.parse({
      matchDate: formData.get("matchDate"),
      startTime: formData.get("startTime"),
      location: formData.get("location"),
      notes: formData.get("notes"),
    });

    const startsAt = parsed.startTime
      ? `${parsed.matchDate}T${parsed.startTime}:00`
      : null;

    const { error } = await supabase.from("matches").insert({
      match_date: parsed.matchDate,
      starts_at: startsAt,
      location: parsed.location,
      notes: parsed.notes || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    refreshPaths(["/admin", "/admin/partidas", "/jogos", "/dashboard"]);
    return actionSuccess("Partida criada.");
  } catch (error) {
    return actionError(error);
  }
}

export async function saveMatchResultAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    const supabase = await getActionContext({ adminOnly: true });
    const parsed = resultSchema.parse({
      matchId: formData.get("matchId"),
      blueScore: formData.get("blueScore"),
      redScore: formData.get("redScore"),
    });

    const { error } = await supabase.rpc("finalize_match_result", {
      p_match_id: parsed.matchId,
      p_blue_score: parsed.blueScore,
      p_red_score: parsed.redScore,
    });

    if (error) {
      throw new Error(error.message);
    }

    refreshPaths(["/admin", "/admin/partidas", "/jogos", "/ranking", "/dashboard"]);
    return actionSuccess("Resultado salvo e ranking atualizado.");
  } catch (error) {
    return actionError(error);
  }
}

export async function updateMatchAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    const supabase = await getActionContext({ adminOnly: true });
    const assignmentsRaw = parseAssignmentsFromFormData(formData) as Array<{
      playerId: string;
      teamColor: "blue" | "red";
      isGoalkeeper?: boolean;
      isReserve?: boolean;
      lineupOrder?: number | null;
    }>;

    const parsed = updateMatchSchema.parse({
      matchId: formData.get("matchId"),
      matchDate: formData.get("matchDate"),
      startTime: formData.get("startTime"),
      location: formData.get("location"),
      notes: formData.get("notes"),
      status: formData.get("status"),
      countsForRanking: formData.get("countsForRanking") === "on",
      blueScore: formData.get("blueScore"),
      redScore: formData.get("redScore"),
      assignments: assignmentsRaw ?? [],
    });

    const startsAt = parsed.startTime
      ? `${parsed.matchDate}T${parsed.startTime}:00`
      : null;

    const rpcResult = await supabase.rpc("admin_update_match_bundle", {
      p_match_id: parsed.matchId,
      p_match_date: parsed.matchDate,
      p_starts_at: startsAt,
      p_location: parsed.location,
      p_notes: parsed.notes || null,
      p_status: parsed.status,
      p_counts_for_ranking: parsed.countsForRanking,
      p_blue_score: parsed.blueScore,
      p_red_score: parsed.redScore,
      p_assignments: parsed.assignments.map((assignment) => ({
        player_id: assignment.playerId,
        team_color: assignment.teamColor,
        is_goalkeeper: assignment.isGoalkeeper,
        is_reserve: assignment.isReserve,
        lineup_order: assignment.lineupOrder ?? null,
      })),
    });

    if (rpcResult.error) {
      if (rpcResult.error.code !== "PGRST202") {
        throw new Error(rpcResult.error.message);
      }

      const adminClient = createAdminClient();
      const nowIso = new Date().toISOString();

      const {
        data: existingMatch,
        error: existingMatchError,
      } = await adminClient
        .from("matches")
        .select("id, match_date")
        .eq("id", parsed.matchId)
        .single();

      if (existingMatchError || !existingMatch) {
        throw new Error(existingMatchError?.message ?? "Partida nao encontrada.");
      }

      const previousSeason = new Date(existingMatch.match_date).getFullYear();
      const nextSeason = new Date(parsed.matchDate).getFullYear();

      const { error: matchUpdateError } = await adminClient
        .from("matches")
        .update({
          match_date: parsed.matchDate,
          starts_at: startsAt,
          location: parsed.location,
          notes: parsed.notes || null,
          status: parsed.status,
          counts_for_ranking: parsed.countsForRanking,
          blue_score: parsed.status === "completed" ? parsed.blueScore : null,
          red_score: parsed.status === "completed" ? parsed.redScore : null,
          completed_at: parsed.status === "completed" ? nowIso : null,
        })
        .eq("id", parsed.matchId);

      if (matchUpdateError) {
        throw new Error(matchUpdateError.message);
      }

      const { data: teams, error: teamsError } = await adminClient
        .from("match_teams")
        .select("id, team_color")
        .eq("match_id", parsed.matchId);

      if (teamsError) {
        throw new Error(teamsError.message);
      }

      const teamMap = Object.fromEntries(
        (teams ?? []).map((team) => [team.team_color, team.id]),
      ) as Record<"blue" | "red", string>;

      if (!teamMap.blue || !teamMap.red) {
        throw new Error("A partida nao possui os times base necessarios para edicao.");
      }

      const { error: deleteAssignmentsError } = await adminClient
        .from("match_players")
        .delete()
        .eq("match_id", parsed.matchId);

      if (deleteAssignmentsError) {
        throw new Error(deleteAssignmentsError.message);
      }

      if (parsed.assignments.length > 0) {
        const { error: insertAssignmentsError } = await adminClient
          .from("match_players")
          .insert(
            parsed.assignments.map((assignment) => ({
              match_id: parsed.matchId,
              match_team_id: teamMap[assignment.teamColor],
              player_id: assignment.playerId,
              is_goalkeeper: assignment.isGoalkeeper,
              is_reserve: assignment.isReserve,
              lineup_order: assignment.lineupOrder ?? null,
            })),
          );

        if (insertAssignmentsError) {
          throw new Error(insertAssignmentsError.message);
        }
      }

      const playerIds = parsed.assignments.map((assignment) => assignment.playerId);

      const { error: deleteAttendanceError } = await adminClient
        .from("attendance")
        .delete()
        .eq("match_id", parsed.matchId);

      if (deleteAttendanceError) {
        throw new Error(deleteAttendanceError.message);
      }

      if (playerIds.length > 0) {
        const { error: attendanceUpsertError } = await adminClient
          .from("attendance")
          .upsert(
            playerIds.map((playerId) => ({
              match_id: parsed.matchId,
              player_id: playerId,
              status: "confirmed",
              confirmed_at: nowIso,
            })),
            { onConflict: "match_id,player_id" },
          );

        if (attendanceUpsertError) {
          throw new Error(attendanceUpsertError.message);
        }
      }

      const { error: teamsUpdateError } = await adminClient
        .from("match_teams")
        .update({
          score: 0,
          is_winner: false,
        })
        .eq("match_id", parsed.matchId);

      if (teamsUpdateError) {
        throw new Error(teamsUpdateError.message);
      }

      if (parsed.status === "completed") {
        const blueWon = (parsed.blueScore ?? 0) > (parsed.redScore ?? 0);
        const redWon = (parsed.redScore ?? 0) > (parsed.blueScore ?? 0);

        const { error: blueTeamError } = await adminClient
          .from("match_teams")
          .update({
            score: parsed.blueScore ?? 0,
            is_winner: blueWon,
          })
          .eq("match_id", parsed.matchId)
          .eq("team_color", "blue");

        if (blueTeamError) {
          throw new Error(blueTeamError.message);
        }

        const { error: redTeamError } = await adminClient
          .from("match_teams")
          .update({
            score: parsed.redScore ?? 0,
            is_winner: redWon,
          })
          .eq("match_id", parsed.matchId)
          .eq("team_color", "red");

        if (redTeamError) {
          throw new Error(redTeamError.message);
        }
      }

      const refreshPrevious = await adminClient.rpc("refresh_rankings", {
        target_season: previousSeason,
      });

      if (refreshPrevious.error) {
        throw new Error(refreshPrevious.error.message);
      }

      if (nextSeason !== previousSeason) {
        const refreshNext = await adminClient.rpc("refresh_rankings", {
          target_season: nextSeason,
        });

        if (refreshNext.error) {
          throw new Error(refreshNext.error.message);
        }
      }
    }

    refreshPaths(["/admin", "/admin/partidas", "/jogos", "/ranking", "/dashboard"]);
    return actionSuccess("Partida atualizada e ranking sincronizado.");
  } catch (error) {
    return actionError(error);
  }
}

export async function saveTeamBuilderAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    await getActionContext({ adminOnly: true });
    const adminClient = createAdminClient();
    const nowIso = new Date().toISOString();
    const presentPlayerIds = parseJsonArrayField(
      formData,
      "presentPlayerIds",
      "Nao foi possivel ler a lista de presenca enviada. Atualize a pagina e tente novamente.",
    );
    const assignmentsRaw = parseAssignmentsFromFormData(formData) as Array<{
      playerId: string;
      teamColor: "blue" | "red";
      isGoalkeeper?: boolean;
      isReserve?: boolean;
      lineupOrder?: number | null;
    }>;

    const parsed = teamBuilderSchema.parse({
      matchId: formData.get("matchId"),
      presentPlayerIds,
      assignments: assignmentsRaw ?? [],
    });

    const { data: match, error: matchError } = await adminClient
      .from("matches")
      .select("id, match_date, status, counts_for_ranking")
      .eq("id", parsed.matchId)
      .single();

    if (matchError || !match) {
      throw new Error(matchError?.message ?? "Partida nao encontrada.");
    }

    const { data: teams, error: teamsError } = await adminClient
      .from("match_teams")
      .select("id, team_color")
      .eq("match_id", parsed.matchId);

    if (teamsError) {
      throw new Error(teamsError.message);
    }

    const teamMap = Object.fromEntries(
      (teams ?? []).map((team) => [team.team_color, team.id]),
    ) as Partial<Record<"blue" | "red", string>>;

    if (!teamMap.blue || !teamMap.red) {
      throw new Error("A partida nao possui os times base necessarios para montar a escalacao.");
    }

    const { error: deleteAttendanceError } = await adminClient
      .from("attendance")
      .delete()
      .eq("match_id", parsed.matchId);

    if (deleteAttendanceError) {
      throw new Error(deleteAttendanceError.message);
    }

    if (parsed.presentPlayerIds.length > 0) {
      const { error: insertAttendanceError } = await adminClient
        .from("attendance")
        .upsert(
          parsed.presentPlayerIds.map((playerId) => ({
            match_id: parsed.matchId,
            player_id: playerId,
            status: "confirmed",
            confirmed_at: nowIso,
          })),
          { onConflict: "match_id,player_id" },
        );

      if (insertAttendanceError) {
        throw new Error(insertAttendanceError.message);
      }
    }

    const { error: deleteAssignmentsError } = await adminClient
      .from("match_players")
      .delete()
      .eq("match_id", parsed.matchId);

    if (deleteAssignmentsError) {
      throw new Error(deleteAssignmentsError.message);
    }

    if (parsed.assignments.length > 0) {
      const { error: insertAssignmentsError } = await adminClient
        .from("match_players")
        .insert(
          parsed.assignments.map((assignment) => ({
            match_id: parsed.matchId,
            match_team_id: teamMap[assignment.teamColor],
            player_id: assignment.playerId,
            is_goalkeeper: assignment.isGoalkeeper,
            is_reserve: assignment.isReserve,
            lineup_order: assignment.lineupOrder ?? null,
          })),
        );

      if (insertAssignmentsError) {
        throw new Error(insertAssignmentsError.message);
      }
    }

    if (match.status === "completed" && match.counts_for_ranking) {
      const targetSeason = new Date(match.match_date).getFullYear();
      const refreshResult = await adminClient.rpc("refresh_rankings", {
        target_season: targetSeason,
      });

      if (refreshResult.error) {
        throw new Error(refreshResult.error.message);
      }
    }

    refreshPaths(["/admin", "/admin/partidas", "/jogos", "/dashboard", "/ranking"]);
    return actionSuccess("Montagem salva com presenca e times sincronizados.");
  } catch (error) {
    return actionError(error);
  }
}

export async function assignPlayerToTeamAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    const supabase = await getActionContext({ adminOnly: true });

    const payload = {
      p_match_id: String(formData.get("matchId") ?? ""),
      p_player_id: String(formData.get("playerId") ?? ""),
      p_team_color: String(formData.get("teamColor") ?? "blue"),
      p_is_goalkeeper: formData.get("isGoalkeeper") === "on",
      p_is_reserve: formData.get("isReserve") === "on",
      p_lineup_order: formData.get("lineupOrder")
        ? Number(formData.get("lineupOrder"))
        : null,
    };

    const { error } = await supabase.rpc("assign_player_to_team", payload);

    if (error) {
      throw new Error(error.message);
    }

    refreshPaths(["/admin/partidas", "/jogos"]);
    return actionSuccess("Jogador salvo no time.");
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAttendanceAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    const supabase = await getActionContext();
    const parsed = attendanceSchema.parse({
      matchId: formData.get("matchId"),
      playerId: formData.get("playerId"),
      status: formData.get("status"),
    });

    if (parsed.status === "declined") {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("match_id", parsed.matchId)
        .eq("player_id", parsed.playerId);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("attendance").upsert(
        {
          match_id: parsed.matchId,
          player_id: parsed.playerId,
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        },
        {
          onConflict: "match_id,player_id",
        },
      );

      if (error) {
        throw new Error(error.message);
      }
    }

    refreshPaths(["/jogos", "/dashboard", "/admin", "/admin/partidas"]);
    return actionSuccess("Presenca atualizada.");
  } catch (error) {
    return actionError(error);
  }
}

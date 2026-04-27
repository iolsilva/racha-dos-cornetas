import { getReferenceMonth } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export async function getAdminOverviewData() {
  const supabase = await createClient();

  const [playersResult, matchesResult, summaryResult, attendanceResult] =
    await Promise.all([
      supabase
        .from("players")
        .select("id, active, player_type, position")
        .eq("active", true),
      supabase
        .from("matches")
        .select("id, match_date, status", { count: "exact" })
        .gte("match_date", getReferenceMonth()),
      supabase.rpc("get_financial_summary", {
        p_reference_month: getReferenceMonth(),
      }),
      supabase
        .from("attendance_overview")
        .select("*")
        .order("match_date", { ascending: false })
        .limit(6),
    ]);

  if (playersResult.error) {
    throw new Error(playersResult.error.message);
  }

  if (matchesResult.error) {
    throw new Error(matchesResult.error.message);
  }

  if (summaryResult.error) {
    throw new Error(summaryResult.error.message);
  }

  if (attendanceResult.error) {
    throw new Error(attendanceResult.error.message);
  }

  const activePlayers = playersResult.data ?? [];

  return {
    fixedPlayersCount: activePlayers.filter((player) => player.player_type === "fixed")
      .length,
    guestPlayersCount: activePlayers.filter(
      (player) => player.player_type === "guest" && player.position === "line",
    ).length,
    matchesCount: matchesResult.count ?? 0,
    monthlyFinancial: summaryResult.data?.[0] ?? null,
    attendance: attendanceResult.data ?? [],
  };
}

export async function getAdminPlayersData() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("active", { ascending: false })
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const players = data ?? [];

  return {
    all: players,
    activeLinePlayers: players.filter(
      (player) => player.player_type === "fixed" && player.active,
    ),
    inactiveLinePlayers: players.filter(
      (player) => player.player_type === "fixed" && !player.active,
    ),
    activeGoalkeepers: players.filter(
      (player) => player.player_type === "goalkeeper" && player.active,
    ),
    inactiveGoalkeepers: players.filter(
      (player) => player.player_type === "goalkeeper" && !player.active,
    ),
    activeGuests: players.filter(
      (player) =>
        player.player_type === "guest" &&
        player.position === "line" &&
        player.active,
    ),
    inactiveGuests: players.filter(
      (player) =>
        player.player_type === "guest" &&
        player.position === "line" &&
        !player.active,
    ),
    activeGuestGoalkeepers: players.filter(
      (player) =>
        player.player_type === "guest" &&
        player.position === "goalkeeper" &&
        player.active,
    ),
    inactiveGuestGoalkeepers: players.filter(
      (player) =>
        player.player_type === "guest" &&
        player.position === "goalkeeper" &&
        !player.active,
    ),
  };
}

export async function getAdminFinanceData() {
  const supabase = await createClient();

  const [playersResult, paymentsResult, expensesResult, summaryResult] =
    await Promise.all([
      supabase
        .from("players")
        .select("id, full_name, nickname, fee_exempt, player_type, position")
        .eq("active", true)
        .order("full_name"),
      supabase
        .from("payments")
        .select("id, amount, paid_at, payment_type, reference_month, notes, players(full_name, nickname)")
        .order("paid_at", { ascending: false })
        .limit(20),
      supabase
        .from("expenses")
        .select("id, amount, expense_date, category, description, reference_month, reserve_for_awards")
        .order("expense_date", { ascending: false })
        .limit(20),
      supabase.rpc("get_financial_summary"),
    ]);

  if (playersResult.error) {
    throw new Error(playersResult.error.message);
  }

  if (paymentsResult.error) {
    throw new Error(paymentsResult.error.message);
  }

  if (expensesResult.error) {
    throw new Error(expensesResult.error.message);
  }

  if (summaryResult.error) {
    throw new Error(summaryResult.error.message);
  }

  return {
    players: playersResult.data ?? [],
    monthlyPlayers: (playersResult.data ?? []).filter(
      (player) => player.player_type === "fixed",
    ),
    guestPlayers: (playersResult.data ?? []).filter(
      (player) =>
        player.player_type === "guest" &&
        player.position === "line" &&
        !player.fee_exempt,
    ),
    guestGoalkeepers: (playersResult.data ?? []).filter(
      (player) =>
        player.player_type === "guest" && player.position === "goalkeeper",
    ),
    goalkeepers: (playersResult.data ?? []).filter(
      (player) => player.player_type === "goalkeeper",
    ),
    payments: paymentsResult.data ?? [],
    expenses: expensesResult.data ?? [],
    summary: summaryResult.data ?? [],
  };
}

export async function getAdminMatchesData() {
  const supabase = await createClient();

  const [
    matchesResult,
    playersResult,
    attendanceResult,
    attendanceRecordsResult,
    assignmentsResult,
  ] =
    await Promise.all([
      supabase
        .from("matches")
        .select(
          "id, match_date, starts_at, location, status, counts_for_ranking, blue_score, red_score, notes",
        )
        .order("match_date", { ascending: false }),
      supabase
        .from("players")
        .select("id, full_name, nickname, position, player_type, fee_exempt, active")
        .order("active", { ascending: false })
        .order("full_name"),
      supabase
        .from("attendance_overview")
        .select("*")
        .order("match_date", { ascending: false }),
      supabase
        .from("attendance")
        .select("match_id, player_id, status")
        .order("confirmed_at", { ascending: false }),
      supabase
        .from("match_team_assignments")
        .select("*")
        .order("match_date", { ascending: false })
        .order("lineup_order", { ascending: true }),
    ]);

  if (matchesResult.error) {
    throw new Error(matchesResult.error.message);
  }

  if (playersResult.error) {
    throw new Error(playersResult.error.message);
  }

  if (attendanceResult.error) {
    throw new Error(attendanceResult.error.message);
  }

  if (attendanceRecordsResult.error) {
    throw new Error(attendanceRecordsResult.error.message);
  }

  if (assignmentsResult.error) {
    throw new Error(assignmentsResult.error.message);
  }

  return {
    matches: matchesResult.data ?? [],
    players: playersResult.data ?? [],
    attendance: attendanceResult.data ?? [],
    attendanceRecords: attendanceRecordsResult.data ?? [],
    assignments: assignmentsResult.data ?? [],
  };
}

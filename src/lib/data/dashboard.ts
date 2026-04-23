import { getCurrentProfile } from "@/lib/auth";
import { withCompetitionPositions, compareRankingEntries } from "@/lib/ranking";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReferenceMonth } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

type RankingGroup = "line" | "goalkeeper";

async function getSeasonRankingEntries() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("rankings")
    .select(
      "season_year, player_id, wins, draws, losses, matches_played, players!inner(full_name, nickname, position, active)",
    )
    .eq("season_year", new Date().getFullYear())
    .order("wins", { ascending: false })
    .order("draws", { ascending: false })
    .order("matches_played", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    season_year: row.season_year,
    player_id: row.player_id,
    full_name: (row.players as { full_name?: string } | null)?.full_name ?? "-",
    nickname: (row.players as { nickname?: string } | null)?.nickname ?? "-",
    active: (row.players as { active?: boolean } | null)?.active ?? true,
    position:
      ((row.players as { position?: "line" | "goalkeeper" } | null)?.position ??
        "line") as "line" | "goalkeeper",
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    matches_played: row.matches_played,
  }));
}

function buildSeasonRanking(
  entries: Awaited<ReturnType<typeof getSeasonRankingEntries>>,
  group: RankingGroup,
  limit?: number,
) {
  const rankedEntries = withCompetitionPositions(
    entries
      .filter((entry) => entry.position === group)
      .sort(compareRankingEntries),
  );

  if (!limit) {
    return rankedEntries;
  }

  return rankedEntries.slice(0, limit);
}

async function getSeasonRanking(group: RankingGroup, limit?: number) {
  const entries = await getSeasonRankingEntries();
  return buildSeasonRanking(entries, group, limit);
}

export async function getHomeDashboardData() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [
    playerSnapshotResult,
    rankingResult,
    matchesResult,
    financialResult,
    paymentsResult,
  ] = await Promise.all([
    supabase.rpc("get_player_home_snapshot"),
    getSeasonRanking("line", 5),
    supabase
      .from("matches")
      .select("id, match_date, location, status, blue_score, red_score")
      .order("match_date", { ascending: false })
      .limit(6),
    supabase.rpc("get_financial_summary", {
      p_reference_month: getReferenceMonth(),
    }),
    supabase
      .from("payments")
      .select("id, amount, paid_at, payment_type, reference_month")
      .order("paid_at", { ascending: false })
      .limit(5),
  ]);

  if (playerSnapshotResult.error) {
    throw new Error(playerSnapshotResult.error.message);
  }

  if (matchesResult.error) {
    throw new Error(matchesResult.error.message);
  }

  if (financialResult.error) {
    throw new Error(financialResult.error.message);
  }

  if (paymentsResult.error) {
    throw new Error(paymentsResult.error.message);
  }

  return {
    profile,
    playerSnapshot: playerSnapshotResult.data?.[0] ?? null,
    ranking: rankingResult,
    matches: matchesResult.data ?? [],
    financial: financialResult.data?.[0] ?? null,
    payments: paymentsResult.data ?? [],
  };
}

export async function getFinancePageData() {
  const supabase = await createClient();

  const [summaryResult, myPaymentsResult] = await Promise.all([
    supabase.rpc("get_financial_summary"),
    supabase
      .from("payments")
      .select("id, amount, paid_at, payment_type, reference_month, notes")
      .order("paid_at", { ascending: false })
      .limit(12),
  ]);

  if (summaryResult.error) {
    throw new Error(summaryResult.error.message);
  }

  if (myPaymentsResult.error) {
    throw new Error(myPaymentsResult.error.message);
  }

  return {
    monthlySummary: summaryResult.data ?? [],
    myPayments: myPaymentsResult.data ?? [],
  };
}

export async function getMatchesPageData() {
  const supabase = await createClient();

  const [matchesResult, assignmentsResult] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id, match_date, location, status, blue_score, red_score, notes, starts_at, counts_for_ranking",
      )
      .order("match_date", { ascending: false }),
    supabase
      .from("match_team_assignments")
      .select("*")
      .order("match_date", { ascending: false })
      .limit(20),
  ]);

  if (matchesResult.error) {
    throw new Error(matchesResult.error.message);
  }

  if (assignmentsResult.error) {
    throw new Error(assignmentsResult.error.message);
  }

  return {
    matches: matchesResult.data ?? [],
    assignments: assignmentsResult.data ?? [],
  };
}

export async function getRankingPageData() {
  const supabase = await createClient();

  const [rankingEntriesResult, pairingsResult, winningTeamsResult] = await Promise.all([
    getSeasonRankingEntries(),
    supabase
      .from("player_pairing_stats")
      .select("*")
      .order("matches_together", { ascending: false })
      .limit(8),
    supabase
      .from("team_result_stats")
      .select("*")
      .order("wins", { ascending: false })
      .limit(6),
  ]);

  if (pairingsResult.error) {
    throw new Error(pairingsResult.error.message);
  }

  if (winningTeamsResult.error) {
    throw new Error(winningTeamsResult.error.message);
  }

  return {
    lineRanking: buildSeasonRanking(rankingEntriesResult, "line"),
    goalkeeperRanking: buildSeasonRanking(rankingEntriesResult, "goalkeeper"),
    pairings: pairingsResult.data ?? [],
    winningTeams: winningTeamsResult.data ?? [],
  };
}

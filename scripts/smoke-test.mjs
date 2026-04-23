import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

const TEST_MATCH_DATE = "2026-12-28";
const TEST_REFERENCE_MONTH = "2026-12-01";
const TEST_LOCATION = "Arena Smoke Test";
const TEST_NOTES = "codex-smoke-test";
const TEST_EXPENSE_DESCRIPTION = "codex-smoke-test-despesa";
const TEST_SEASON = Number(TEST_MATCH_DATE.slice(0, 4));

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, "utf8");
  const entries = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        return null;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      return [key, value];
    })
    .filter(Boolean);

  return Object.fromEntries(entries);
}

function getEnv(name, fallback = undefined) {
  return process.env[name] ?? envFromFile[name] ?? fallback;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function logStep(title, details) {
  console.log(`\n[${title}]`);
  if (details) {
    console.log(details);
  }
}

const cwd = process.cwd();
const envFromFile = {
  ...loadEnvFile(join(cwd, ".env.local")),
  ...loadEnvFile(join(cwd, ".env")),
};

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

assert(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL nao encontrada.");
assert(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY nao encontrada.");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function cleanupPreviousRun() {
  logStep("cleanup", "Removendo dados anteriores do smoke test");

  const { data: existingMatches, error: matchLookupError } = await supabase
    .from("matches")
    .select("id")
    .eq("notes", TEST_NOTES);

  if (matchLookupError) {
    throw matchLookupError;
  }

  const matchIds = (existingMatches ?? []).map((match) => match.id);

  if (matchIds.length > 0) {
    await supabase.from("attendance").delete().in("match_id", matchIds);
    await supabase.from("match_players").delete().in("match_id", matchIds);
    await supabase.from("match_teams").delete().in("match_id", matchIds);
    await supabase.from("payments").delete().in("match_id", matchIds);
    await supabase.from("matches").delete().in("id", matchIds);
  }

  await supabase.from("payments").delete().eq("notes", TEST_NOTES);

  await supabase
    .from("expenses")
    .delete()
    .eq("description", TEST_EXPENSE_DESCRIPTION);

  const { error: rankingRefreshError } = await supabase.rpc("refresh_rankings", {
    target_season: TEST_SEASON,
  });

  if (rankingRefreshError) {
    throw rankingRefreshError;
  }
}

async function fetchTestPlayers() {
  logStep("players", "Buscando os tres perfis de teste");

  const emails = [
    "fabio@maia.com.br",
    "iago.oliveira1205@gmail.com",
    "leonardo@augusto.com.br",
  ];

  const { data, error } = await supabase
    .from("players")
    .select("id, full_name, nickname, profile_id, profiles!inner(email)")
    .in("profiles.email", emails)
    .order("full_name");

  if (error) {
    throw error;
  }

  assert(data && data.length === 3, "Nao encontrei os 3 jogadores de teste.");

  const getByEmail = (email) =>
    data.find((row) => row.profiles.email === email);

  return {
    fabio: getByEmail("fabio@maia.com.br"),
    iago: getByEmail("iago.oliveira1205@gmail.com"),
    leo: getByEmail("leonardo@augusto.com.br"),
  };
}

async function captureRankingSnapshot() {
  logStep("ranking-baseline", "Capturando ranking atual dos tres perfis");

  const { data, error } = await supabase
    .from("player_rankings_current_year")
    .select("nickname, wins, draws, losses, matches_played")
    .in("nickname", ["Fabio", "Iago", "Leonardo"]);

  if (error) {
    throw error;
  }

  return Object.fromEntries((data ?? []).map((row) => [row.nickname, row]));
}

async function createMatch() {
  logStep("match", "Criando partida de teste");

  const { data, error } = await supabase
    .from("matches")
    .insert({
      match_date: TEST_MATCH_DATE,
      starts_at: `${TEST_MATCH_DATE}T20:00:00`,
      location: TEST_LOCATION,
      notes: TEST_NOTES,
      status: "scheduled",
    })
    .select("id, match_date, location, status")
    .single();

  if (error) {
    throw error;
  }

  assert(data.status === "scheduled", "Partida nao foi criada como scheduled.");
  return data;
}

async function createAttendance(matchId, players) {
  logStep("attendance", "Registrando presenca dos tres jogadores");

  const rows = Object.values(players).map((player) => ({
    match_id: matchId,
    player_id: player.id,
    status: "confirmed",
    confirmed_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("attendance").insert(rows);

  if (error) {
    throw error;
  }

  const { data, error: verificationError } = await supabase
    .from("attendance")
    .select("id")
    .eq("match_id", matchId);

  if (verificationError) {
    throw verificationError;
  }

  assert(data.length === 3, "Presencas nao foram registradas corretamente.");
}

async function assignTeams(matchId, players) {
  logStep("teams", "Montando times azul e vermelho");

  const { data: teams, error: teamsError } = await supabase
    .from("match_teams")
    .select("id, team_color")
    .eq("match_id", matchId);

  if (teamsError) {
    throw teamsError;
  }

  const blueTeam = teams.find((team) => team.team_color === "blue");
  const redTeam = teams.find((team) => team.team_color === "red");

  assert(blueTeam && redTeam, "Os times padrao nao foram criados pelo trigger.");

  const assignments = [
    {
      match_id: matchId,
      match_team_id: blueTeam.id,
      player_id: players.iago.id,
      is_goalkeeper: false,
      is_reserve: false,
      lineup_order: 1,
    },
    {
      match_id: matchId,
      match_team_id: blueTeam.id,
      player_id: players.fabio.id,
      is_goalkeeper: false,
      is_reserve: false,
      lineup_order: 2,
    },
    {
      match_id: matchId,
      match_team_id: redTeam.id,
      player_id: players.leo.id,
      is_goalkeeper: false,
      is_reserve: false,
      lineup_order: 1,
    },
  ];

  const { error } = await supabase.from("match_players").insert(assignments);

  if (error) {
    throw error;
  }

  const { data: verification, error: verificationError } = await supabase
    .from("match_team_assignments")
    .select("nickname, team_color")
    .eq("match_id", matchId);

  if (verificationError) {
    throw verificationError;
  }

  assert(verification.length === 3, "Escalacoes nao foram salvas corretamente.");
}

async function registerFinancials(matchId, players) {
  logStep("financial", "Registrando pagamento e despesa de teste");

  const { error: paymentError } = await supabase.from("payments").insert({
    player_id: players.fabio.id,
    match_id: matchId,
    reference_month: TEST_REFERENCE_MONTH,
    payment_type: "monthly_fee",
    amount: 50,
    paid_at: "2026-12-06",
    notes: TEST_NOTES,
  });

  if (paymentError) {
    throw paymentError;
  }

  const { error: expenseError } = await supabase.from("expenses").insert({
    reference_month: TEST_REFERENCE_MONTH,
    amount: 25,
    category: "other",
    expense_date: "2026-12-06",
    description: TEST_EXPENSE_DESCRIPTION,
    reserve_for_awards: false,
  });

  if (expenseError) {
    throw expenseError;
  }

  const { data: summary, error: summaryError } = await supabase.rpc(
    "get_financial_summary",
    {
      p_reference_month: TEST_REFERENCE_MONTH,
    },
  );

  if (summaryError) {
    throw summaryError;
  }

  assert(summary?.[0], "Resumo financeiro nao retornou dados.");
  assert(Number(summary[0].total_payments) >= 50, "Pagamento nao entrou no resumo.");
  assert(Number(summary[0].total_expenses) >= 25, "Despesa nao entrou no resumo.");
}

async function finalizeResult(matchId) {
  logStep("result", "Fechando placar e recalculando ranking");

  const { error: matchError } = await supabase
    .from("matches")
    .update({
      status: "completed",
      blue_score: 3,
      red_score: 1,
      completed_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (matchError) {
    throw matchError;
  }

  const { error: teamsError } = await supabase
    .from("match_teams")
    .update({
      score: 3,
      is_winner: true,
    })
    .eq("match_id", matchId)
    .eq("team_color", "blue");

  if (teamsError) {
    throw teamsError;
  }

  const { error: redTeamError } = await supabase
    .from("match_teams")
    .update({
      score: 1,
      is_winner: false,
    })
    .eq("match_id", matchId)
    .eq("team_color", "red");

  if (redTeamError) {
    throw redTeamError;
  }

  const { error: rankingError } = await supabase.rpc("refresh_rankings", {
    target_season: 2026,
  });

  if (rankingError) {
    throw rankingError;
  }
}

async function verifyRanking(beforeRanking) {
  logStep("ranking", "Validando ranking anual");

  const { data, error } = await supabase
    .from("player_rankings_current_year")
    .select("nickname, wins, draws, losses, matches_played")
    .in("nickname", ["Fabio", "Iago", "Leonardo"])
    .order("nickname");

  if (error) {
    throw error;
  }

  const byNickname = Object.fromEntries(data.map((row) => [row.nickname, row]));

  assert(
    byNickname.Fabio?.wins === (beforeRanking.Fabio?.wins ?? 0) + 1,
    "Fabio deveria somar 1 vitoria no smoke test.",
  );
  assert(
    byNickname.Iago?.wins === (beforeRanking.Iago?.wins ?? 0) + 1,
    "Iago deveria somar 1 vitoria no smoke test.",
  );
  assert(
    byNickname.Leonardo?.losses === (beforeRanking.Leonardo?.losses ?? 0) + 1,
    "Leonardo deveria somar 1 derrota no smoke test.",
  );
  assert(
    byNickname.Fabio?.matches_played === (beforeRanking.Fabio?.matches_played ?? 0) + 1,
    "Fabio deveria somar 1 jogo no smoke test.",
  );
  assert(
    byNickname.Iago?.matches_played === (beforeRanking.Iago?.matches_played ?? 0) + 1,
    "Iago deveria somar 1 jogo no smoke test.",
  );
  assert(
    byNickname.Leonardo?.matches_played ===
      (beforeRanking.Leonardo?.matches_played ?? 0) + 1,
    "Leonardo deveria somar 1 jogo no smoke test.",
  );
}

async function main() {
  await cleanupPreviousRun();
  const players = await fetchTestPlayers();
  const rankingBefore = await captureRankingSnapshot();
  const match = await createMatch();
  await createAttendance(match.id, players);
  await assignTeams(match.id, players);
  await registerFinancials(match.id, players);
  await finalizeResult(match.id);
  await verifyRanking(rankingBefore);
  await cleanupPreviousRun();

  logStep(
    "done",
    [
      `Partida: ${match.match_date} em ${match.location}`,
      "Presenca: 3 confirmacoes",
      "Times: azul = Iago/Fabio, vermelho = Leo",
      "Financeiro: 1 pagamento + 1 despesa",
      "Ranking validado e ambiente limpo ao final do teste",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error("\n[error]");
  console.error(error.message ?? error);
  process.exitCode = 1;
});

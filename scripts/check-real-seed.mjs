import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

const env = {
  ...loadEnvFile(join(process.cwd(), ".env.local")),
  ...process.env,
};

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  },
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const [playersResult, monthlyPaymentsResult, guestPaymentsResult, matchResult, rankingResult] =
    await Promise.all([
      supabase
        .from("players")
        .select("id, nickname, player_type, fee_exempt", { count: "exact" })
        .eq("active", true),
      supabase
        .from("payments")
        .select("id, amount, payment_type, players!inner(nickname)", { count: "exact" })
        .eq("reference_month", "2026-04-01")
        .eq("payment_type", "monthly_fee"),
      supabase
        .from("payments")
        .select("id, amount, payment_type, paid_at, players!inner(nickname)", { count: "exact" })
        .eq("paid_at", "2026-04-20")
        .eq("payment_type", "guest_fee"),
      supabase
        .from("matches")
        .select("id, match_date, status, blue_score, red_score, location")
        .eq("match_date", "2026-04-22")
        .single(),
      supabase
        .from("player_rankings_current_year")
        .select("nickname, wins, draws, losses, matches_played")
        .in("nickname", ["Fabio", "Iago", "Leonardo", "Ale", "Michael"]),
    ]);

  if (playersResult.error) throw playersResult.error;
  if (monthlyPaymentsResult.error) throw monthlyPaymentsResult.error;
  if (guestPaymentsResult.error) throw guestPaymentsResult.error;
  if (matchResult.error) throw matchResult.error;
  if (rankingResult.error) throw rankingResult.error;

  const players = playersResult.data ?? [];
  const linePlayers = players.filter((player) => player.player_type === "fixed");
  const goalkeepers = players.filter((player) => player.player_type === "goalkeeper");
  const guests = players.filter((player) => player.player_type === "guest");

  assert(linePlayers.length === 18, `Esperado 18 mensalistas, encontrei ${linePlayers.length}.`);
  assert(goalkeepers.length === 2, `Esperado 2 goleiros, encontrei ${goalkeepers.length}.`);
  assert(guests.length === 6, `Esperado 6 diaristas, encontrei ${guests.length}.`);
  assert(
    goalkeepers.every((player) => player.fee_exempt),
    "Os goleiros deveriam estar todos isentos.",
  );

  assert(
    (monthlyPaymentsResult.count ?? 0) === 18,
    `Esperado 18 mensalidades de abril, encontrei ${monthlyPaymentsResult.count ?? 0}.`,
  );
  assert(
    (guestPaymentsResult.count ?? 0) === 6,
    `Esperado 6 pagamentos de diarista em 20/04, encontrei ${guestPaymentsResult.count ?? 0}.`,
  );

  assert(matchResult.data.status === "completed", "A partida de 22/04 deveria estar concluida.");
  assert(
    matchResult.data.blue_score === 6 && matchResult.data.red_score === 7,
    "O placar da partida de 22/04 deveria ser 6x7.",
  );

  const ranking = Object.fromEntries(
    (rankingResult.data ?? []).map((row) => [row.nickname, row]),
  );

  console.log("[ok] jogadores");
  console.log(
    JSON.stringify(
      {
        mensalistas_linha: linePlayers.length,
        goleiros: goalkeepers.length,
        diaristas: guests.length,
      },
      null,
      2,
    ),
  );

  console.log("\n[ok] financeiro abril");
  console.log(
    JSON.stringify(
      {
        mensalidades_abril: monthlyPaymentsResult.count ?? 0,
        diaristas_20_04: guestPaymentsResult.count ?? 0,
      },
      null,
      2,
    ),
  );

  console.log("\n[ok] partida 22/04");
  console.log(JSON.stringify(matchResult.data, null, 2));

  console.log("\n[ok] recorte ranking");
  console.log(JSON.stringify(ranking, null, 2));
}

main().catch((error) => {
  console.error("[error]");
  console.error(error.message ?? error);
  process.exit(1);
});

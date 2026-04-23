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

const expected = {
  Fabio: { wins: 7, draws: 1, losses: 5, matches_played: 13 },
  "Wesley Floreal": { wins: 7, draws: 1, losses: 2, matches_played: 10 },
  Leonardo: { wins: 7, draws: 1, losses: 1, matches_played: 9 },
  Paulo: { wins: 6, draws: 1, losses: 6, matches_played: 13 },
  Oscar: { wins: 6, draws: 0, losses: 3, matches_played: 9 },
  "Wesley Alves": { wins: 5, draws: 1, losses: 6, matches_played: 12 },
  "Joao Victor": { wins: 5, draws: 1, losses: 6, matches_played: 12 },
  GGzin: { wins: 5, draws: 1, losses: 4, matches_played: 10 },
  Iago: { wins: 5, draws: 1, losses: 3, matches_played: 9 },
  Felipe: { wins: 5, draws: 0, losses: 1, matches_played: 6 },
  Dodo: { wins: 4, draws: 1, losses: 5, matches_played: 10 },
  Henrique: { wins: 4, draws: 1, losses: 3, matches_played: 8 },
  "Joao Melo": { wins: 4, draws: 0, losses: 4, matches_played: 8 },
  Bruno: { wins: 3, draws: 1, losses: 5, matches_played: 9 },
  Vini: { wins: 3, draws: 1, losses: 3, matches_played: 7 },
  Mike: { wins: 2, draws: 1, losses: 4, matches_played: 7 },
  "Joao Fernando": { wins: 2, draws: 0, losses: 7, matches_played: 9 },
  Filipe: { wins: 2, draws: 0, losses: 5, matches_played: 7 },
  Ale: { wins: 5, draws: 1, losses: 2, matches_played: 8 },
  Michael: { wins: 2, draws: 0, losses: 5, matches_played: 7 },
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const { data, error } = await supabase
    .from("player_rankings_current_year")
    .select("nickname, wins, draws, losses, matches_played, position");

  if (error) throw error;

  const actual = Object.fromEntries(data.map((row) => [row.nickname, row]));

  for (const [nickname, stats] of Object.entries(expected)) {
    const row = actual[nickname];
    assert(row, `Jogador ausente no ranking: ${nickname}`);
    assert(
      row.wins === stats.wins &&
        row.draws === stats.draws &&
        row.losses === stats.losses &&
        row.matches_played === stats.matches_played,
      `Ranking divergente para ${nickname}: esperado ${JSON.stringify(stats)}, atual ${JSON.stringify(row)}`,
    );
  }

  console.log("[ok] ranking baseline confirmado");
  console.log(JSON.stringify(expected, null, 2));
}

main().catch((error) => {
  console.error("[error]");
  console.error(error.message ?? error);
  process.exit(1);
});

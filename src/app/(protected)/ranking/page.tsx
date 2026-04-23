import { Award, Medal, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, Td, Th } from "@/components/ui/table";
import { getRankingPageData } from "@/lib/data/dashboard";
import { formatDate, formatOrdinalRank } from "@/lib/format";
import { formatPlayerStatusLabel } from "@/lib/labels";
import { countEntriesByRank } from "@/lib/ranking";

const podiumStyles = {
  1: {
    icon: Trophy,
    badge: "border-amber-300/30 bg-amber-400/15 text-amber-100",
    card: "border-amber-300/30 bg-[linear-gradient(160deg,rgba(250,204,21,0.24),rgba(15,23,42,0.96))] shadow-[0_22px_60px_rgba(250,204,21,0.18)] xl:-translate-y-4",
    row: "bg-amber-400/10",
    title: "text-3xl",
    label: "Campeao da temporada",
  },
  2: {
    icon: Medal,
    badge: "border-slate-300/20 bg-slate-200/10 text-slate-100",
    card: "border-slate-200/20 bg-[linear-gradient(160deg,rgba(148,163,184,0.18),rgba(15,23,42,0.96))]",
    row: "bg-slate-200/10",
    title: "text-2xl",
    label: "Vice-lider",
  },
  3: {
    icon: Award,
    badge: "border-orange-300/20 bg-orange-400/10 text-orange-100",
    card: "border-orange-300/20 bg-[linear-gradient(160deg,rgba(251,146,60,0.18),rgba(15,23,42,0.96))]",
    row: "bg-orange-400/10",
    title: "text-2xl",
    label: "Terceiro lugar",
  },
} as const;

function getStatusBadgeClassName(active: boolean) {
  return active
    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
    : "border-white/10 bg-slate-900/80 text-slate-300";
}

export default async function RankingPage() {
  const { ranking, pairings, winningTeams } = await getRankingPageData();
  const lineRanking = ranking.filter((entry) => entry.position === "line");
  const goalkeeperRanking = ranking.filter(
    (entry) => entry.position === "goalkeeper",
  );
  const lineRankCounts = countEntriesByRank(lineRanking);
  const hasClassicPodium =
    lineRanking[0]?.rank_position === 1 &&
    lineRanking[1]?.rank_position === 2 &&
    lineRanking[2]?.rank_position === 3;
  const podiumEntries = hasClassicPodium
    ? [2, 1, 3]
        .map((position) =>
          lineRanking.find((entry) => entry.rank_position === position) ?? null,
        )
        .filter(
          (
            entry,
          ): entry is (typeof lineRanking)[number] => entry !== null,
        )
    : lineRanking.slice(0, 3);

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Ranking"
        title="Temporada anual"
        description="Desempate por vitorias, depois empates e por fim jogos disputados."
      />

      {podiumEntries.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-3 xl:items-end">
          {podiumEntries.map((entry) => {
            const podiumStyle =
              podiumStyles[
                (entry.rank_position <= 3 ? entry.rank_position : 3) as 1 | 2 | 3
              ];
            const Icon = podiumStyle.icon;
            const isTied = (lineRankCounts[entry.rank_position] ?? 0) > 1;

            return (
              <Card key={entry.player_id} className={podiumStyle.card}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      {podiumStyle.label}
                    </p>
                    <h3 className={`mt-3 font-semibold text-white ${podiumStyle.title}`}>
                      {entry.nickname}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className={podiumStyle.badge}>
                        {formatOrdinalRank(entry.rank_position)} lugar
                      </Badge>
                      {isTied ? (
                        <Badge className="border-white/10 bg-white/5 text-slate-200">
                          Empatado
                        </Badge>
                      ) : null}
                      {!entry.active ? (
                        <Badge className="border-white/10 bg-slate-900/80 text-slate-300">
                          {formatPlayerStatusLabel(entry.active)}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">V</p>
                    <p className="mt-1 text-lg font-semibold text-white">{entry.wins}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">E</p>
                    <p className="mt-1 text-lg font-semibold text-white">{entry.draws}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">D</p>
                    <p className="mt-1 text-lg font-semibold text-white">{entry.losses}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">J</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {entry.matches_played}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Mensalistas - jogadores linha
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Classificacao completa
              </h3>
            </div>
            <Badge>Linha</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Jogador</Th>
                  <Th>Status</Th>
                  <Th>V</Th>
                  <Th>E</Th>
                  <Th>D</Th>
                  <Th>J</Th>
                </tr>
              </thead>
              <tbody>
                {lineRanking.map((entry) => {
                  const isPodium = entry.rank_position <= 3;
                  const podiumPlace = isPodium
                    ? (entry.rank_position as 1 | 2 | 3)
                    : null;
                  const isTied = (lineRankCounts[entry.rank_position] ?? 0) > 1;

                  return (
                    <tr
                      key={entry.player_id}
                      className={podiumPlace ? podiumStyles[podiumPlace].row : undefined}
                    >
                      <Td>
                        {podiumPlace ? (
                          <Badge className={podiumStyles[podiumPlace].badge}>
                            {formatOrdinalRank(entry.rank_position)}
                          </Badge>
                        ) : (
                          formatOrdinalRank(entry.rank_position)
                        )}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{entry.nickname}</span>
                          {isTied ? (
                            <Badge className="border-white/10 bg-white/5 text-slate-200">
                              Empate
                            </Badge>
                          ) : null}
                        </div>
                      </Td>
                      <Td>
                        <Badge className={getStatusBadgeClassName(entry.active)}>
                          {formatPlayerStatusLabel(entry.active)}
                        </Badge>
                      </Td>
                      <Td>{entry.wins}</Td>
                      <Td>{entry.draws}</Td>
                      <Td>{entry.losses}</Td>
                      <Td>{entry.matches_played}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Goleiros
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Melhor goleiro
              </h3>
            </div>
            <Badge>Separado</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Goleiro</Th>
                  <Th>Status</Th>
                  <Th>V</Th>
                  <Th>E</Th>
                  <Th>D</Th>
                  <Th>J</Th>
                </tr>
              </thead>
              <tbody>
                {goalkeeperRanking.map((entry) => (
                  <tr key={entry.player_id}>
                    <Td>{formatOrdinalRank(entry.rank_position)}</Td>
                    <Td>{entry.nickname}</Td>
                    <Td>
                      <Badge className={getStatusBadgeClassName(entry.active)}>
                        {formatPlayerStatusLabel(entry.active)}
                      </Badge>
                    </Td>
                    <Td>{entry.wins}</Td>
                    <Td>{entry.draws}</Td>
                    <Td>{entry.losses}</Td>
                    <Td>{entry.matches_played}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Quem mais joga junto
          </p>
          <div className="mt-4 space-y-3">
            {pairings.map((pair) => (
              <div
                key={`${pair.player_a_id}-${pair.player_b_id}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="font-medium text-white">
                  {pair.player_a_nickname} + {pair.player_b_nickname}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {pair.matches_together} partidas juntos
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Time com mais vitorias
          </p>
          <div className="mt-4 space-y-3">
            {winningTeams.map((team) => (
              <div
                key={`${team.team_signature}-${team.team_color}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="font-medium text-white">
                  {team.team_color} - {team.team_signature}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {team.wins} vitorias | ultima aparicao {formatDate(team.last_match_date)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

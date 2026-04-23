import { MatchesHistoryBrowser } from "@/components/jogos/matches-history-browser";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { teamColors } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getMatchesPageData } from "@/lib/data/dashboard";

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

export default async function JogosPage() {
  const { matches, assignments } = await getMatchesPageData();
  const nextMatch = matches.find((match) => match.status === "scheduled");

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Partidas"
        title="Agenda e historico"
        description="Visualizacao mobile dos jogos, placares e times salvos por data."
      />

      {nextMatch ? (
        <Card className="mesh-panel">
          <div className="relative">
            <Badge>Proxima segunda</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              {formatDate(nextMatch.match_date)}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{nextMatch.location}</p>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="Nenhuma partida agendada"
          description="Crie a proxima rodada na area administrativa para liberar confirmacoes."
        />
      )}

      <MatchesHistoryBrowser
        matches={matches}
        assignments={assignments as AssignmentRow[]}
      />
    </div>
  );
}

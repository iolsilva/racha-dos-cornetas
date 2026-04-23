import { MatchEditorPanel } from "@/components/admin/match-editor-panel";
import { TeamAssignmentForm } from "@/components/forms/team-assignment-form";
import { MatchForm } from "@/components/forms/match-form";
import { MatchResultForm } from "@/components/forms/match-result-form";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, Td, Th } from "@/components/ui/table";
import { teamColors } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getAdminMatchesData } from "@/lib/data/admin";
import { requireAdmin } from "@/lib/auth";
import { formatMatchStatusLabel } from "@/lib/labels";

type AssignmentRow = {
  id: string;
  match_id: string;
  player_id: string;
  match_date: string;
  nickname: string;
  team_color: keyof typeof teamColors;
  is_goalkeeper: boolean;
  is_reserve: boolean;
  lineup_order: number | null;
};

export default async function AdminPartidasPage() {
  await requireAdmin();
  const data = await getAdminMatchesData();

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Admin / Partidas"
        title="Agenda, confirmacoes e placares"
        description="Base para criar a rodada, controlar quem entra e fechar o ranking com o resultado."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            Criar partida
          </p>
          <MatchForm />
        </Card>
        <Card>
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            Registrar placar final
          </p>
          <MatchResultForm matches={data.matches.filter((item) => item.status !== "cancelled")} />
        </Card>
      </div>

      <MatchEditorPanel
        matches={data.matches}
        players={data.players}
        assignments={data.assignments as AssignmentRow[]}
      />

      <Card className="mesh-panel">
        <div className="relative">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            Montar times
          </p>
          <TeamAssignmentForm
            matches={data.matches}
            players={data.players.filter((player) => player.active)}
          />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Historico de partidas
          </p>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Local</Th>
                  <Th>Status</Th>
                  <Th>Ranking</Th>
                  <Th>Placar</Th>
                </tr>
              </thead>
              <tbody>
                {data.matches.map((match) => (
                  <tr key={match.id}>
                    <Td>{formatDate(match.match_date)}</Td>
                    <Td>{match.location}</Td>
                    <Td>{formatMatchStatusLabel(match.status)}</Td>
                    <Td>{match.counts_for_ranking ? "Conta" : "Ignora"}</Td>
                    <Td>
                      {match.blue_score ?? "-"} x {match.red_score ?? "-"}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Resumo de confirmacoes
          </p>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Confirmados</Th>
                  <Th>Diaristas</Th>
                  <Th>Reservas</Th>
                </tr>
              </thead>
              <tbody>
                {data.attendance.map((item) => (
                  <tr key={item.match_id}>
                    <Td>{formatDate(item.match_date)}</Td>
                    <Td>{item.confirmed_players}</Td>
                    <Td>{item.guests_confirmed}</Td>
                    <Td>{item.reserve_spots}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Escalacoes salvas
        </p>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <Th>Data</Th>
                <Th>Jogador</Th>
                <Th>Time</Th>
                <Th>Goleiro</Th>
                <Th>Reserva</Th>
              </tr>
            </thead>
            <tbody>
              {(data.assignments as AssignmentRow[]).map((assignment) => (
                <tr key={assignment.id}>
                  <Td>{formatDate(assignment.match_date)}</Td>
                  <Td>{assignment.nickname}</Td>
                  <Td>{teamColors[assignment.team_color].label}</Td>
                  <Td>{assignment.is_goalkeeper ? "Sim" : "Nao"}</Td>
                  <Td>{assignment.is_reserve ? "Sim" : "Nao"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

import { CalendarClock, CreditCard, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Table, Td, Th } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAdminOverviewData } from "@/lib/data/admin";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();
  const data = await getAdminOverviewData();

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Administrador"
        title="Controle operacional"
        description="Painel com os principais indicadores para fechar financeiro, convocacao e rodada."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={Users}
          title="Mensalistas ativos"
          value={String(data.fixedPlayersCount)}
          subtitle="Somente a base fixa aparece como lista ativa principal"
        />
        <StatsCard
          icon={Users}
          title="Diaristas ativos"
          value={String(data.guestPlayersCount)}
          subtitle="Mantidos separados para nao confundir a operacao"
        />
        <StatsCard
          icon={CreditCard}
          title="Saldo do mes"
          value={formatCurrency(data.monthlyFinancial?.balance)}
          subtitle="Caixa operacional atualizado"
        />
        <StatsCard
          icon={CalendarClock}
          title="Partidas no ciclo"
          value={String(data.matchesCount)}
          subtitle="Jogos criados a partir do inicio do mes"
        />
      </div>

      <Card>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Confirmacoes recentes
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
  );
}

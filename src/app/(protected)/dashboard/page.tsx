import {
  CalendarRange,
  CircleDollarSign,
  ShieldCheck,
  Trophy,
} from "lucide-react";

import { AttendanceForm } from "@/components/forms/attendance-form";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Table, Td, Th } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getHomeDashboardData } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { profile, playerSnapshot, ranking, matches, financial } =
    await getHomeDashboardData();
  const supabase = await createClient();

  const nextMatch = matches.find((match) => match.status === "scheduled") ?? null;
  let attendance = null;

  if (nextMatch) {
    const { data, error } = await supabase
      .from("attendance")
      .select("match_id, player_id, status")
      .eq("match_id", nextMatch.id)
      .eq("player_id", playerSnapshot?.player_id ?? "")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    attendance = data;
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Racha dos Cornetas"
        title="Painel oficial da temporada"
        description="Resumo do caixa, da rodada e do seu desempenho no sistema oficial do racha."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={CircleDollarSign}
          title="Saldo atual"
          value={formatCurrency(financial?.balance)}
          subtitle="Receitas, despesas e reserva consolidadas"
        />
        <StatsCard
          icon={Trophy}
          title="Minhas vitorias"
          value={String(playerSnapshot?.wins ?? 0)}
          subtitle={`${playerSnapshot?.matches_played ?? 0} jogos na temporada`}
        />
        <StatsCard
          icon={ShieldCheck}
          title="Mensalidade pendente"
          value={formatCurrency(playerSnapshot?.pending_amount)}
          subtitle="Situacao do ciclo financeiro atual"
        />
        <StatsCard
          icon={CalendarRange}
          title="Proxima rodada"
          value={nextMatch ? formatDate(nextMatch.match_date) : "-"}
          subtitle={nextMatch?.location ?? "Agenda em atualizacao"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Organizacao da rodada
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Confirmacao para a proxima partida
              </h3>
            </div>
            {attendance?.status === "confirmed" ? <Badge>Confirmado</Badge> : null}
          </div>
          {nextMatch && playerSnapshot?.player_id ? (
            <>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Proxima rodada</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatDate(nextMatch.match_date)}
                </p>
                <p className="mt-1 text-sm text-slate-400">{nextMatch.location}</p>
              </div>
              <AttendanceForm
                matchId={nextMatch.id}
                playerId={playerSnapshot.player_id}
                confirmed={attendance?.status === "confirmed"}
              />
            </>
          ) : (
            <EmptyState
              title="Nenhuma partida aberta"
              description="Assim que a proxima rodada for cadastrada, a confirmacao aparece aqui."
            />
          )}
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Meu desempenho
          </p>
          <div className="mt-5 grid gap-3">
            {[
              { label: "Vitorias", value: playerSnapshot?.wins ?? 0 },
              { label: "Empates", value: playerSnapshot?.draws ?? 0 },
              { label: "Derrotas", value: playerSnapshot?.losses ?? 0 },
              { label: "Jogos", value: playerSnapshot?.matches_played ?? 0 },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Perfil: {profile?.role === "admin" ? "Administrador" : "Jogador"}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Destaque da temporada
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Top 5 do ranking
              </h3>
            </div>
            <Badge>Temporada oficial</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Jogador</Th>
                  <Th>V</Th>
                  <Th>E</Th>
                  <Th>J</Th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry) => (
                  <tr key={entry.player_id}>
                    <Td>{entry.nickname}</Td>
                    <Td>{entry.wins}</Td>
                    <Td>{entry.draws}</Td>
                    <Td>{entry.matches_played}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Financeiro do periodo
          </p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm text-slate-400">Arrecadado</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {formatCurrency(financial?.total_payments)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm text-slate-400">Despesas</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {formatCurrency(financial?.total_expenses)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm text-slate-400">Reserva premiacao</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {formatCurrency(financial?.prize_reserve)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

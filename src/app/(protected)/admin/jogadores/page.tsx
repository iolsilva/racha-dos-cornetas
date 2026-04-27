import { Shield, UserRound, Users } from "lucide-react";

import { PlayerStatusToggleForm } from "@/components/admin/player-status-toggle-form";
import { PlayerForm } from "@/components/forms/player-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Table, Td, Th } from "@/components/ui/table";
import { getAdminPlayersData } from "@/lib/data/admin";
import { requireAdmin } from "@/lib/auth";
import {
  formatPlayerRegistrationLabel,
  formatPlayerStatusLabel,
  formatPositionLabel,
} from "@/lib/labels";

function PlayersTable({
  players,
  emptyMessage,
}: {
  players: Array<{
    id: string;
    full_name: string;
    nickname: string;
    active: boolean;
    fee_exempt: boolean;
    player_type: "fixed" | "guest" | "goalkeeper";
    position: "line" | "goalkeeper";
  }>;
  emptyMessage: string;
}) {
  if (players.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <thead>
          <tr>
            <Th>Nome</Th>
            <Th>Apelido</Th>
            <Th>Tipo</Th>
            <Th>Posicao</Th>
            <Th>Status</Th>
            <Th>Isento</Th>
            <Th className="text-right">Acao</Th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <Td>{player.full_name}</Td>
              <Td>{player.nickname}</Td>
              <Td>
                {formatPlayerRegistrationLabel(player.player_type, player.position)}
              </Td>
              <Td>{formatPositionLabel(player.position)}</Td>
              <Td>
                <Badge
                  className={
                    player.active
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                      : "border-white/10 bg-slate-800/80 text-slate-300"
                  }
                >
                  {formatPlayerStatusLabel(player.active)}
                </Badge>
              </Td>
              <Td>{player.fee_exempt ? "Sim" : "Nao"}</Td>
              <Td className="text-right">
                <div className="flex justify-end">
                  <PlayerStatusToggleForm playerId={player.id} active={player.active} />
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default async function AdminJogadoresPage() {
  await requireAdmin();
  const players = await getAdminPlayersData();

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Admin / Jogadores"
        title="Cadastro e manutencao"
        description="Mensalistas, goleiros fixos, diaristas de linha e goleiros diaristas ficam separados para refletir a operacao real do racha."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={Users}
          title="Mensalistas ativos"
          value={String(players.activeLinePlayers.length)}
          subtitle={`${players.inactiveLinePlayers.length} inativos arquivados com historico preservado`}
        />
        <StatsCard
          icon={Shield}
          title="Goleiros fixos"
          value={String(players.activeGoalkeepers.length)}
          subtitle={`${players.inactiveGoalkeepers.length} goleiros inativos no arquivo`}
        />
        <StatsCard
          icon={UserRound}
          title="Diaristas de linha"
          value={String(players.activeGuests.length)}
          subtitle={`${players.inactiveGuests.length} diaristas inativos em lista separada`}
        />
        <StatsCard
          icon={Shield}
          title="Goleiros diaristas"
          value={String(players.activeGuestGoalkeepers.length)}
          subtitle={`${players.inactiveGuestGoalkeepers.length} goleiros diaristas inativos em lista separada`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <PlayerForm />
        </Card>

        <div className="grid gap-6">
          <Card>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Mensalistas ativos
            </p>
            <div className="mt-4">
              <PlayersTable
                players={players.activeLinePlayers}
                emptyMessage="Nenhum mensalista ativo no momento."
              />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Goleiros
              </p>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Ativos
                  </p>
                  <PlayersTable
                    players={players.activeGoalkeepers}
                    emptyMessage="Nenhum goleiro ativo cadastrado."
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Inativos
                  </p>
                  <PlayersTable
                    players={players.inactiveGoalkeepers}
                    emptyMessage="Nenhum goleiro inativo no arquivo."
                  />
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Diaristas
              </p>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Ativos
                  </p>
                  <PlayersTable
                    players={players.activeGuests}
                    emptyMessage="Nenhum diarista ativo cadastrado."
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Goleiros diaristas ativos
                  </p>
                  <PlayersTable
                    players={players.activeGuestGoalkeepers}
                    emptyMessage="Nenhum goleiro diarista ativo cadastrado."
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Inativos
                  </p>
                  <PlayersTable
                    players={players.inactiveGuests}
                    emptyMessage="Nenhum diarista inativo no arquivo."
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Goleiros diaristas inativos
                  </p>
                  <PlayersTable
                    players={players.inactiveGuestGoalkeepers}
                    emptyMessage="Nenhum goleiro diarista inativo no arquivo."
                  />
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Mensalistas inativos
            </p>
            <div className="mt-4">
              <PlayersTable
                players={players.inactiveLinePlayers}
                emptyMessage="Nenhum mensalista inativo no arquivo."
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

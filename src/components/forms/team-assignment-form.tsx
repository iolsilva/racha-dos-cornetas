"use client";

import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { assignPlayerToTeamAction } from "@/server/actions/admin";

export function TeamAssignmentForm({
  matches,
  players,
}: {
  matches: Array<{
    id: string;
    match_date: string;
    location: string;
    status: string;
  }>;
  players: Array<{
    id: string;
    full_name: string;
    nickname: string;
    player_type?: string;
  }>;
}) {
  const { formAction } = useServerAction(assignPlayerToTeamAction);
  const monthlyPlayers = players.filter((player) => !player.player_type || player.player_type === "fixed");
  const goalkeepers = players.filter((player) => player.player_type === "goalkeeper");
  const guestPlayers = players.filter((player) => player.player_type === "guest");

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <FormField label="Partida">
        <Select name="matchId" defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.match_date} - {match.location}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Jogador">
        <Select name="playerId" defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          {monthlyPlayers.length > 0 ? (
            <optgroup label="Mensalistas">
              {monthlyPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nickname} - {player.full_name}
                </option>
              ))}
            </optgroup>
          ) : null}
          {goalkeepers.length > 0 ? (
            <optgroup label="Goleiros">
              {goalkeepers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nickname} - {player.full_name}
                </option>
              ))}
            </optgroup>
          ) : null}
          {guestPlayers.length > 0 ? (
            <optgroup label="Diaristas">
              {guestPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nickname} - {player.full_name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </Select>
      </FormField>
      <FormField label="Time">
        <Select name="teamColor" defaultValue="blue">
          <option value="blue">Azul</option>
          <option value="red">Vermelho</option>
        </Select>
      </FormField>
      <FormField label="Ordem">
        <Input name="lineupOrder" type="number" min="1" placeholder="1" />
      </FormField>
      <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <Checkbox name="isGoalkeeper" />
          Marcar como goleiro
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <Checkbox name="isReserve" />
          Marcar como reserva
        </label>
      </div>
      <div className="md:col-span-2">
        <SubmitButton>Salvar no time</SubmitButton>
      </div>
    </form>
  );
}

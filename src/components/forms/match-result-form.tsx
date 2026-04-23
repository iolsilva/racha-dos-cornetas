"use client";

import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { saveMatchResultAction } from "@/server/actions/admin";

export function MatchResultForm({
  matches,
}: {
  matches: Array<{
    id: string;
    match_date: string;
    location: string;
    status: string;
  }>;
}) {
  const { formAction } = useServerAction(saveMatchResultAction);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <FormField
        label="Partida"
        hint="Se a partida ja existe e precisa de mais ajustes, prefira o bloco de edicao completa logo abaixo."
      >
        <Select
          name="matchId"
          defaultValue=""
          required
        >
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
      <FormField label="Azul">
        <Input name="blueScore" type="number" min="0" defaultValue="0" />
      </FormField>
      <FormField label="Vermelho">
        <Input name="redScore" type="number" min="0" defaultValue="0" />
      </FormField>
      <div className="flex items-end sm:col-span-2">
        <SubmitButton>Salvar</SubmitButton>
      </div>
    </form>
  );
}

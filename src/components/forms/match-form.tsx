"use client";

import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createMatchAction } from "@/server/actions/admin";

export function MatchForm() {
  const { formAction } = useServerAction(createMatchAction);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <FormField label="Data da partida">
        <Input
          name="matchDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </FormField>
      <FormField label="Horario">
        <Input name="startTime" type="time" defaultValue="20:00" />
      </FormField>
      <FormField label="Local" className="md:col-span-2">
        <Input name="location" placeholder="Arena Zona Sul" />
      </FormField>
      <FormField label="Observacoes" className="md:col-span-2">
        <Textarea name="notes" placeholder="Confirmacoes ate 16h, convidar 2 diaristas..." />
      </FormField>
      <div className="md:col-span-2">
        <SubmitButton>Criar partida</SubmitButton>
      </div>
    </form>
  );
}

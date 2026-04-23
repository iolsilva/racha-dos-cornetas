"use client";

import { useState } from "react";

import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createPlayerAction } from "@/server/actions/admin";

export function PlayerForm() {
  const { formAction } = useServerAction(createPlayerAction);
  const [playerType, setPlayerType] = useState<"fixed" | "guest" | "goalkeeper">(
    "fixed",
  );
  const [feeExempt, setFeeExempt] = useState(false);

  const isGoalkeeper = playerType === "goalkeeper";
  const positionValue = isGoalkeeper ? "goalkeeper" : "line";

  function handlePlayerTypeChange(nextType: "fixed" | "guest" | "goalkeeper") {
    setPlayerType(nextType);

    if (nextType === "goalkeeper") {
      setFeeExempt(true);
    }
  }

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <FormField label="Nome completo">
        <Input name="fullName" placeholder="Joao Silva" required />
      </FormField>
      <FormField label="Apelido">
        <Input name="nickname" placeholder="Jota" required />
      </FormField>
      <FormField label="Tipo de jogador">
        <Select
          name="playerType"
          value={playerType}
          onChange={(event) =>
            handlePlayerTypeChange(
              event.target.value as "fixed" | "guest" | "goalkeeper",
            )
          }
        >
          <option value="fixed">Fixo</option>
          <option value="guest">Diarista</option>
          <option value="goalkeeper">Goleiro</option>
        </Select>
      </FormField>
      <FormField label="Posicao">
        <input type="hidden" name="position" value={positionValue} />
        <Select value={positionValue} disabled>
          <option value="line">Linha</option>
          <option value="goalkeeper">Goleiro</option>
        </Select>
      </FormField>
      <p className="text-xs text-slate-500 md:col-span-2">
        O sistema sincroniza automaticamente a posicao com o tipo escolhido para
        manter ranking, financeiro e listas sem inconsistencias.
      </p>
      <FormField label="Telefone" className="md:col-span-2">
        <Input name="phone" placeholder="(11) 99999-9999" />
      </FormField>
      <label className="flex items-center gap-3 text-sm text-slate-300">
        <Checkbox name="active" defaultChecked />
        Jogador ativo no grupo
      </label>
      <label className="flex items-center gap-3 text-sm text-slate-300">
        {isGoalkeeper ? <input type="hidden" name="feeExempt" value="on" /> : null}
        <Checkbox
          name={isGoalkeeper ? undefined : "feeExempt"}
          checked={feeExempt}
          disabled={isGoalkeeper}
          onChange={(event) => setFeeExempt(event.target.checked)}
        />
        {isGoalkeeper ? "Goleiro entra isento automaticamente" : "Isento de mensalidade"}
      </label>
      <div className="md:col-span-2">
        <SubmitButton>Cadastrar jogador</SubmitButton>
      </div>
    </form>
  );
}

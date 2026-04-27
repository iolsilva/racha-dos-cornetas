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
  const [position, setPosition] = useState<"line" | "goalkeeper">("line");
  const [feeExempt, setFeeExempt] = useState(false);

  const positionValue =
    playerType === "goalkeeper" ? "goalkeeper" : playerType === "fixed" ? "line" : position;
  const isLockedPosition = playerType !== "guest";
  const isFixedGoalkeeper = playerType === "goalkeeper";
  const isGuestGoalkeeper = playerType === "guest" && positionValue === "goalkeeper";
  const isForcedExempt = isFixedGoalkeeper || isGuestGoalkeeper;
  const canEditFeeExempt = playerType === "fixed";

  function handlePlayerTypeChange(nextType: "fixed" | "guest" | "goalkeeper") {
    const wasForcedExempt = isForcedExempt;

    setPlayerType(nextType);

    if (nextType === "goalkeeper") {
      setPosition("goalkeeper");
      setFeeExempt(true);
      return;
    }

    if (nextType === "fixed") {
      setPosition("line");
      if (wasForcedExempt) {
        setFeeExempt(false);
      }
      return;
    }

    if (wasForcedExempt && positionValue !== "goalkeeper") {
      setFeeExempt(false);
    }

    if (nextType === "guest") {
      setFeeExempt(false);
    }
  }

  function handlePositionChange(nextPosition: "line" | "goalkeeper") {
    const wasForcedExempt = isForcedExempt;

    setPosition(nextPosition);

    if (playerType === "guest" && nextPosition === "goalkeeper") {
      setFeeExempt(true);
      return;
    }

    if (playerType === "guest" && nextPosition === "line" && wasForcedExempt) {
      setFeeExempt(false);
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
        <Select
          name="position"
          value={positionValue}
          disabled={isLockedPosition}
          onChange={(event) =>
            handlePositionChange(event.target.value as "line" | "goalkeeper")
          }
        >
          <option value="line">Linha</option>
          <option value="goalkeeper">Goleiro</option>
        </Select>
      </FormField>
      <p className="text-xs text-slate-500 md:col-span-2">
        {playerType === "guest"
          ? "Diarista pode entrar como linha ou goleiro. Se ficar como goleiro, o cadastro vira operacional: isento e fora do ranking."
          : "Mensalista fixo fica em linha e goleiro fixo fica na posicao de goleiro para manter ranking, financeiro e listas sem inconsistencias."}
      </p>
      <FormField label="Telefone" className="md:col-span-2">
        <Input name="phone" placeholder="(11) 99999-9999" />
      </FormField>
      <label className="flex items-center gap-3 text-sm text-slate-300">
        <Checkbox name="active" defaultChecked />
        Jogador ativo no grupo
      </label>
      <label className="flex items-center gap-3 text-sm text-slate-300">
        {isForcedExempt ? <input type="hidden" name="feeExempt" value="on" /> : null}
        <Checkbox
          name={canEditFeeExempt ? "feeExempt" : undefined}
          checked={feeExempt}
          disabled={!canEditFeeExempt || isForcedExempt}
          onChange={(event) => setFeeExempt(event.target.checked)}
        />
        {isGuestGoalkeeper
          ? "Goleiro diarista fica isento automaticamente e nao entra em cobrancas ou ranking"
          : isFixedGoalkeeper
            ? "Goleiro fixo entra isento automaticamente"
            : playerType === "guest"
              ? "Diarista de linha entra como pagante da diaria"
              : "Isento de mensalidade"}
      </label>
      <div className="md:col-span-2">
        <SubmitButton>Cadastrar jogador</SubmitButton>
      </div>
    </form>
  );
}

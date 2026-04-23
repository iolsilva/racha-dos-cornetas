"use client";

import { guestMatchFee } from "@/lib/constants";
import { getReferenceMonth } from "@/lib/utils";
import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPaymentAction } from "@/server/actions/admin";

export function PaymentForm({
  players,
  paymentType,
  title,
  submitLabel,
  amountDefaultValue,
  amountHint,
}: {
  players: Array<{
    id: string;
    full_name: string;
    nickname: string;
    fee_exempt?: boolean;
    player_type?: string;
  }>;
  paymentType: "monthly_fee" | "guest_fee" | "adjustment";
  title: string;
  submitLabel: string;
  amountDefaultValue?: number;
  amountHint?: string;
}) {
  const { formAction } = useServerAction(createPaymentAction);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="paymentType" value={paymentType} />
      <div className="md:col-span-2">
        <p className="text-sm font-medium text-white">{title}</p>
        {amountHint ? (
          <p className="mt-1 text-xs text-slate-500">{amountHint}</p>
        ) : null}
      </div>
      <FormField label="Jogador">
        <Select name="playerId" defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.nickname} - {player.full_name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Mes de referencia">
        <Input name="referenceMonth" type="date" defaultValue={getReferenceMonth()} />
      </FormField>
      <FormField label="Data do pagamento">
        <Input
          name="paidAt"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </FormField>
      <FormField label="Valor">
        <Input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder={paymentType === "guest_fee" ? String(guestMatchFee) : "50"}
          defaultValue={amountDefaultValue}
        />
      </FormField>
      <FormField label="Observacoes">
        <Textarea name="notes" placeholder="Pago via Pix, ajuste, diarista..." />
      </FormField>
      <div className="md:col-span-2">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

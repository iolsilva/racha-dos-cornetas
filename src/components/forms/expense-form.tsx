"use client";

import { getReferenceMonth } from "@/lib/utils";
import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createExpenseAction } from "@/server/actions/admin";

export function ExpenseForm() {
  const { formAction } = useServerAction(createExpenseAction);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <FormField label="Mes de referencia">
        <Input name="referenceMonth" type="date" defaultValue={getReferenceMonth()} />
      </FormField>
      <FormField label="Data da despesa">
        <Input
          name="expenseDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </FormField>
      <FormField label="Categoria">
        <Select name="category" defaultValue="field_rent">
          <option value="field_rent">Aluguel do campo</option>
          <option value="barbecue">Churrasco</option>
          <option value="equipment">Equipamento</option>
          <option value="awards">Premiacao</option>
          <option value="other">Outro</option>
        </Select>
      </FormField>
      <FormField label="Valor">
        <Input name="amount" type="number" step="0.01" min="0" placeholder="550" />
      </FormField>
      <FormField label="Descricao" className="md:col-span-2">
        <Textarea name="description" placeholder="Campo society abril, churrasqueira, gelo..." />
      </FormField>
      <label className="flex items-center gap-3 text-sm text-slate-300 md:col-span-2">
        <Checkbox name="reserveForAwards" />
        Marcar como reserva para premiacao
      </label>
      <div className="md:col-span-2">
        <SubmitButton>Registrar despesa</SubmitButton>
      </div>
    </form>
  );
}

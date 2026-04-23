"use client";

import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/server/actions/auth";

export function SignInForm() {
  const { state, formAction } = useServerAction(signInAction);

  return (
    <form action={formAction} className="grid gap-4">
      <FormField label="E-mail" error={!state.success ? state.message : undefined}>
        <Input name="email" type="email" placeholder="voce@racha.com.br" required />
      </FormField>
      <FormField label="Senha">
        <Input name="password" type="password" placeholder="••••••••" required />
      </FormField>
      <SubmitButton className="w-full">Entrar no sistema</SubmitButton>
    </form>
  );
}

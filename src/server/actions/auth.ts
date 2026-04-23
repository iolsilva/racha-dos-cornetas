"use server";

import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation";

import { actionError } from "./helpers";

export async function signInAction(
  _prevState: ActionState,
  formData: FormData,
) {
  try {
    const parsed = signInSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.email,
      password: parsed.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    redirect("/dashboard");
  } catch (error) {
    return actionError(error);
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

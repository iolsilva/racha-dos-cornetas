import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import type { ActionState } from "@/lib/action-state";
import { requireAdmin, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function getActionContext({ adminOnly = false } = {}) {
  if (adminOnly) {
    await requireAdmin();
  } else {
    await requireUser();
  }

  return createClient();
}

export function actionSuccess(message: string): ActionState {
  return { success: true, message };
}

export function actionError(error: unknown): ActionState {
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Confira os campos e tente novamente.";
    return { success: false, message };
  }

  const message =
    error instanceof Error ? error.message : "Nao foi possivel concluir a operacao.";

  return { success: false, message };
}

export function refreshPaths(paths: string[]) {
  Array.from(new Set(paths)).forEach((path) => revalidatePath(path));
}

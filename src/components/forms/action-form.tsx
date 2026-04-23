"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { initialActionState, type ActionState } from "@/lib/action-state";

export function useActionToast(actionState: ActionState) {
  const lastToastKeyRef = useRef("");

  useEffect(() => {
    if (!actionState.message) {
      return;
    }

    const toastKey = `${actionState.success}:${actionState.message}`;

    if (lastToastKeyRef.current === toastKey) {
      return;
    }

    lastToastKeyRef.current = toastKey;

    if (actionState.success) {
      toast.success(actionState.message);
      return;
    }

    toast.error(actionState.message);
  }, [actionState.message, actionState.success]);
}

export function useServerAction<T extends (state: ActionState, formData: FormData) => Promise<ActionState>>(
  action: T,
) {
  const [state, formAction] = useActionState(action, initialActionState);
  useActionToast(state);

  return { state, formAction };
}

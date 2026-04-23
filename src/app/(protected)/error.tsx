"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid gap-6">
      <EmptyState
        title="Nao foi possivel carregar esta area"
        description="Encontramos uma falha ao montar esta pagina protegida. Voce pode tentar novamente sem sair do sistema."
      />
      <div className="flex">
        <Button type="button" onClick={reset}>
          Recarregar esta tela
        </Button>
      </div>
    </div>
  );
}

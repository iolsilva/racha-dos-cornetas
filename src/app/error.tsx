"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function RootError({
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
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg rounded-[32px] border border-white/10 bg-slate-950/80 p-8 text-center backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Falha temporaria
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-white">
          Algo saiu do trilho
        </h1>
        <p className="mt-4 text-sm text-slate-400">
          O sistema encontrou um erro inesperado ao montar esta tela. Tente
          novamente sem recarregar toda a aplicacao.
        </p>
        <div className="mt-6 flex justify-center">
          <Button type="button" onClick={reset}>
            Tentar novamente
          </Button>
        </div>
      </div>
    </main>
  );
}

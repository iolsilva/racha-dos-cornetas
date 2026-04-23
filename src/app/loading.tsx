export default function RootLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/70 px-8 py-6 text-center backdrop-blur">
        <p className="font-display text-4xl uppercase tracking-[0.08em] text-white">
          Carregando
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Preparando o painel do racha...
        </p>
      </div>
    </main>
  );
}

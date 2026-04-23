export function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-amber-400/30 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.45),_rgba(3,7,18,1)_70%)]">
        <div className="absolute inset-2 rounded-xl border border-white/10 bg-slate-950/80" />
        <div className="absolute inset-0 flex items-center justify-center font-display text-xl uppercase tracking-[0.18em] text-amber-300">
          RC
        </div>
      </div>
      <div>
        <p className="font-display text-lg uppercase tracking-[0.18em] text-white">
          Racha dos Cornetas
        </p>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Sistema oficial da temporada
        </p>
      </div>
    </div>
  );
}

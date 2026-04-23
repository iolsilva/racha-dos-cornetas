import type { ReactNode } from "react";

import { signOutAction } from "@/server/actions/auth";

export function SignOutButton({ children }: { children: ReactNode }) {
  return (
    <form action={signOutAction}>
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
        {children}
        <span className="hidden md:inline">Sair</span>
      </button>
    </form>
  );
}

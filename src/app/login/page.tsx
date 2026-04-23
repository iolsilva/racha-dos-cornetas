import { Shield } from "lucide-react";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/forms/sign-in-form";
import { LogoMark } from "@/components/layout/logo-mark";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="mesh-panel hidden rounded-[36px] p-10 lg:block">
          <Badge>Racha dos Cornetas</Badge>
          <h1 className="mt-5 font-display text-6xl uppercase tracking-[0.06em] text-white">
            O sistema oficial para a gestao do racha.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-slate-300">
            Acompanhe financeiro, partidas, times, historico e ranking da
            temporada em uma plataforma pensada para a organizacao do racha.
          </p>
          <div className="mt-8 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3">
              <Shield className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <p className="font-semibold text-white">Acesso ao painel oficial</p>
              <p className="text-sm text-slate-400">
                Conteudo organizado para administradores e jogadores.
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[36px] p-6 md:p-8">
          <div className="mb-8">
            <LogoMark />
            <p className="mt-6 text-sm uppercase tracking-[0.24em] text-slate-500">
              Acesso ao sistema
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Entrar no painel do Racha dos Cornetas
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Use seu e-mail cadastrado para acessar o ambiente oficial da temporada.
            </p>
          </div>
          <SignInForm />
        </Card>
      </div>
    </main>
  );
}

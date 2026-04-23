import Link from "next/link";
import { ArrowRight, Calendar, CreditCard, Trophy, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { LogoMark } from "@/components/layout/logo-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import { fieldMonthlyRent, guestMatchFee, monthlyFeeRules } from "@/lib/constants";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex items-center justify-between rounded-[32px] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur">
          <LogoMark />
          <Link href="/login">
            <Button>Acessar sistema</Button>
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <Card className="mesh-panel rounded-[36px] px-6 py-8 md:px-10 md:py-12">
            <Badge>Plataforma oficial</Badge>
            <h1 className="mt-5 max-w-4xl font-display text-5xl uppercase leading-none tracking-[0.05em] text-white md:text-7xl">
              Racha dos Cornetas: gestao completa do financeiro, das partidas e do ranking.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
              Um ambiente unico para organizar a temporada, registrar pagamentos,
              acompanhar cada rodada e manter o historico do racha com mais
              clareza, controle e confianca.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg">
                  Entrar no painel oficial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="secondary" type="button">
                Controle financeiro, partidas e ranking
              </Button>
            </div>
          </Card>

          <div className="grid gap-6">
            <Card>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Estrutura financeira
              </p>
              <div className="mt-4 space-y-3">
                {monthlyFeeRules.map((rule) => (
                  <div
                    key={rule.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">{rule.label}</span>
                    <span className="font-semibold text-white">R$ {rule.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                Diaristas contribuem por partida e o caixa acompanha a operacao
                mensal do racha. Referencia atual: diarista R$ {guestMatchFee} por
                jogo e aluguel base de R$ {fieldMonthlyRent}.
              </div>
            </Card>
            <Card className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Users, label: "Elenco, mensalistas e diaristas" },
                { icon: CreditCard, label: "Caixa, despesas e reserva" },
                { icon: Calendar, label: "Rodadas, confirmacoes e times" },
                { icon: Trophy, label: "Ranking e historico da temporada" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <item.icon className="h-5 w-5 text-amber-300" />
                  <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
                </div>
              ))}
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

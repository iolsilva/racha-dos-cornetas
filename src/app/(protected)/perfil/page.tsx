import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentProfile } from "@/lib/auth";
import {
  formatPlayerTypeLabel,
  formatPositionLabel,
  formatRoleLabel,
} from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: player, error } = await supabase
    .from("players")
    .select("full_name, nickname, player_type, position, phone, fee_exempt")
    .eq("profile_id", profile?.user_id ?? "")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Perfil"
        title="Meu cadastro"
        description="Resumo do vinculo com o racha, tipo de participante e configuracao financeira."
      />

      <Card className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Conta
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {profile?.full_name || "Sem nome"}
          </p>
          <p className="mt-1 text-sm text-slate-400">{profile?.email}</p>
          <p className="mt-1 text-sm text-slate-400">
            Perfil: {formatRoleLabel(profile?.role)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Jogador
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {player?.nickname ?? "Nao vinculado"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Tipo: {formatPlayerTypeLabel(player?.player_type)} | Posicao:{" "}
            {formatPositionLabel(player?.position)}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Isento: {player?.fee_exempt ? "Sim" : "Nao"}
          </p>
        </div>
      </Card>
    </div>
  );
}

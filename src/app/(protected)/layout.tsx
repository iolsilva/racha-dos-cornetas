import { AppShell } from "@/components/layout/app-shell";
import { requireProfile } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return (
    <AppShell
      role={profile.role}
      userName={profile.full_name || profile.email || "Jogador"}
    >
      {children}
    </AppShell>
  );
}

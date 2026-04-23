import { Bell, LogOut } from "lucide-react";

import { AppNavLink } from "@/components/layout/app-nav-link";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatRoleLabel } from "@/lib/labels";

export function Topbar({
  role,
  userName,
}: {
  role: "admin" | "player";
  userName: string;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/5 bg-slate-950/70 px-4 py-4 backdrop-blur md:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Bem-vindo
        </p>
        <h1 className="text-lg font-semibold text-white">{userName}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="hidden md:inline-flex">{formatRoleLabel(role)}</Badge>
        <Button variant="secondary" size="icon" type="button">
          <Bell className="h-4 w-4" />
        </Button>
        <AppNavLink
          href="/perfil"
          className={`hidden md:inline-flex ${buttonVariants({ variant: "secondary" })}`}
        >
          Meu perfil
        </AppNavLink>
        <SignOutButton>
          <LogOut className="h-4 w-4" />
        </SignOutButton>
      </div>
    </div>
  );
}

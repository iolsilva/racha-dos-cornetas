import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Medal,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const appName = "Racha dos Cornetas";

export const monthlyFeeRules = [
  { label: "Ate o dia 15", amount: 50 },
  { label: "Do dia 16 ao 20", amount: 60 },
  { label: "A partir do dia 21", amount: 70 },
] as const;

export const guestMatchFee = 15;
export const fieldMonthlyRent = 550;

export const playerNavItems = [
  { href: "/dashboard", label: "Resumo", icon: LayoutDashboard },
  { href: "/financeiro", label: "Financeiro", icon: CreditCard },
  { href: "/jogos", label: "Jogos", icon: CalendarDays },
  { href: "/ranking", label: "Ranking", icon: Medal },
  { href: "/perfil", label: "Perfil", icon: Users },
] as const;

export const adminNavItems = [
  { href: "/admin", label: "Painel administrativo", icon: ShieldCheck },
  { href: "/admin/jogadores", label: "Jogadores", icon: Users },
  { href: "/admin/financeiro", label: "Financeiro", icon: CreditCard },
  { href: "/admin/partidas", label: "Partidas", icon: Settings },
] as const;

export const teamColors = {
  blue: {
    label: "Azul",
    classes: "border-sky-400/30 bg-sky-500/10 text-sky-100",
  },
  red: {
    label: "Vermelho",
    classes: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  },
} as const;

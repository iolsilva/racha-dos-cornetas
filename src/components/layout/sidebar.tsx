"use client";

import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { AppNavLink } from "@/components/layout/app-nav-link";
import { adminNavItems, playerNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function NavLink({
  item,
  pathname,
}: {
  item: Item;
  pathname: string;
}) {
  const Icon = item.icon;
  const active = pathname === item.href;

  return (
    <AppNavLink
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-amber-400 text-slate-950 shadow-[0_10px_28px_rgba(250,204,21,0.25)]"
          : "text-slate-300 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </AppNavLink>
  );
}

export function SidebarContent({ role }: { role: "admin" | "player" }) {
  const pathname = usePathname();
  const items = role === "admin" ? [...playerNavItems, ...adminNavItems] : playerNavItems;

  return (
    <nav className="grid gap-2">
      {items.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
    </nav>
  );
}

export function Sidebar({ role }: { role: "admin" | "player" }) {
  return <SidebarContent role={role} />;
}

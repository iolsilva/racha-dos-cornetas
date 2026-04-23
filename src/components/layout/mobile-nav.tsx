"use client";

import { usePathname } from "next/navigation";

import { AppNavLink } from "@/components/layout/app-nav-link";
import { adminNavItems, playerNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNav({ role }: { role: "admin" | "player" }) {
  const pathname = usePathname();
  const items = role === "admin" ? [...playerNavItems, adminNavItems[0]] : playerNavItems;

  return (
    <div className="fixed inset-x-4 bottom-4 z-30 grid grid-cols-5 rounded-[28px] border border-white/10 bg-slate-950/90 p-2 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <AppNavLink
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium",
              active ? "bg-amber-400 text-slate-950" : "text-slate-400",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{item.label}</span>
          </AppNavLink>
        );
      })}
    </div>
  );
}

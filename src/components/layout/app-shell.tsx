"use client";

import type { ReactNode } from "react";

import { LogoMark } from "@/components/layout/logo-mark";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({
  role,
  userName,
  children,
}: {
  role: "admin" | "player";
  userName: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_rgba(2,6,23,0)_25%),linear-gradient(180deg,#020617_0%,#020617_45%,#0b1120_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <div className="hidden lg:flex lg:w-80 lg:flex-col lg:gap-8 lg:border-r lg:border-white/5 lg:bg-black/20 lg:px-5 lg:py-8">
          <LogoMark />
          <Sidebar role={role} />
        </div>
        <div className="flex min-h-screen flex-1 flex-col">
          <div className="border-b border-white/5 px-4 py-4 lg:hidden">
            <LogoMark />
          </div>
          <Topbar role={role} userName={userName} />
          <main className="flex-1 px-4 py-6 pb-28 md:px-8 md:py-8 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
      <MobileNav role={role} />
    </div>
  );
}

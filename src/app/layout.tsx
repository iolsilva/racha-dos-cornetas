import type { Metadata } from "next";
import { Toaster } from "sonner";

import { appName } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: appName,
  description:
    "Sistema oficial do Racha dos Cornetas com financeiro, partidas, historico e ranking da temporada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

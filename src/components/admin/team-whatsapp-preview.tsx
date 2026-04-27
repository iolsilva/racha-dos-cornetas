"use client";

import { X, Copy, Printer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { teamColors } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PreviewEntry = {
  label: string;
  nickname: string;
  fullName: string;
  marker: "D" | "GD" | null;
};

type MatchRow = {
  match_date: string;
  location: string;
};

function renderEntryText(entry?: PreviewEntry) {
  if (!entry) {
    return "—";
  }

  return `${entry.label} - ${entry.nickname}${entry.marker ? ` (${entry.marker})` : ""}`;
}

export function TeamWhatsappPreview({
  open,
  onClose,
  onCopyText,
  onPrint,
  match,
  blueEntries,
  redEntries,
}: {
  open: boolean;
  onClose: () => void;
  onCopyText: () => void;
  onPrint: () => void;
  match: MatchRow | null;
  blueEntries: PreviewEntry[];
  redEntries: PreviewEntry[];
}) {
  if (!open || !match) {
    return null;
  }

  const rowCount = Math.max(blueEntries.length, redEntries.length);
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    blue: blueEntries[index],
    red: redEntries[index],
  }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm print:bg-white">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-5xl rounded-[32px] border border-white/10 bg-[#050816] shadow-[0_28px_80px_rgba(15,23,42,0.6)] print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 print:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Visualizacao para WhatsApp
              </p>
              <p className="mt-1 text-sm text-slate-300">
                A area abaixo fica limpa para print, sem menu da edicao.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={onCopyText}>
                <Copy className="h-4 w-4" />
                Copiar texto
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={onPrint}>
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6 print:p-0">
            <div className="rounded-[28px] bg-[linear-gradient(180deg,#fbfcff_0%,#eef4ff_100%)] p-4 text-slate-950 sm:p-6 print:rounded-none print:bg-white">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Racha dos Cornetas
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      Times da rodada
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {formatDate(match.match_date)} • {match.location}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <Badge className="border-slate-300 bg-white text-slate-700">
                      Print pronto para WhatsApp
                    </Badge>
                    <Badge className="border-slate-300 bg-white text-slate-700">
                      D = Diarista
                    </Badge>
                    <Badge className="border-slate-300 bg-white text-slate-700">
                      GD = Goleiro diarista
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                <div className="grid grid-cols-2 border-b border-slate-200">
                  <div className="border-r border-slate-200 bg-cyan-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      Time {teamColors.blue.label}
                    </p>
                  </div>
                  <div className="bg-rose-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
                      Time {teamColors.red.label}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-200">
                  {rows.map((row, index) => (
                    <div key={`${row.blue?.label ?? "blue"}-${row.red?.label ?? "red"}-${index}`} className="grid grid-cols-2">
                      <div className="border-r border-slate-200 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="min-w-0 truncate text-sm font-semibold text-slate-900">
                            {renderEntryText(row.blue)}
                          </span>
                          {row.blue?.marker ? (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                                row.blue.marker === "GD"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : "bg-slate-200 text-slate-700",
                              )}
                            >
                              {row.blue.marker}
                            </span>
                          ) : null}
                        </div>
                        {row.blue ? (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {row.blue.fullName}
                          </p>
                        ) : null}
                      </div>
                      <div className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="min-w-0 truncate text-sm font-semibold text-slate-900">
                            {renderEntryText(row.red)}
                          </span>
                          {row.red?.marker ? (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                                row.red.marker === "GD"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-slate-200 text-slate-700",
                              )}
                            >
                              {row.red.marker}
                            </span>
                          ) : null}
                        </div>
                        {row.red ? (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {row.red.fullName}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-center text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Montagem oficial da rodada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

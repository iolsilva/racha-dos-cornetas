"use client";

import { Copy, Printer, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { teamColors } from "@/lib/constants";
import { formatDate } from "@/lib/format";
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

function isLineEntry(entry: PreviewEntry | undefined) {
  return Boolean(entry?.label.startsWith("Linha "));
}

function renderEntryText(entry?: PreviewEntry) {
  if (!entry) {
    return "-";
  }

  if (isLineEntry(entry)) {
    return `${entry.nickname}${entry.marker ? ` (${entry.marker})` : ""}`;
  }

  return `${entry.label} - ${entry.nickname}${entry.marker ? ` (${entry.marker})` : ""}`;
}

function MarkerPill({
  marker,
  tone,
}: {
  marker: "D" | "GD";
  tone: "blue" | "red";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]",
        marker === "GD"
          ? tone === "blue"
            ? "bg-cyan-100 text-cyan-800"
            : "bg-rose-100 text-rose-800"
          : "bg-slate-200 text-slate-700",
      )}
    >
      {marker}
    </span>
  );
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
        <div className="w-full max-w-4xl rounded-[30px] border border-white/10 bg-[#050816] shadow-[0_28px_80px_rgba(15,23,42,0.6)] print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 print:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Visualizacao para WhatsApp
              </p>
              <p className="mt-1 text-xs text-slate-300">
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

          <div className="p-3 sm:p-4 print:p-0">
            <div className="rounded-[26px] bg-[linear-gradient(180deg,#fbfcff_0%,#f4f7ff_100%)] p-4 text-slate-950 sm:p-5 print:rounded-none print:bg-white">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Racha dos Cornetas
                    </p>
                    <h3 className="mt-1.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                      Times da rodada
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                      {formatDate(match.match_date)} - {match.location}
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    D = Diarista | GD = Goleiro diarista
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <div className="grid grid-cols-2 border-b border-slate-200">
                  <div className="border-r border-slate-200 bg-cyan-50/80 px-3 py-2.5 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      Time {teamColors.blue.label}
                    </p>
                  </div>
                  <div className="bg-rose-50/80 px-3 py-2.5 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-700">
                      Time {teamColors.red.label}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-200">
                  {rows.map((row, index) => (
                    <div
                      key={`${row.blue?.label ?? "blue"}-${row.red?.label ?? "red"}-${index}`}
                      className="grid grid-cols-2"
                    >
                      <div className="border-r border-slate-200 px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="min-w-0 truncate text-sm font-semibold text-slate-900">
                            {renderEntryText(row.blue)}
                          </span>
                          {row.blue?.marker && !isLineEntry(row.blue) ? (
                            <MarkerPill marker={row.blue.marker} tone="blue" />
                          ) : null}
                        </div>
                      </div>
                      <div className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="min-w-0 truncate text-sm font-semibold text-slate-900">
                            {renderEntryText(row.red)}
                          </span>
                          {row.red?.marker && !isLineEntry(row.red) ? (
                            <MarkerPill marker={row.red.marker} tone="red" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Montagem oficial da rodada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

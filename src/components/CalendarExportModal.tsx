"use client";

import { useState } from "react";
import type { Deadline, Reference } from "@/lib/schema";
import { useLanguageContext } from "@/context/LanguageContext";
import { generateIcs, downloadIcs } from "@/lib/icsGenerator";

interface Props {
  deadlines: Deadline[];
  localizedDescriptions: { id: number; description: string }[];
  references: Reference[];
  documentType: string;
  onClose: () => void;
}

export default function CalendarExportModal({
  deadlines,
  localizedDescriptions,
  references,
  documentType,
  onClose,
}: Props) {
  const { t } = useLanguageContext();

  // Inicializa com as datas já convertidas (ou string vazia se null)
  const [dates, setDates] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    deadlines.forEach((d) => {
      init[d.id] = d.dateIso ?? "";
    });
    return init;
  });

  const allFilled = deadlines.every((d) => dates[d.id]?.trim() !== "");

  const handleExport = () => {
    const entries = deadlines.map((d) => {
      const ref = references.find((r) => r.id === d.referenceId);
      const loc = localizedDescriptions.find((l) => l.id === d.id);
      return {
        deadline: d,
        confirmedDateIso: dates[d.id],
        referenceText: ref?.japaneseText,
        title: loc?.description ?? d.description,
      };
    });
    const ics = generateIcs(entries, `Paper Lantern — ${documentType}`);
    downloadIcs(ics, "paper-lantern-prazos");
    onClose();
  };

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cal-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-[#fdf8ef] rounded-2xl shadow-2xl border border-amber-200/60 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-800 px-5 py-4 flex items-center justify-between">
          <h2 id="cal-modal-title" className="text-amber-50 font-semibold text-base">
            {t("calendar.modalTitle")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("calendar.cancel")}
            className="text-amber-200 hover:text-white transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-amber-800/70 mb-4">{t("calendar.modalDescription")}</p>

          <ul className="space-y-4">
            {deadlines.map((d) => {
              const loc = localizedDescriptions.find((l) => l.id === d.id);
              const isUncertain = !d.dateIso;
              return (
                <li key={d.id} className="space-y-1.5">
                  <label
                    htmlFor={`date-${d.id}`}
                    className="block text-sm font-medium text-neutral-800"
                  >
                    {loc?.description ?? d.description}
                  </label>
                  {/* Data original do documento */}
                  <p className="text-xs text-amber-700/60 font-mono" lang="ja">
                    {d.dateRaw}
                  </p>
                  <input
                    id={`date-${d.id}`}
                    type="date"
                    value={dates[d.id] ?? ""}
                    onChange={(e) =>
                      setDates((prev) => ({ ...prev, [d.id]: e.target.value }))
                    }
                    className={`
                      w-full rounded-lg border px-3 py-2 text-sm bg-white
                      focus:outline-none focus:ring-2 focus:ring-amber-500
                      ${
                        isUncertain && !dates[d.id]
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-amber-200"
                      }
                    `}
                    aria-describedby={isUncertain ? `date-hint-${d.id}` : undefined}
                  />
                  {isUncertain && !dates[d.id] && (
                    <p id={`date-hint-${d.id}`} className="text-xs text-yellow-700">
                      {t("calendar.dateUncertain")}
                    </p>
                  )}
                  <p className="text-xs text-neutral-400">{t("calendar.allDay")}</p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-amber-50/50 border-t border-amber-200/40 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-amber-800 rounded-lg hover:bg-amber-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {t("calendar.cancel")}
          </button>
          <button
            onClick={handleExport}
            disabled={!allFilled}
            className={`
              px-4 py-2 text-sm font-semibold rounded-lg transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
              ${
                allFilled
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-amber-200 text-amber-400 cursor-not-allowed"
              }
            `}
            aria-disabled={!allFilled}
          >
            {t("calendar.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

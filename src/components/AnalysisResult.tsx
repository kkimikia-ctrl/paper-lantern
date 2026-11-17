"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/schema";
import { useLanguageContext } from "@/context/LanguageContext";
import ReferenceList from "./ReferenceList";
import ActionChecklist from "./ActionChecklist";
import CalendarExportModal from "./CalendarExportModal";

interface Props {
  result: AnalysisResult;
  isDemo?: boolean;
}

export default function AnalysisResultView({ result, isDemo = false }: Props) {
  const { language, t } = useLanguageContext();
  const [showCalModal, setShowCalModal] = useState(false);

  // Conteúdo localizado — sem nova chamada à API
  const loc = result.translations[language];
  const hasDeadlines = result.deadlines.length > 0;
  const disclaimerKey = isDemo ? "analysis.aiDisclaimerDemo" : "analysis.aiDisclaimer";

  return (
    <article className="w-full max-w-xl mx-auto space-y-1 pb-12">
      {/* Tipo e resumo */}
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700/60 mb-1">
          {t("analysis.documentType")}
        </p>
        <h2 className="text-xl font-bold text-amber-900 leading-tight">
          {loc.documentType}
        </h2>
        <p className="mt-3 text-sm text-neutral-700 leading-relaxed">
          {loc.summary}
        </p>
      </header>

      {/* Prazos */}
      <Section title={t("analysis.deadlines")} empty={!hasDeadlines} emptyMsg={t("analysis.noDeadlines")}>
        <ul className="space-y-2">
          {result.deadlines.map((d) => {
            const locD = loc.deadlines.find((l) => l.id === d.id);
            return (
              <li
                key={d.id}
                className="flex gap-3 items-start rounded-xl bg-amber-50 border border-amber-200/60 px-4 py-3"
              >
                <span className="text-amber-600 mt-0.5" aria-hidden="true">📅</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">
                    {locD?.description ?? d.description}
                  </p>
                  <p className="text-xs text-amber-700/60 font-mono mt-0.5" lang="ja">
                    {d.dateRaw}
                  </p>
                </div>
                <RefBadge refId={d.referenceId} />
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Valores */}
      <Section
        title={t("analysis.amounts")}
        empty={result.amounts.length === 0}
        emptyMsg={t("analysis.noAmounts")}
      >
        <ul className="space-y-2">
          {result.amounts.map((a) => {
            const locA = loc.amounts.find((l) => l.id === a.id);
            return (
              <li
                key={a.id}
                className="flex gap-3 items-center rounded-xl bg-green-50 border border-green-200/60 px-4 py-3"
              >
                <span className="text-green-600" aria-hidden="true">💴</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">
                    {locA?.description ?? a.description}
                  </p>
                  <p className="text-xs text-green-700/60 font-mono mt-0.5" lang="ja">
                    {a.valueRaw}
                  </p>
                </div>
                <RefBadge refId={a.referenceId} />
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Ações / Checklist */}
      <ActionChecklist
        actions={loc.actions}
        referenceIds={result.actions.map((a) => a.referenceId)}
      />

      {/* Referências */}
      <ReferenceList
        references={result.references}
        localizedTranslations={loc.references}
        isDemo={isDemo}
      />

      {/* Aviso */}
      <p className="mt-6 text-xs text-amber-700/60 italic border-t border-amber-200/40 pt-4">
        ⚠ {t(disclaimerKey)}
      </p>

      {/* Exportar para calendário */}
      <div className="mt-6">
        {hasDeadlines ? (
          <button
            onClick={() => setShowCalModal(true)}
            className="
              w-full flex items-center justify-center gap-2
              bg-amber-700 hover:bg-amber-800 text-amber-50
              font-semibold text-sm rounded-xl px-5 py-3
              transition-colors focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2
            "
          >
            <span aria-hidden="true">📆</span>
            {t("calendar.exportButton")}
          </button>
        ) : (
          <div className="relative group w-full">
            <button
              disabled
              aria-disabled="true"
              className="w-full flex items-center justify-center gap-2 bg-amber-100 text-amber-400 font-semibold text-sm rounded-xl px-5 py-3 cursor-not-allowed"
            >
              <span aria-hidden="true">📆</span>
              {t("calendar.exportButton")}
            </button>
            <span
              role="tooltip"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block
                         text-xs bg-neutral-800 text-white px-3 py-1.5 rounded-lg whitespace-nowrap"
            >
              {t("calendar.exportButtonDisabled")}
            </span>
          </div>
        )}
      </div>

      {/* Modal de confirmação */}
      {showCalModal && (
        <CalendarExportModal
          deadlines={result.deadlines}
          localizedDescriptions={loc.deadlines}
          references={result.references}
          documentType={loc.documentType}
          onClose={() => setShowCalModal(false)}
        />
      )}
    </article>
  );
}

/* Sub-componentes internos */

function Section({
  title,
  empty,
  emptyMsg,
  children,
}: {
  title: string;
  empty: boolean;
  emptyMsg: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-800/60 mb-3">
        {title}
      </h3>
      {empty ? (
        <p className="text-sm text-neutral-400 italic">{emptyMsg}</p>
      ) : (
        children
      )}
    </section>
  );
}

function RefBadge({ refId }: { refId: number }) {
  return (
    <a
      href={`#ref-${refId}`}
      className="
        flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 border border-amber-300
        text-amber-700 text-xs font-mono font-bold
        flex items-center justify-center hover:bg-amber-200 transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
      "
      aria-label={`Ver referência ${refId}`}
    >
      {refId}
    </a>
  );
}

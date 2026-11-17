"use client";

import type { Reference } from "@/lib/schema";
import { useLanguageContext } from "@/context/LanguageContext";

interface LocalizedRef {
  id: number;
  translation: string;
}

interface Props {
  references: Reference[];
  /** Traduções das referências no idioma activo, vindas de translations[lang].references */
  localizedTranslations?: LocalizedRef[];
  isDemo?: boolean;
}

export default function ReferenceList({
  references,
  localizedTranslations,
  isDemo = false,
}: Props) {
  const { t } = useLanguageContext();

  if (references.length === 0) return null;

  const warningKey = isDemo
    ? "analysis.referencesWarningDemo"
    : "analysis.referencesWarning";

  return (
    <section aria-labelledby="references-heading" className="mt-6">
      <h3
        id="references-heading"
        className="text-xs font-semibold uppercase tracking-widest text-amber-800/60 mb-2"
      >
        {t("analysis.references")}
      </h3>
      <p className="text-xs text-amber-700/70 mb-3 italic">
        {t(warningKey)}
      </p>
      <ol className="space-y-2">
        {references.map((ref) => {
          const locRef = localizedTranslations?.find((r) => r.id === ref.id);
          return (
            <li
              key={ref.id}
              id={`ref-${ref.id}`}
              className="flex gap-3 items-start rounded-lg bg-amber-50/60 border border-amber-200/60 px-3 py-2.5"
            >
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-700 text-amber-50
                           text-xs font-bold flex items-center justify-center mt-0.5"
                aria-label={`Referência ${ref.id}`}
              >
                {ref.id}
              </span>
              <div className="flex-1 min-w-0">
                {/* Texto japonês original */}
                <p
                  lang="ja"
                  className="font-medium text-sm text-neutral-800 break-words leading-relaxed"
                >
                  {ref.japaneseText}
                </p>
                {/* Tradução no idioma selecionado */}
                {locRef?.translation && (
                  <p className="mt-1 text-xs text-amber-800/70 leading-relaxed">
                    {locRef.translation}
                  </p>
                )}
                {/* Badge de confiança */}
                {ref.confidence !== "ok" && (
                  <span
                    className={`
                      inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium
                      ${
                        ref.confidence === "illegible"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                  >
                    {ref.confidence === "illegible" ? "⚠ " : "~ "}
                    {ref.confidence === "illegible"
                      ? t("analysis.illegibleChip")
                      : t("analysis.lowConfidenceChip")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

"use client";

import { useLanguageContext } from "@/context/LanguageContext";
import type { Language } from "@/lib/schema";

const OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: "pt", label: "Português", flag: "🇧🇷" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "tl", label: "Filipino", flag: "🇵🇭" },
];

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguageContext();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-amber-800/70 uppercase tracking-wider">
        {t("home.languageLabel")}
      </label>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLanguage(opt.value)}
            aria-pressed={language === opt.value}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-150 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1
              ${
                language === opt.value
                  ? "bg-amber-700 text-amber-50 shadow-sm"
                  : "bg-amber-100/60 text-amber-800 hover:bg-amber-200/80"
              }
            `}
          >
            <span aria-hidden="true">{opt.flag}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

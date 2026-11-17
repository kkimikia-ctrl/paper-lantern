"use client";

import { useLanguageContext } from "@/context/LanguageContext";

export default function DemoBanner() {
  const { t } = useLanguageContext();
  return (
    <div
      role="status"
      aria-live="polite"
      className="
        w-full bg-amber-400 text-amber-950 text-center
        font-bold text-sm py-2 px-4 tracking-wide
        border-b-2 border-amber-600
      "
    >
      {t("demo.banner")}
    </div>
  );
}

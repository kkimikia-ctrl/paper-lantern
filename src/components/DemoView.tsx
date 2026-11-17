"use client";

import { useState } from "react";
import { DEMO_DOCUMENTS } from "@/lib/demoData";
import { useLanguageContext } from "@/context/LanguageContext";
import DemoBanner from "./DemoBanner";
import AnalysisResultView from "./AnalysisResult";
import LanguageSelector from "./LanguageSelector";

interface Props {
  onExit: () => void;
}

export default function DemoView({ onExit }: Props) {
  const { t } = useLanguageContext();
  const [selectedId, setSelectedId] = useState(DEMO_DOCUMENTS[0].id);

  const doc = DEMO_DOCUMENTS.find((d) => d.id === selectedId) ?? DEMO_DOCUMENTS[0];

  return (
    <div className="min-h-screen bg-[#1a0e05] flex flex-col">
      {/* Banner de demo sempre visível no topo */}
      <DemoBanner />

      {/* Cabeçalho */}
      <header className="px-4 pt-5 pb-3 flex items-center justify-between max-w-xl mx-auto w-full">
        <div className="flex items-center gap-2">
          {/* Ícone de lanterna */}
          <span className="text-2xl" aria-hidden="true">🏮</span>
          <span className="text-amber-200 font-bold text-lg tracking-tight">Paper Lantern</span>
        </div>
        <button
          onClick={onExit}
          className="
            text-sm text-amber-400 hover:text-amber-200 underline underline-offset-2
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded
          "
        >
          ← {t("demo.exitDemo")}
        </button>
      </header>

      {/* Seletor de idioma */}
      <div className="px-4 pb-3 max-w-xl mx-auto w-full">
        <LanguageSelector />
      </div>

      {/* Seletor de documento demo */}
      <div className="px-4 pb-4 max-w-xl mx-auto w-full">
        <label className="text-xs font-medium text-amber-700/70 uppercase tracking-wider block mb-2">
          {t("demo.selectLabel")}
        </label>
        <div className="flex flex-wrap gap-2">
          {DEMO_DOCUMENTS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedId(d.id)}
              aria-pressed={selectedId === d.id}
              className={`
                text-sm px-3 py-1.5 rounded-full border transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                ${
                  selectedId === d.id
                    ? "bg-amber-600 border-amber-500 text-white font-semibold"
                    : "bg-amber-950/60 border-amber-800/50 text-amber-300 hover:bg-amber-900/60"
                }
              `}
            >
              {t(d.nameKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Documento + resultado */}
      <main className="flex-1 px-4 max-w-xl mx-auto w-full">
        {/* "Papel iluminado" — SVG do documento fictício */}
        <div className="relative mb-6">
          {/* Efeito de glow de lanterna */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            aria-hidden="true"
            style={{
              boxShadow: "0 0 60px 10px rgba(255, 180, 60, 0.18), 0 0 120px 30px rgba(255, 140, 20, 0.08)",
            }}
          />
          <div
            className="rounded-2xl overflow-hidden border border-amber-700/30 shadow-2xl"
            role="img"
            aria-label={`Imagem do documento fictício: ${t(doc.nameKey)}`}
            dangerouslySetInnerHTML={{ __html: doc.placeholderSvg }}
          />
        </div>

        {/* Resultado da análise */}
        <div className="bg-[#fdf8ef] rounded-2xl border border-amber-200/40 shadow-xl px-5 py-6 mb-8">
          <AnalysisResultView result={doc.result} isDemo={true} />
        </div>
      </main>
    </div>
  );
}

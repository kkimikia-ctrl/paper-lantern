"use client";

import { useLanguageContext } from "@/context/LanguageContext";
import LanguageSelector from "./LanguageSelector";

interface Props {
  onStartDemo: () => void;
  onStartUpload: () => void;
}

export default function HomeView({ onStartDemo, onStartUpload }: Props) {
  const { t } = useLanguageContext();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #2a1505 0%, #120900 60%, #0a0500 100%)" }}
    >
      {/* Glow de lanterna ao fundo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(circle, rgba(255,160,30,0.18) 0%, rgba(255,100,10,0.07) 50%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Lanterna SVG decorativa */}
      <div className="mb-6 relative" aria-hidden="true">
        <svg
          viewBox="0 0 80 120"
          className="w-20 h-28 drop-shadow-[0_0_24px_rgba(255,160,30,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cabo superior */}
          <rect x="34" y="0" width="12" height="10" rx="3" fill="#b45309" />
          {/* Topo da lanterna */}
          <path d="M18 18 Q40 10 62 18 L66 28 H14 Z" fill="#92400e" />
          {/* Corpo — papel translúcido iluminado */}
          <rect x="14" y="28" width="52" height="60" rx="4" fill="url(#glow)" />
          {/* Grade da lanterna */}
          <line x1="14" y1="48" x2="66" y2="48" stroke="#b45309" strokeWidth="1.2" opacity="0.6" />
          <line x1="14" y1="68" x2="66" y2="68" stroke="#b45309" strokeWidth="1.2" opacity="0.6" />
          <line x1="32" y1="28" x2="32" y2="88" stroke="#b45309" strokeWidth="1.2" opacity="0.6" />
          <line x1="48" y1="28" x2="48" y2="88" stroke="#b45309" strokeWidth="1.2" opacity="0.6" />
          {/* Bordas */}
          <rect x="14" y="28" width="52" height="60" rx="4" fill="none" stroke="#92400e" strokeWidth="2" />
          {/* Fundo da lanterna */}
          <path d="M14 88 L18 102 Q40 110 62 102 L66 88 Z" fill="#92400e" />
          {/* Franja */}
          {[0, 8, 16, 24, 32, 40, 48].map((x) => (
            <line key={x} x1={18 + x} y1="102" x2={16 + x} y2="112" stroke="#b45309" strokeWidth="1.5" />
          ))}
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#fde68a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
            </radialGradient>
          </defs>
        </svg>
        {/* Reflexo no chão */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(255,160,30,0.3) 0%, transparent 70%)" }}
        />
      </div>

      {/* Título */}
      <h1 className="text-3xl font-bold text-amber-100 tracking-tight text-center mb-2">
        Paper Lantern
      </h1>
      <p className="text-amber-400/80 text-sm text-center max-w-xs mb-8 leading-relaxed">
        {t("home.subtitle")}
      </p>

      {/* Seletor de idioma */}
      <div className="mb-8 w-full max-w-xs flex justify-center">
        <LanguageSelector />
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {/* A foto só é enviada após pré-visualização e confirmação. */}
        <div className="relative group">
          <button
            onClick={onStartUpload}
            className="
              w-full flex items-center justify-center gap-2
              bg-amber-800/40 text-amber-500 border border-amber-700/40
              font-semibold text-sm rounded-xl px-5 py-3.5
              hover:bg-amber-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
            "
          >
            <span aria-hidden="true">📷</span>
            {t("home.uploadButton")}
          </button>
        </div>

        {/* Demo */}
        <button
          onClick={onStartDemo}
          className="
            w-full flex items-center justify-center gap-2
            bg-amber-600 hover:bg-amber-500 text-white
            font-semibold text-sm rounded-xl px-5 py-3.5
            transition-colors shadow-lg shadow-amber-900/40
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-amber-400 focus-visible:ring-offset-2
            focus-visible:ring-offset-[#120900]
          "
        >
          <span aria-hidden="true">🏮</span>
          {t("home.demoButton")}
        </button>
      </div>

      {/* Rodapé */}
      <p className="mt-10 text-xs text-amber-900/50 text-center">
        Kiroween 2026
      </p>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Language } from "@/lib/schema";
import { interpolate } from "@/hooks/useLanguage";

import pt from "@/i18n/pt.json";
import en from "@/i18n/en.json";
import tl from "@/i18n/tl.json";

const dictionaries = { pt, en, tl } as const;
type Dictionary = typeof pt;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt");
  const dict: Dictionary = dictionaries[language];

  const t = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      const parts = key.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let node: any = dict;
      for (const part of parts) {
        if (node == null || typeof node !== "object") return key;
        node = node[part];
      }
      if (typeof node !== "string") return key;
      return values ? interpolate(node, values) : node;
    },
    [dict]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dict }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguageContext must be used inside LanguageProvider");
  return ctx;
}

"use client";

import { useState, useCallback } from "react";
import type { Language } from "@/lib/schema";

import pt from "@/i18n/pt.json";
import en from "@/i18n/en.json";
import tl from "@/i18n/tl.json";

// ---------------------------------------------------------------------------
// Dicionários
// ---------------------------------------------------------------------------

const dictionaries = { pt, en, tl } as const;

type Dictionary = typeof pt;

// ---------------------------------------------------------------------------
// Interpolação simples: substitui {chave} pelos valores fornecidos
// ---------------------------------------------------------------------------

export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in values ? String(values[key]) : `{${key}}`
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLanguage(initial: Language = "pt") {
  const [language, setLanguage] = useState<Language>(initial);

  const dict: Dictionary = dictionaries[language];

  /**
   * Acessa uma chave aninhada com notação de ponto.
   * Exemplo: t("home.title") → "Paper Lantern"
   */
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

  return { language, setLanguage, t, dict };
}

export type UseLanguageReturn = ReturnType<typeof useLanguage>;

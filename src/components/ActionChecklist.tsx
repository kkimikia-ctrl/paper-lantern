"use client";

import { useState } from "react";
import type { Action } from "@/lib/schema";
import { useLanguageContext } from "@/context/LanguageContext";

interface Props {
  actions: { id: number; description: string }[];
  referenceIds: number[];
}

export default function ActionChecklist({ actions, referenceIds }: Props) {
  const { t } = useLanguageContext();
  const [checked, setChecked] = useState<Set<number>>(new Set());

  if (actions.length === 0) return null;

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const done = checked.size;
  const total = actions.length;

  return (
    <section aria-labelledby="checklist-heading" className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3
          id="checklist-heading"
          className="text-xs font-semibold uppercase tracking-widest text-amber-800/60"
        >
          {t("checklist.title")}
        </h3>
        <span
          aria-live="polite"
          aria-atomic="true"
          className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
            done === total && total > 0
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {t("checklist.progress", { done, total })}
        </span>
      </div>
      <ul className="space-y-2" role="list">
        {actions.map((action, i) => {
          const isChecked = checked.has(action.id);
          const refId = referenceIds[i];
          return (
            <li key={action.id} className="flex items-start gap-3">
              <button
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggle(action.id)}
                className={`
                  flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center
                  transition-colors focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1
                  ${
                    isChecked
                      ? "bg-amber-700 border-amber-700"
                      : "bg-white border-amber-400 hover:border-amber-600"
                  }
                `}
                aria-label={action.description}
              >
                {isChecked && (
                  <svg
                    viewBox="0 0 12 12"
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <polyline points="1.5,6 4.5,9.5 10.5,2.5" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm leading-snug transition-colors ${
                    isChecked ? "line-through text-neutral-400" : "text-neutral-800"
                  }`}
                >
                  {action.description}
                </span>
                {refId && (
                  <a
                    href={`#ref-${refId}`}
                    className="ml-1.5 text-xs text-amber-600 hover:text-amber-800 font-mono"
                    aria-label={`Ver trecho de referência ${refId}`}
                  >
                    [{refId}]
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import type { AnalysisResult } from "./schema";

export function validIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value;
}

/** Reject broken evidence links/translations; clear dates that cannot be trusted. */
export function validateAnalysis(result: AnalysisResult): AnalysisResult {
  const groups = [result.references, result.deadlines, result.amounts, result.actions];
  for (const items of groups) {
    if (new Set(items.map(item => item.id)).size !== items.length) throw new Error("Duplicate IDs");
  }
  const refs = new Map(result.references.map(ref => [ref.id, ref]));
  for (const item of [...result.deadlines, ...result.amounts, ...result.actions]) {
    if (!refs.has(item.referenceId)) throw new Error("Missing evidence");
  }
  for (const content of Object.values(result.translations)) {
    for (const key of ["deadlines", "amounts", "actions", "references"] as const) {
      const actual = content[key];
      if (!actual || actual.length !== result[key].length
        || actual.some((item, i) => item.id !== result[key][i].id)) {
        throw new Error("Incomplete translations");
      }
    }
  }
  return {
    ...result,
    partiallyIllegible: result.partiallyIllegible || result.references.some(ref => ref.confidence !== "ok"),
    deadlines: result.deadlines.map(d => ({
      ...d,
      dateIso: d.dateIso && validIsoDate(d.dateIso) && refs.get(d.referenceId)?.confidence === "ok" ? d.dateIso : null,
    })),
  };
}

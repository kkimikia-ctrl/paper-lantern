import { describe, it, expect } from "vitest";
import {
  AnalysisResultSchema,
  AnalyzeRequestSchema,
  ReferenceSchema,
} from "./schema";

// ---------------------------------------------------------------------------
// Fixture — resultado de análise válido e mínimo
// ---------------------------------------------------------------------------

const validResult = {
  documentType: "Fatura de água",
  summary: "Fatura de água do mês de março. O vencimento é dia 31.",
  deadlines: [
    {
      id: 1,
      description: "Pagamento até 31 de março",
      dateRaw: "令和7年3月31日",
      dateIso: "2025-03-31",
      referenceId: 1,
    },
  ],
  amounts: [
    {
      id: 1,
      description: "Valor da fatura",
      valueRaw: "￥4,850",
      referenceId: 2,
    },
  ],
  actions: [
    {
      id: 1,
      description: "Pagar a fatura até o vencimento",
      referenceId: 1,
    },
  ],
  references: [
    { id: 1, japaneseText: "支払期限：令和7年3月31日", confidence: "ok" },
    { id: 2, japaneseText: "請求金額：￥4,850", confidence: "ok" },
  ],
  partiallyIllegible: false,
  translations: {
    pt: {
      documentType: "Fatura de água",
      summary: "Fatura de água do mês de março.",
      deadlines: [{ id: 1, description: "Pagamento até 31 de março" }],
      amounts: [{ id: 1, description: "Valor da fatura: ¥4.850" }],
      actions: [{ id: 1, description: "Pagar a fatura até o vencimento" }],
    },
    en: {
      documentType: "Water bill",
      summary: "Water bill for March.",
      deadlines: [{ id: 1, description: "Payment due March 31" }],
      amounts: [{ id: 1, description: "Bill amount: ¥4,850" }],
      actions: [{ id: 1, description: "Pay the bill by the due date" }],
    },
    tl: {
      documentType: "Bayarin sa tubig",
      summary: "Bayarin sa tubig para sa Marso.",
      deadlines: [{ id: 1, description: "Bayad bago mag-Marso 31" }],
      amounts: [{ id: 1, description: "Halaga ng bayarin: ¥4,850" }],
      actions: [{ id: 1, description: "Bayaran ang bill bago ang deadline" }],
    },
  },
};

// ---------------------------------------------------------------------------
// AnalysisResultSchema
// ---------------------------------------------------------------------------

describe("AnalysisResultSchema", () => {
  it("aceita um resultado válido completo", () => {
    expect(AnalysisResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("aceita resultado com listas vazias (documento sem prazos/valores)", () => {
    const minimal = {
      ...validResult,
      deadlines: [],
      amounts: [],
      actions: [],
      references: [],
    };
    expect(AnalysisResultSchema.safeParse(minimal).success).toBe(true);
  });

  it("aceita dateIso nulo quando a data é incerta", () => {
    const withNullDate = {
      ...validResult,
      deadlines: [
        {
          id: 1,
          description: "Prazo indefinido",
          dateRaw: "近日中",
          dateIso: null,
          referenceId: 1,
        },
      ],
    };
    expect(AnalysisResultSchema.safeParse(withNullDate).success).toBe(true);
  });

  it("rejeita resultado sem campo obrigatório (documentType ausente)", () => {
    const { documentType: _, ...withoutType } = validResult;
    expect(AnalysisResultSchema.safeParse(withoutType).success).toBe(false);
  });

  it("rejeita resultado sem translations", () => {
    const { translations: _, ...withoutTranslations } = validResult;
    expect(AnalysisResultSchema.safeParse(withoutTranslations).success).toBe(
      false
    );
  });

  it("rejeita translations incompletas (faltando idioma 'tl')", () => {
    const withoutTl = {
      ...validResult,
      translations: { pt: validResult.translations.pt, en: validResult.translations.en },
    };
    expect(AnalysisResultSchema.safeParse(withoutTl).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ReferenceSchema — confidence
// ---------------------------------------------------------------------------

describe("ReferenceSchema", () => {
  it("aceita confidence 'ok'", () => {
    expect(
      ReferenceSchema.safeParse({ id: 1, japaneseText: "支払期限", confidence: "ok" }).success
    ).toBe(true);
  });

  it("aceita confidence 'low'", () => {
    expect(
      ReferenceSchema.safeParse({ id: 1, japaneseText: "支払期限", confidence: "low" }).success
    ).toBe(true);
  });

  it("aceita confidence 'illegible'", () => {
    expect(
      ReferenceSchema.safeParse({ id: 1, japaneseText: "???", confidence: "illegible" }).success
    ).toBe(true);
  });

  it("rejeita confidence inválido", () => {
    expect(
      ReferenceSchema.safeParse({ id: 1, japaneseText: "支払期限", confidence: "uncertain" }).success
    ).toBe(false);
  });

  it("rejeita japaneseText vazio", () => {
    expect(
      ReferenceSchema.safeParse({ id: 1, japaneseText: "", confidence: "ok" }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AnalyzeRequestSchema
// ---------------------------------------------------------------------------

describe("AnalyzeRequestSchema", () => {
  it("aceita payload válido JPEG", () => {
    expect(
      AnalyzeRequestSchema.safeParse({
        image: "base64string",
        mimeType: "image/jpeg",
        language: "pt",
      }).success
    ).toBe(true);
  });

  it("aceita payload válido PNG com idioma 'tl'", () => {
    expect(
      AnalyzeRequestSchema.safeParse({
        image: "base64string",
        mimeType: "image/png",
        language: "tl",
      }).success
    ).toBe(true);
  });

  it("rejeita mimeType não suportado", () => {
    expect(
      AnalyzeRequestSchema.safeParse({
        image: "base64string",
        mimeType: "image/gif",
        language: "pt",
      }).success
    ).toBe(false);
  });

  it("rejeita idioma não suportado", () => {
    expect(
      AnalyzeRequestSchema.safeParse({
        image: "base64string",
        mimeType: "image/jpeg",
        language: "es",
      }).success
    ).toBe(false);
  });

  it("rejeita imagem vazia", () => {
    expect(
      AnalyzeRequestSchema.safeParse({
        image: "",
        mimeType: "image/jpeg",
        language: "en",
      }).success
    ).toBe(false);
  });
});

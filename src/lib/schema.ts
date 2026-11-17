import { z } from "zod";

// ---------------------------------------------------------------------------
// Tipos atômicos
// ---------------------------------------------------------------------------

export const ConfidenceSchema = z.enum(["ok", "low", "illegible"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const LanguageSchema = z.enum(["pt", "en", "tl"]);
export type Language = z.infer<typeof LanguageSchema>;

// ---------------------------------------------------------------------------
// Trechos de referência — transcrições do texto japonês original
// ---------------------------------------------------------------------------

export const ReferenceSchema = z.object({
  id: z.number().int().positive(),
  japaneseText: z.string().min(1),
  confidence: ConfidenceSchema,
  /** Tradução do trecho no idioma da análise — preenchida pelo modelo ou pelos dados demo */
  translation: z.string().optional(),
});
export type Reference = z.infer<typeof ReferenceSchema>;

// ---------------------------------------------------------------------------
// Prazos
// ---------------------------------------------------------------------------

export const DeadlineSchema = z.object({
  id: z.number().int().positive(),
  /** Descrição no idioma preferido da requisição */
  description: z.string().min(1),
  /** Data exatamente como aparece no documento (ex.: "令和7年3月31日") */
  dateRaw: z.string().min(1),
  /**
   * Data em ISO 8601 (YYYY-MM-DD) se conversível com certeza.
   * null se a data for ambígua ou ilegível — nunca inventar.
   */
  dateIso: z.string().nullable(),
  referenceId: z.number().int().positive(),
});
export type Deadline = z.infer<typeof DeadlineSchema>;

// ---------------------------------------------------------------------------
// Valores monetários
// ---------------------------------------------------------------------------

export const AmountSchema = z.object({
  id: z.number().int().positive(),
  description: z.string().min(1),
  /** Valor exatamente como aparece no documento (ex.: "￥4,850") */
  valueRaw: z.string().min(1),
  referenceId: z.number().int().positive(),
});
export type Amount = z.infer<typeof AmountSchema>;

// ---------------------------------------------------------------------------
// Ações requeridas
// ---------------------------------------------------------------------------

export const ActionSchema = z.object({
  id: z.number().int().positive(),
  description: z.string().min(1),
  referenceId: z.number().int().positive(),
});
export type Action = z.infer<typeof ActionSchema>;

// ---------------------------------------------------------------------------
// Conteúdo localizado (um objeto por idioma)
// ---------------------------------------------------------------------------

export const LocalizedContentSchema = z.object({
  documentType: z.string().min(1),
  summary: z.string().min(1),
  deadlines: z.array(
    z.object({
      id: z.number().int().positive(),
      description: z.string().min(1),
    })
  ),
  amounts: z.array(
    z.object({
      id: z.number().int().positive(),
      description: z.string().min(1),
    })
  ),
  actions: z.array(
    z.object({
      id: z.number().int().positive(),
      description: z.string().min(1),
    })
  ),
  /** Traduções das referências neste idioma (opcional — preenchido pelo modelo ou dados demo) */
  references: z
    .array(
      z.object({
        id: z.number().int().positive(),
        translation: z.string().min(1),
      })
    )
    .optional(),
});
export type LocalizedContent = z.infer<typeof LocalizedContentSchema>;

// ---------------------------------------------------------------------------
// Resultado completo da análise
// ---------------------------------------------------------------------------

export const AnalysisResultSchema = z.object({
  /** Tipo do documento no idioma preferido da requisição */
  documentType: z.string().min(1),
  /** Resumo em até 3 frases, no idioma preferido */
  summary: z.string().min(1),
  deadlines: z.array(DeadlineSchema),
  amounts: z.array(AmountSchema),
  actions: z.array(ActionSchema),
  /** Trechos japoneses transcritos do documento original */
  references: z.array(ReferenceSchema),
  /** true se qualquer referência tiver confidence !== "ok" */
  partiallyIllegible: z.boolean(),
  /** Conteúdo nos três idiomas para permitir troca sem nova chamada à API */
  translations: z.object({
    pt: LocalizedContentSchema,
    en: LocalizedContentSchema,
    tl: LocalizedContentSchema,
  }),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// ---------------------------------------------------------------------------
// Payload de entrada do route handler
// ---------------------------------------------------------------------------

export const AnalyzeRequestSchema = z.object({
  /** Imagem em base64 (JPEG ou PNG) */
  image: z.string().min(1),
  mimeType: z.enum(["image/jpeg", "image/png"]),
  language: LanguageSchema,
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// ---------------------------------------------------------------------------
// Respostas de erro padronizadas
// ---------------------------------------------------------------------------

export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.enum([
    "INVALID_PAYLOAD",
    "API_NOT_CONFIGURED",
    "MODEL_RESPONSE_INVALID",
    "TIMEOUT",
    "IMAGE_ILLEGIBLE",
    "NOT_JAPANESE_DOCUMENT",
    "RATE_LIMITED",
    "PROVIDER_UNAVAILABLE",
    "INTERNAL_ERROR",
  ]),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

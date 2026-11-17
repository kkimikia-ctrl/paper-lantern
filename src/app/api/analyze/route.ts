// Route handler — POST /api/analyze
// Implementação completa em T-07.
// Este arquivo é o esqueleto que garante que a rota existe e responde
// corretamente quando a API não está configurada (RF-03-9).

import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/schema";
import type { ApiError } from "@/lib/schema";

export async function POST(request: NextRequest) {
  // T-03: verificar presença da chave antes de qualquer processamento
  if (!process.env.ANALYZE_API_KEY) {
    const body: ApiError = {
      error: "A análise de imagens não está disponível nesta instalação.",
      code: "API_NOT_CONFIGURED",
    };
    return NextResponse.json(body, { status: 503 });
  }

  // Validar payload de entrada
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const body: ApiError = {
      error: "Payload inválido.",
      code: "INVALID_PAYLOAD",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const parsed = AnalyzeRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const body: ApiError = {
      error: `Payload inválido: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
      code: "INVALID_PAYLOAD",
    };
    return NextResponse.json(body, { status: 400 });
  }

  // Implementação da chamada ao modelo: T-07
  const body: ApiError = {
    error: "Integração com modelo ainda não implementada (T-07).",
    code: "INTERNAL_ERROR",
  };
  return NextResponse.json(body, { status: 501 });
}

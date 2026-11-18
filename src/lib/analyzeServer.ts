import { createHash } from "node:crypto";
import { AnalyzeRequestSchema, type ApiError } from "./schema";
import { buildPrompt, ModelEnvelopeSchema, responseJsonSchema } from "./prompt";
import { validateAnalysis } from "./analysisValidation";
import { MAX_IMAGE_BYTES, MAX_REQUEST_BYTES } from "./imageLimits";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
function fail(code: ApiError["code"], status: number): Response {
  return Response.json({ code, error: code }, { status, headers });
}

// Best-effort, bounded per-instance throttling. Provider quota remains the global cap.
const windows = new Map<string, { count: number; until: number }>();
let active = 0;
function allowed(request: Request): boolean {
  const now = Date.now();
  for (const [id, value] of windows) if (value.until <= now) windows.delete(id);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const id = createHash("sha256").update(ip).digest("hex");
  const current = windows.get(id) ?? { count: 0, until: now + 60_000 };
  if (current.count >= 5 || active >= 4 || (!windows.has(id) && windows.size >= 2000)) return false;
  current.count++;
  windows.set(id, current);
  return true;
}

async function readPayload(request: Request): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > MAX_REQUEST_BYTES) throw new Error("size");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) { await reader.cancel(); throw new Error("size"); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally { reader.releaseLock(); }
}

function validImage(image: string, mimeType: string): boolean {
  if (image.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 || image.length % 4 !== 0
    || !/^[A-Za-z0-9+/]+={0,2}$/.test(image)) return false;
  const bytes = Buffer.from(image, "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES || bytes.toString("base64") !== image) return false;
  return mimeType === "image/jpeg"
    ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
}

export async function analyzeRequest(request: Request): Promise<Response> {
  const key = process.env.ANALYZE_API_KEY?.trim();
  if (key && !/^[\x21-\x7e]+$/.test(key)) {
    console.warn("analysis: credential contains invalid HTTP header characters");
    return fail("API_NOT_CONFIGURED", 503);
  }
  if (!key || process.env.ANALYZE_ENABLED === "false") return fail("API_NOT_CONFIGURED", 503);
  // Prevent other browser origins from invoking the paid/quota-limited endpoint.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return fail("INVALID_PAYLOAD", 403);
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return fail("INVALID_PAYLOAD", 400);
  }
  if (!allowed(request)) return fail("RATE_LIMITED", 429);
  let payload: unknown;
  try { payload = await readPayload(request); }
  catch { return fail("INVALID_PAYLOAD", 400); }
  const parsed = AnalyzeRequestSchema.safeParse(payload);
  if (!parsed.success || !validImage(parsed.data.image, parsed.data.mimeType)) return fail("INVALID_PAYLOAD", 400);

  const model = process.env.ANALYZE_MODEL?.trim() || "gemini-3.8-flash";
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) return fail("API_NOT_CONFIGURED", 503);
  active++;
  try {
    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildPrompt(parsed.data.language) }] },
        contents: [{ role: "user", parts: [
          { inlineData: { mimeType: parsed.data.mimeType, data: parsed.data.image } },
          { text: "Explain this Japanese document using the required JSON contract." },
        ] }],
        generationConfig: { responseMimeType: "application/json", responseJsonSchema, maxOutputTokens: 16384 },
      }),
    };
    const generate = (name: string, requestOptions = options) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${name}:generateContent`, requestOptions);
    let response = await generate(model);
    if (response.status === 503 && !process.env.ANALYZE_MODEL?.trim()) {
      console.warn("analysis: Gemini temporarily unavailable, trying Flash-Lite");
      await response.body?.cancel();
      const fallback = JSON.parse(String(options.body));
      delete fallback.generationConfig.responseJsonSchema;
      fallback.systemInstruction.parts.push({ text: `Return JSON matching this contract: ${JSON.stringify(responseJsonSchema)}` });
      response = await generate("gemini-flash-lite-latest", { ...options, body: JSON.stringify(fallback) });
    }
    // Never forward provider messages (they can contain credentials/input details).
    if (!response.ok) {
      console.warn("analysis: Gemini HTTP status", response.status);
      if (response.status === 429) return fail("RATE_LIMITED", 429);
      if ([400, 401, 403, 404].includes(response.status)) return fail("API_NOT_CONFIGURED", 503);
      return fail("PROVIDER_UNAVAILABLE", 502);
    }
    const envelope: unknown = await response.json();
    const candidates = (envelope as { candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[] }).candidates;
    const candidate = candidates?.[0];
    if (candidate?.finishReason !== "STOP") return fail("MODEL_RESPONSE_INVALID", 422);
    const text = candidate.content?.parts?.filter(p => !p.thought).map(p => p.text ?? "").join("");
    if (!text) return fail("MODEL_RESPONSE_INVALID", 422);
    try {
      const output = ModelEnvelopeSchema.parse(JSON.parse(text));
      if (output.status === "illegible") return fail("IMAGE_ILLEGIBLE", 422);
      if (output.status === "not_japanese") return fail("NOT_JAPANESE_DOCUMENT", 422);
      if (!output.result) return fail("MODEL_RESPONSE_INVALID", 422);
      return Response.json(validateAnalysis(output.result), { headers });
    } catch { return fail("MODEL_RESPONSE_INVALID", 422); }
  } catch (error) {
    const cause = error instanceof Error ? error.cause as { code?: string } | undefined : undefined;
    const code = cause?.code;
    console.warn("analysis: provider call failed", error instanceof Error ? error.name : "unknown", code && /^[A-Z_0-9]{1,40}$/.test(code) ? code : "no-code");
    if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) return fail("TIMEOUT", 504);
    return fail("PROVIDER_UNAVAILABLE", 502);
  } finally { active--; }
}

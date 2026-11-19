// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeRequest } from "./analyzeServer";
import { DEMO_DOCUMENTS } from "./demoData";
const waterBillResult = DEMO_DOCUMENTS[0].result;

let requestId = 0;
const jpeg = Buffer.from([255,216,255,224,0,16,74,70,73,70,255,217]).toString("base64");
function request(body: unknown = {image: jpeg, mimeType: "image/jpeg", language: "pt"}, origin = "https://paper.test") {
  return new Request("https://paper.test/api/analyze", {
    method:"POST", headers: {"content-type":"application/json", origin, "x-forwarded-for":`test-${++requestId}`},
    body: JSON.stringify(body),
  });
}
function mockModel(result: unknown = structuredClone(waterBillResult), status = "ok") {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ candidates: [{ finishReason: "STOP", content: {parts: [{text: JSON.stringify({status, result})}]} }] })));
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("photo analysis endpoint", () => {
  it("keeps demo independent and reports missing configuration without a network call", async () => {
    vi.stubEnv("ANALYZE_API_KEY", ""); const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const response = await analyzeRequest(request());
    expect(response.status).toBe(503); expect(fetch).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("honors the disable switch", async () => {
    vi.stubEnv("ANALYZE_API_KEY", "secret"); vi.stubEnv("ANALYZE_ENABLED", "false");
    expect((await analyzeRequest(request())).status).toBe(503);
  });
  it("rejects invalid content and cross-origin browser requests before calling Gemini", async () => {
    vi.stubEnv("ANALYZE_API_KEY", "secret"); const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect((await analyzeRequest(request({}, "https://other.test"))).status).toBe(403);
    expect((await analyzeRequest(request({image:"invalid",mimeType:"image/jpeg",language:"pt"}))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("bounds streamed input even without a content-length header", async () => {
    vi.stubEnv("ANALYZE_API_KEY", "secret"); const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect((await analyzeRequest(request({image:"A".repeat(3*1024*1024)}))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("returns translated evidence and keeps credentials out of browser responses", async () => {
    vi.stubEnv("ANALYZE_API_KEY", "never-expose-me"); mockModel();
    const response = await analyzeRequest(request());
    expect(response.status).toBe(200);
    const text = await response.text(); expect(text).not.toContain("never-expose-me");
    const data = JSON.parse(text); expect(data.translations.pt.references[0].translation).toBeTruthy();
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toMatch(/^https:\/\/generativelanguage.googleapis.com\//);
    expect(String(url)).not.toContain("never-expose-me");
    expect((options?.headers as Record<string,string>)["x-goog-api-key"]).toBe("never-expose-me");
    expect(JSON.parse(String(options?.body)).generationConfig.responseJsonSchema).toBeTruthy();
  });
  it("rejects invented reference IDs and missing localized references", async () => {
    vi.stubEnv("ANALYZE_API_KEY", "secret");
    const result = structuredClone(waterBillResult); result.actions[0].referenceId = 999; mockModel(result);
    expect((await analyzeRequest(request())).status).toBe(422);
    const partial = structuredClone(waterBillResult); delete partial.translations.en.references; mockModel(partial);
    expect((await analyzeRequest(request())).status).toBe(422);
  });
  it("clears impossible and low-confidence dates before calendar export", async () => {
    vi.stubEnv("ANALYZE_API_KEY", "secret");
    const result = structuredClone(waterBillResult); result.deadlines[0].dateIso = "2025-02-30"; mockModel(result);
    expect((await (await analyzeRequest(request())).json()).deadlines[0].dateIso).toBeNull();
    result.deadlines[0].dateIso = "2025-03-31"; result.references[0].confidence = "low"; mockModel(result);
    const data = await (await analyzeRequest(request())).json();
    expect(data.deadlines[0].dateIso).toBeNull(); expect(data.partiallyIllegible).toBe(true);
  });
  it.each([["illegible","IMAGE_ILLEGIBLE"],["not_japanese","NOT_JAPANESE_DOCUMENT"]])("handles %s without presenting a fake analysis", async (status,code) => {
    vi.stubEnv("ANALYZE_API_KEY", "secret"); mockModel(null,status);
    const response = await analyzeRequest(request()); expect(response.status).toBe(422);
    expect((await response.json()).code).toBe(code);
  });
  it("maps provider quota failures without exposing provider diagnostics", async () => {
    vi.stubEnv("ANALYZE_API_KEY", "secret");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("provider-secret-diagnostic",{status:429})));
    const response = await analyzeRequest(request()); expect(response.status).toBe(429);
    expect(await response.text()).not.toContain("provider-secret");
  });
  it("uses a fresh timeout for the alternate model if the first times out", async () => {
    vi.stubEnv("ANALYZE_API_KEY", "test");
    vi.stubEnv("ANALYZE_MODEL", "");
    const fetcher = vi.fn().mockRejectedValueOnce(new DOMException("timeout", "TimeoutError"))
      .mockResolvedValueOnce(Response.json({ candidates: [{ finishReason: "STOP", content: {
        parts: [{ text: JSON.stringify({ status: "ok", result: waterBillResult }) }]
      } }] }));
    vi.stubGlobal("fetch", fetcher);
    expect((await analyzeRequest(request())).status).toBe(200);
    expect(fetcher.mock.calls[1][0]).toContain("flash-lite");
    expect(fetcher.mock.calls[1][1].signal).not.toBe(fetcher.mock.calls[0][1].signal);
  });
  it("handles provider timeouts", async () => {
    vi.stubEnv("ANALYZE_API_KEY", "secret");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("timeout","TimeoutError")));
    expect((await analyzeRequest(request())).status).toBe(504);
  });
});

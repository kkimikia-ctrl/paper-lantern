"use client";

import { useEffect, useRef, useState } from "react";
import { AnalysisResultSchema, type AnalysisResult } from "@/lib/schema";
import { prepareImage, type PreparedImage } from "@/lib/prepareImage";
import { useLanguageContext } from "@/context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import AnalysisResultView from "./AnalysisResult";

const errorKeys: Record<string, string> = {
  API_NOT_CONFIGURED: "analysis.errorApiNotConfigured",
  INVALID_PAYLOAD: "upload.errorGeneric",
  MODEL_RESPONSE_INVALID: "analysis.errorInvalidResponse",
  TIMEOUT: "analysis.timeout",
  IMAGE_ILLEGIBLE: "analysis.errorIllegible",
  NOT_JAPANESE_DOCUMENT: "analysis.errorNotJapanese",
  RATE_LIMITED: "analysis.errorRateLimited",
  PROVIDER_UNAVAILABLE: "analysis.errorUnavailable",
};
const button = "rounded-xl px-5 py-3 font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed";

export default function UploadView({ onExit }: { onExit: () => void }) {
  const { t, language } = useLanguageContext();
  const [photo, setPhoto] = useState<PreparedImage | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errorKey, setErrorKey] = useState("");
  const controller = useRef<AbortController | null>(null);
  const selection = useRef(0);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => () => { controller.current?.abort(); selection.current++; }, []);
  useEffect(() => { if (result) resultHeading.current?.focus(); }, [result]);

  async function selectPhoto(file?: File) {
    if (!file) return;
    const current = ++selection.current;
    setPreparing(true); setPhoto(null); setConsent(false); setErrorKey(""); setResult(null);
    try {
      const image = await prepareImage(file);
      if (current === selection.current) setPhoto(image);
    } catch (error) {
      if (current === selection.current) setErrorKey(`upload.${error instanceof Error ? error.message : "errorGeneric"}`);
    } finally { if (current === selection.current) setPreparing(false); }
  }

  async function analyze() {
    if (!photo || !consent || busy) return;
    const requestController = new AbortController();
    controller.current = requestController;
    const timeout = window.setTimeout(() => requestController.abort(), 55_000);
    setBusy(true); setErrorKey("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo.image, mimeType: photo.mimeType, language }),
        signal: requestController.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setErrorKey(errorKeys[body.code] ?? (response.status === 429 ? "analysis.errorRateLimited" : "analysis.errorGeneric"));
        return;
      }
      const parsed = AnalysisResultSchema.safeParse(await response.json());
      if (!parsed.success) { setErrorKey("analysis.errorInvalidResponse"); return; }
      setResult(parsed.data);
    } catch {
      // A cancelled/unmounted request must never update the next screen.
      if (controller.current !== requestController) return;
      setErrorKey(requestController.signal.aborted ? "analysis.timeout" : "analysis.errorUnavailable");
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === requestController) { controller.current = null; setBusy(false); }
    }
  }

  function exit() {
    controller.current?.abort(); controller.current = null; selection.current++;
    setPhoto(null); setResult(null); onExit();
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6" style={{ background: "radial-gradient(ellipse at top, #2a1505, #120900 70%)" }}>
      <div className="max-w-xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6 text-amber-100">
          <button onClick={exit} className={`${button} border border-amber-700`}>← {t("upload.back")}</button>
          <LanguageSelector />
        </header>
        <div className="bg-[#fdf8ef] rounded-2xl p-5 sm:p-7 shadow-xl">
          <h1 ref={resultHeading} tabIndex={-1} className="text-xl font-bold text-amber-900 mb-4 outline-none">
            {result ? t("upload.resultTitle") : t("home.uploadButton")}
          </h1>
          {!result && (
            <>
              <p className="text-sm text-neutral-700 mb-4">{t("upload.instructions")}</p>
              <label className={`block border-2 border-dashed border-amber-600 rounded-xl p-5 text-center text-amber-900 ${busy || preparing ? "opacity-50" : "cursor-pointer hover:bg-amber-50"}`}>
                <span className="block font-semibold">{photo ? t("upload.changeImage") : t("upload.choose")}</span>
                <span className="block text-xs mt-2">{t("home.acceptedFormats")}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="block w-full text-sm mt-4" aria-label={t("upload.choose")} disabled={busy || preparing}
                  onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; void selectPhoto(file); }} />
              </label>
              {preparing && <p role="status" className="my-4 text-amber-900">{t("upload.preparing")}</p>}
              {photo && (
                <div className="mt-5 space-y-4">
                  <h2 className="font-semibold text-amber-900">{t("upload.preview")}</h2>
                  {/* Local data URL only; never persisted. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt={t("upload.preview")} className="w-full max-h-[60vh] object-contain rounded-lg bg-white border border-amber-200" />
                  <p className="text-sm text-neutral-700 leading-relaxed">{t("upload.privacy")}</p>
                  <label className="flex items-start gap-3 text-sm text-neutral-800">
                    <input type="checkbox" checked={consent} disabled={busy} onChange={e => setConsent(e.target.checked)} className="mt-1 w-5 h-5 accent-amber-700 shrink-0" />
                    <span>{t("upload.consent")}</span>
                  </label>
                  <button onClick={() => void analyze()} disabled={!consent || busy} className={`${button} w-full bg-amber-700 hover:bg-amber-800 text-white`}>
                    {busy ? t("analysis.loading") : t("upload.analyzeButton")}
                  </button>
                </div>
              )}
              {busy && <p role="status" className="mt-3 text-sm text-amber-800">{t("analysis.loading")}</p>}
              {errorKey && <p role="alert" className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{t(errorKey)}</p>}
            </>
          )}
          {result && (
            <>
              {result.partiallyIllegible && <p role="status" className="mb-4 bg-yellow-100 p-3 rounded-lg text-yellow-900 text-sm">{t("analysis.partialWarning")}</p>}
              <details className="mb-6 text-amber-900 text-sm">
                <summary className="cursor-pointer font-semibold">{t("upload.preview")}</summary>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo?.preview} alt={t("upload.preview")} className="w-full mt-3 rounded-lg" />
              </details>
              <AnalysisResultView result={result} />
              <button className={`${button} w-full border border-amber-700 text-amber-900`} onClick={() => { setResult(null); setPhoto(null); setConsent(false); setErrorKey(""); }}>{t("upload.newPhoto")}</button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

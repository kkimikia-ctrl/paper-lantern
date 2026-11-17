# Paper Lantern 🏮

Understand Japanese letters in Portuguese, English or Filipino. See the original Japanese evidence beside translated explanations, dates, amounts and a checklist, then confirm dates before exporting an all-day `.ics` calendar file.

## Run locally

Use a current Node.js version supported by Next.js 15, then:

```sh
npm ci
cp .env.example .env.local
# Set ANALYZE_API_KEY in .env.local only.
npm run dev
```

The demonstration works without an API key and uses three clearly labelled fictional documents. Photo analysis is separate and never falls back to fictional results.

## Photo analysis / Vercel

1. Create a separate Google AI Studio project and Gemini API key.
2. In the **paper-lantern** Vercel project, add `ANALYZE_API_KEY` as a **Secret** under the intended environment. Never put it in GitHub, chat, a screenshot or a `NEXT_PUBLIC_*` variable.
3. Optional: set `ANALYZE_MODEL`; the default is `gemini-3.8-flash` (configurable). Set `ANALYZE_ENABLED=false` to disable the photo endpoint while retaining the demo.
4. Deploy after configuring the environment. A Production-only secret is not available in Preview deployments; configure Preview separately if needed.

The implementation uses Gemini's REST `generateContent` endpoint and structured JSON output, with server-side Zod validation. No provider SDK or new runtime dependency is required.

Select or take a photo (source limit 10 MB). The browser decodes and re-encodes it as JPEG, removes source metadata and limits its longest side to 2048 pixels and encoded payload to 2 MB. HEIC/HEIF can be selected but requires browser decoding support; use JPEG/PNG if decoding fails. No image leaves the browser before the user reviews it, checks the disclosure and clicks Analyze.

### Privacy and limits

This prototype sends the confirmed photo to **Google Gemini**. Google's free API tier can use submitted content for product improvement. **Use fictional documents or remove all personal/sensitive data before testing.** The UI explains this and asks for confirmation. Do not use confidential real letters with this test configuration. Google may retain/process submitted content under its own terms; the app's discard behavior is not a deletion guarantee for Google.

Paper Lantern does not persist photos/results or log request bodies/provider errors. The API key stays server-side, is sent as a provider header rather than a URL parameter, and is never returned to the browser. Analysis responses use `Cache-Control: no-store`. Navigation away discards the in-memory photo/result. Checklist ticks do not pay a bill or contact a carrier. No automatic payments, redelivery requests, barcode destinations or external actions are performed.

Free-tier quotas and availability depend on the Google project and model. No billing account, paid plan, fallback model or automatic retries are configured by this change. Best-effort limits allow five attempts per IP per minute and four concurrent provider calls **per server instance**. This is not a distributed/global spending cap; keep Google's provider quotas enforced and add a shared limit/authentication before broad use or enabling paid billing. The provider request times out at 45 seconds; the Vercel function allows 60 seconds.

Dates and amounts remain model interpretations. Invalid dates and dates supported by uncertain evidence are left blank for confirmation. Evidence links and translations must refer to matching IDs in all three languages. The prompt prohibits filling in missing data and distinguishes storage deadlines, installment amounts, annual totals and conditional direct-debit instructions. All important information still requires checking against the original letter.

## Validation

```sh
npm test
npm run build
```

Tests cover schema/calendar behavior, upload confirmation, API-unconfigured behavior, invalid requests, provider errors/timeouts, evidence/translation consistency, uncertain dates and request cancellation. Automated provider tests use mocked responses and do **not** prove live OCR accuracy or a particular API key's access.

## Documentation

- [Gemini image understanding](https://ai.google.dev/gemini-api/docs/image-understanding)
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Models](https://ai.google.dev/gemini-api/docs/models)
- [Pricing and free-tier data use](https://ai.google.dev/gemini-api/docs/pricing)
- Original Kiro requirements, design and development tasks are in `.kiro/specs/paper-lantern/`.

# Paper Lantern — Design técnico v0.1

> Kiroween 2026 · Complementa requirements.md · Sem implementação ainda

---

## Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 14 (App Router) + TypeScript | Route handlers protegem a chave de API; App Router simplifica layouts por segmento |
| Estilo | Tailwind CSS | Utilitários rápidos; responsividade sem CSS extra |
| Componentes | shadcn/ui (base Radix UI) | Acessibilidade (WCAG AA) já embutida nos primitivos |
| Geração de .ics | `ical.js` ou equivalente leve, rodando no browser | Sem envio de dados ao servidor na exportação |
| Linting / formatação | ESLint + Prettier | Consistência desde o início |
| Testes | Vitest + Testing Library | Leve, compatível com Vite/Next; suficiente para MVP |

---

## Modelo de análise

O modelo é **configurável por variável de ambiente** e será escolhido na etapa T-07 (implementação do route handler), após verificar a documentação oficial atual de cada provedor.

Requisitos que o modelo deve atender (ver RNF-06):
- Entrada multimodal: imagem + texto no mesmo prompt
- Saída em JSON estruturado (nativa ou via instrução de prompt)
- Compreensão de japonês suficiente para documentos formais
- Sem custo para fins de desenvolvimento e demonstração — a ser confirmado na documentação oficial no momento da integração, sem assumir gratuidade de versões anteriores

Variáveis de ambiente relevantes:
- `ANALYZE_API_KEY` — chave do provedor escolhido
- `ANALYZE_MODEL` — identificador do modelo (ex.: nome do modelo no provedor)
- `ANALYZE_API_URL` — endpoint base, se necessário

Se `ANALYZE_API_KEY` estiver ausente, o route handler retorna 503 com a mensagem definida em RF-03-9.

---

## Arquitetura geral

```
Navegador                        Servidor Next.js              Google Gemini
─────────────────────────────    ────────────────────────────  ──────────────
[Tela inicial]
  │  upload ou demo
  ▼
[Pré-visualização + idioma]
  │  POST /api/analyze
  │  { image: base64, lang }
  ▼                              [route handler]
                                   validar tamanho e tipo
                                   montar prompt com schema
                                   │  POST generateContent
                                   │  { image, prompt }
                                   ▼                           processar
                                                               retornar JSON
                                   validar resposta (zod)
                                   remover imagem da memória
                                   retornar AnalysisResult
  ▼
[Tela de resultado]
  renderizar explicação
  checklist (estado React)
  │  confirmar prazos
  ▼
[Modal de confirmação .ics]
  gerar arquivo no browser
  download
```

---

## Contrato da API interna

### `POST /api/analyze`

**Request**
```ts
{
  image: string;      // base64 da imagem (JPEG ou PNG)
  mimeType: "image/jpeg" | "image/png";
  language: "pt" | "en" | "tl";  // idioma preferido (usado no prompt)
}
```

**Response 200 — `AnalysisResult`**
```ts
{
  documentType: string;          // ex.: "Fatura de água"
  summary: string;               // até 3 frases
  deadlines: Deadline[];
  amounts: Amount[];
  actions: Action[];
  references: Reference[];       // trechos japoneses transcritos
  partiallyIlegible: boolean;    // true se há ⚠ no resultado
  translations: {                // os três idiomas juntos
    pt: LocalizedContent;
    en: LocalizedContent;
    tl: LocalizedContent;
  };
}

type Deadline = {
  id: number;
  description: string;      // no idioma preferido
  dateRaw: string;          // como extraído do documento, ex. "令和7年3月31日"
  dateIso: string | null;   // ISO 8601 se conversível, null se incerto
  referenceId: number;      // aponta para Reference.id
};

type Amount = {
  id: number;
  description: string;
  valueRaw: string;         // como aparece no documento, ex. "￥4,850"
  referenceId: number;
};

type Action = {
  id: number;
  description: string;
  referenceId: number;
};

type Reference = {
  id: number;
  japaneseText: string;     // trecho transcrito
  confidence: "ok" | "low" | "illegible";
};

type LocalizedContent = {
  documentType: string;
  summary: string;
  deadlines: { id: number; description: string }[];
  amounts:   { id: number; description: string }[];
  actions:   { id: number; description: string }[];
};
```

**Respostas de erro**
| Status | Situação |
|--------|----------|
| 400 | Payload inválido (tipo de arquivo, tamanho, campos ausentes) |
| 422 | Resposta do modelo não passou na validação de schema |
| 503 | `ANALYZE_API_KEY` não configurada |
| 504 | Timeout (> 30 s aguardando o modelo) |
| 500 | Erro inesperado |

---

## Prompt para o modelo

O prompt é montado no servidor e inclui:

1. Instrução de papel: "You are a document analysis assistant…"
2. Schema JSON esperado como string (para guiar a saída estruturada)
3. Regras explícitas:
   - Nunca inventar texto para trechos ilegíveis; marcar `confidence: "illegible"`
   - Marcar `confidence: "low"` quando o texto foi lido mas com incerteza
   - `dateIso` deve ser `null` se a data não puder ser convertida com certeza
   - Retornar os três idiomas em `translations` mesmo que o usuário prefira apenas um
4. Instrução de saída: `Respond ONLY with valid JSON matching the schema.`

O prompt completo será versionado em `src/lib/prompt.ts`.

---

## Estrutura de arquivos planejada

```
paper-lantern/
├── .env.example                  # variáveis sem valores reais
├── .gitignore                    # inclui .env*.local
├── next.config.ts
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx            # html, body, provider de idioma
│   │   ├── page.tsx              # tela inicial (upload + botão demo)
│   │   ├── result/
│   │   │   └── page.tsx          # tela de resultado
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts      # route handler — único ponto de acesso à API externa
│   ├── components/
│   │   ├── UploadZone.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── AnalysisResult.tsx
│   │   ├── ReferenceList.tsx
│   │   ├── ActionChecklist.tsx
│   │   ├── CalendarExportModal.tsx
│   │   └── DemoBanner.tsx
│   ├── lib/
│   │   ├── prompt.ts             # construção do prompt versionado
│   │   ├── schema.ts             # tipos TypeScript + validação Zod
│   │   ├── icsGenerator.ts       # geração de .ics no browser
│   │   └── demoData.ts           # dados dos 3 documentos fictícios
│   ├── i18n/
│   │   ├── pt.json
│   │   ├── en.json
│   │   └── tl.json
│   └── hooks/
│       └── useLanguage.ts
└── .kiro/
    └── specs/
        └── paper-lantern/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

---

## Fluxo de dados — upload real

1. Usuário seleciona imagem → pré-visualização no browser (FileReader, sem envio).
2. Usuário confirma → browser converte para base64 e faz `POST /api/analyze`.
3. Route handler valida payload, monta prompt, chama Gemini, valida resposta com Zod.
4. Servidor retorna `AnalysisResult`; imagem não é gravada.
5. Cliente armazena resultado em estado React (memória de sessão).
6. Usuário pode trocar idioma → re-renderiza de `translations[lang]`, sem nova chamada.
7. Usuário acessa exportação → modal confirma datas → .ics gerado no browser.

## Fluxo de dados — modo demo

1. Usuário clica "Ver demonstração" → `demoData.ts` carrega dados do primeiro documento.
2. Nenhuma rede é usada. `DemoBanner` fica visível.
3. Os mesmos componentes de resultado renderizam os dados fictícios.
4. Exportação .ics funciona normalmente com as datas fictícias.

---

## Decisões de privacidade

- A imagem em base64 existe apenas no corpo do request HTTP e na memória do processo Node durante a chamada ao Gemini. Não é atribuída a variável de módulo, não é logada.
- O `AnalysisResult` retornado não inclui a imagem; inclui apenas texto.
- O servidor não usa nenhum middleware de analytics que registre bodies de request.
- O `.ics` é gerado no cliente; os dados de prazo nunca voltam ao servidor.

---

## Internacionalização

A interface usa um dicionário simples por arquivo JSON (`i18n/pt.json` etc.), acessado via hook `useLanguage`. Não usa `next-intl` ou `i18next` para manter dependências mínimas no MVP. A troca de idioma atualiza o estado global e re-renderiza os componentes; não recarrega a página.

---

## Demonstração — documentos fictícios

| # | Nome fictício | Tipo | Prazos | Valores |
|---|--------------|------|--------|---------|
| 1 | 水道局 お知らせ | Fatura de água | 1 (pagamento até fim do mês) | 1 (¥4,850) |
| 2 | 日本郵便 不在連絡票 | Aviso de tentativa de entrega | 1 (retirada em 7 dias) | — |
| 3 | 市役所 住民税 納税通知書 | Notificação de imposto municipal | 2 (1ª e 2ª parcelas) | 2 (parcela 1 e total) |

Cada documento tem: imagem de placeholder (SVG gerado no código), `AnalysisResult` completo embutido em `demoData.ts`, e referências numeradas coerentes com o texto japonês fictício.

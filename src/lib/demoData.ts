import type { AnalysisResult } from "@/lib/schema";

export interface DemoDocument {
  id: string;
  /** Chave usada em i18n para o nome do documento */
  nameKey: string;
  /** SVG inline como string — gerado sem dependências externas */
  placeholderSvg: string;
  result: AnalysisResult;
}

// ---------------------------------------------------------------------------
// Documento 1 — Fatura de água (水道局)
// ---------------------------------------------------------------------------

const waterBillSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420" role="img" aria-label="Documento fictício: fatura de água">
  <rect width="320" height="420" fill="#f8f4ee" rx="4"/>
  <rect x="0" y="0" width="320" height="52" fill="#1a3a5c"/>
  <text x="160" y="22" font-family="serif" font-size="13" fill="#c8b98a" text-anchor="middle">東京都水道局</text>
  <text x="160" y="42" font-family="serif" font-size="10" fill="#a09070" text-anchor="middle">水道使用量のお知らせ</text>
  <line x1="20" y1="62" x2="300" y2="62" stroke="#c8b98a" stroke-width="0.8"/>
  <text x="20" y="82" font-family="serif" font-size="9" fill="#444">お客様番号：　２３４５－６７８９</text>
  <text x="20" y="98" font-family="serif" font-size="9" fill="#444">お客様名：　　山田　太郎　様</text>
  <text x="20" y="114" font-family="serif" font-size="9" fill="#444">ご使用期間：　令和７年２月１日〜２月２８日</text>
  <line x1="20" y1="124" x2="300" y2="124" stroke="#ddd" stroke-width="0.5"/>
  <rect x="20" y="134" width="280" height="60" fill="#eef3f8" rx="3"/>
  <text x="160" y="154" font-family="serif" font-size="10" fill="#1a3a5c" text-anchor="middle">ご請求金額</text>
  <text x="160" y="182" font-family="serif" font-size="22" fill="#1a3a5c" text-anchor="middle" font-weight="bold">￥４，８５０</text>
  <text x="20" y="214" font-family="serif" font-size="9" fill="#444">支払期限：　令和７年３月３１日（月）</text>
  <text x="20" y="230" font-family="serif" font-size="9" fill="#444">お支払方法：　銀行振込・コンビニ払い</text>
  <line x1="20" y1="244" x2="300" y2="244" stroke="#ddd" stroke-width="0.5"/>
  <text x="20" y="262" font-family="serif" font-size="8" fill="#666">今月のご使用量：　１８㎥</text>
  <text x="20" y="276" font-family="serif" font-size="8" fill="#666">先月のご使用量：　１６㎥</text>
  <text x="20" y="290" font-family="serif" font-size="8" fill="#666">基本料金：　￥１，２１０</text>
  <text x="20" y="304" font-family="serif" font-size="8" fill="#666">従量料金：　￥３，６４０</text>
  <line x1="20" y1="316" x2="300" y2="316" stroke="#ddd" stroke-width="0.5"/>
  <text x="20" y="334" font-family="serif" font-size="8" fill="#888">※お支払いが遅れますと、延滞金が発生する場合があります。</text>
  <text x="20" y="348" font-family="serif" font-size="8" fill="#888">※ご不明な点は下記までお問い合わせください。</text>
  <text x="20" y="368" font-family="serif" font-size="8" fill="#1a3a5c">お問い合わせ：　０１２０－xxx－xxx（架空の番号）</text>
  <text x="160" y="408" font-family="serif" font-size="7" fill="#aaa" text-anchor="middle">※このドキュメントは架空のサンプルです／FICTIONAL DOCUMENT</text>
</svg>`;

const waterBillResult: AnalysisResult = {
  documentType: "Fatura de água",
  summary:
    "Fatura mensal de fornecimento de água referente a fevereiro. O valor de ¥4.850 deve ser pago até 31 de março de 2025. É possível pagar em banco ou conveniência.",
  deadlines: [
    {
      id: 1,
      description: "Pagamento da fatura",
      dateRaw: "令和７年３月３１日",
      dateIso: "2025-03-31",
      referenceId: 1,
    },
  ],
  amounts: [
    {
      id: 1,
      description: "Valor total da fatura",
      valueRaw: "￥４，８５０",
      referenceId: 2,
    },
  ],
  actions: [
    {
      id: 1,
      description: "Pagar a fatura até 31 de março de 2025 via banco ou conveniência",
      referenceId: 1,
    },
  ],
  references: [
    {
      id: 1,
      japaneseText: "支払期限：令和７年３月３１日（月）",
      confidence: "ok",
    },
    {
      id: 2,
      japaneseText: "ご請求金額　￥４，８５０",
      confidence: "ok",
    },
    {
      id: 3,
      japaneseText: "お支払方法：銀行振込・コンビニ払い",
      confidence: "ok",
    },
  ],
  partiallyIllegible: false,
  translations: {
    pt: {
      documentType: "Fatura de água",
      summary:
        "Fatura mensal de fornecimento de água referente a fevereiro. O valor de ¥4.850 deve ser pago até 31 de março de 2025. É possível pagar em banco ou conveniência.",
      deadlines: [{ id: 1, description: "Pagamento da fatura — até 31 de março de 2025" }],
      amounts: [{ id: 1, description: "Total: ¥4.850" }],
      actions: [
        {
          id: 1,
          description: "Pagar a fatura até 31 de março de 2025 via banco ou conveniência",
        },
      ],
      references: [
        { id: 1, translation: "Prazo de pagamento: 31 de março de 2025 (segunda-feira)" },
        { id: 2, translation: "Valor cobrado: ¥4.850" },
        { id: 3, translation: "Formas de pagamento: transferência bancária ou pagamento em conveniência" },
      ],
    },
    en: {
      documentType: "Water bill",
      summary:
        "Monthly water bill for February. The amount of ¥4,850 must be paid by March 31, 2025. Payment is accepted at banks and convenience stores.",
      deadlines: [{ id: 1, description: "Bill payment — by March 31, 2025" }],
      amounts: [{ id: 1, description: "Total: ¥4,850" }],
      actions: [
        {
          id: 1,
          description: "Pay the bill by March 31, 2025 at a bank or convenience store",
        },
      ],
      references: [
        { id: 1, translation: "Payment deadline: March 31, 2025 (Monday)" },
        { id: 2, translation: "Amount charged: ¥4,850" },
        { id: 3, translation: "Payment methods: bank transfer or convenience store payment" },
      ],
    },
    tl: {
      documentType: "Bayarin sa tubig",
      summary:
        "Buwanang bayarin sa tubig para sa Pebrero. Ang halagang ¥4,850 ay dapat bayaran bago mag-Marso 31, 2025. Maaaring magbayad sa bangko o convenience store.",
      deadlines: [{ id: 1, description: "Pagbabayad ng bill — bago mag-Marso 31, 2025" }],
      amounts: [{ id: 1, description: "Kabuuan: ¥4,850" }],
      actions: [
        {
          id: 1,
          description:
            "Bayaran ang bill bago mag-Marso 31, 2025 sa bangko o convenience store",
        },
      ],
      references: [
        { id: 1, translation: "Deadline ng pagbabayad: Marso 31, 2025 (Lunes)" },
        { id: 2, translation: "Halagang sinisingil: ¥4,850" },
        { id: 3, translation: "Paraan ng pagbabayad: bank transfer o convenience store" },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Documento 2 — Aviso de tentativa de entrega (日本郵便)
// ---------------------------------------------------------------------------

const deliverySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420" role="img" aria-label="Documento fictício: aviso de entrega">
  <rect width="320" height="420" fill="#fff9f0" rx="4"/>
  <rect x="0" y="0" width="320" height="52" fill="#c0392b"/>
  <text x="160" y="22" font-family="serif" font-size="13" fill="#fff" text-anchor="middle">日本郵便株式会社</text>
  <text x="160" y="42" font-family="serif" font-size="10" fill="#ffcccc" text-anchor="middle">不在連絡票</text>
  <line x1="20" y1="62" x2="300" y2="62" stroke="#e0b090" stroke-width="0.8"/>
  <text x="20" y="84" font-family="serif" font-size="9" fill="#444">お届け先：　山田　太郎　様</text>
  <text x="20" y="100" font-family="serif" font-size="9" fill="#444">お届け日時：　令和７年３月１０日　午後２時頃</text>
  <text x="20" y="116" font-family="serif" font-size="9" fill="#444">差出人：　〇〇通販株式会社</text>
  <line x1="20" y1="128" x2="300" y2="128" stroke="#ddd" stroke-width="0.5"/>
  <rect x="20" y="138" width="280" height="44" fill="#fff3f0" rx="3"/>
  <text x="30" y="156" font-family="serif" font-size="9" fill="#c0392b">ご不在のため、お荷物をお届けできませんでした。</text>
  <text x="30" y="174" font-family="serif" font-size="9" fill="#c0392b">下記の方法で再配達をご依頼ください。</text>
  <line x1="20" y1="192" x2="300" y2="192" stroke="#ddd" stroke-width="0.5"/>
  <text x="20" y="210" font-family="serif" font-size="9" fill="#444">保管期限：　令和７年３月１７日</text>
  <text x="20" y="226" font-family="serif" font-size="9" fill="#444">お問い合わせ番号：　１２３４－５６７８－９０１２</text>
  <line x1="20" y1="238" x2="300" y2="238" stroke="#ddd" stroke-width="0.5"/>
  <text x="20" y="256" font-family="serif" font-size="8" fill="#666">■ 再配達のお申し込み方法</text>
  <text x="20" y="270" font-family="serif" font-size="8" fill="#888">・Web：郵便局公式サイトから</text>
  <text x="20" y="284" font-family="serif" font-size="8" fill="#888">・電話：０１２０－xxx－xxx（架空の番号・24時間受付）</text>
  <text x="20" y="298" font-family="serif" font-size="8" fill="#888">・QRコード：裏面をご参照ください</text>
  <line x1="20" y1="312" x2="300" y2="312" stroke="#ddd" stroke-width="0.5"/>
  <text x="20" y="330" font-family="serif" font-size="8" fill="#888">※保管期限を過ぎた場合、差出人に返送されます。</text>
  <text x="20" y="344" font-family="serif" font-size="8" fill="#888">※お荷物の種類：宅急便（冷蔵）</text>
  <text x="160" y="408" font-family="serif" font-size="7" fill="#aaa" text-anchor="middle">※このドキュメントは架空のサンプルです／FICTIONAL DOCUMENT</text>
</svg>`;

const deliveryResult: AnalysisResult = {
  documentType: "Aviso de tentativa de entrega",
  summary:
    "O carteiro tentou entregar uma encomenda mas você não estava. A encomenda ficará guardada até 17 de março de 2025. Você precisa agendar uma nova entrega pelo site ou telefone.",
  deadlines: [
    {
      id: 1,
      description: "Prazo de guarda da encomenda",
      dateRaw: "令和７年３月１７日",
      dateIso: "2025-03-17",
      referenceId: 1,
    },
  ],
  amounts: [],
  actions: [
    {
      id: 1,
      description:
        "Agendar nova entrega pelo site dos Correios ou pelo telefone fictício 0120-xxx-xxx",
      referenceId: 2,
    },
    {
      id: 2,
      description:
        "Usar o número de rastreamento 1234-5678-9012 ao ligar ou acessar o site",
      referenceId: 3,
    },
  ],
  references: [
    {
      id: 1,
      japaneseText: "保管期限：令和７年３月１７日",
      confidence: "ok",
    },
    {
      id: 2,
      japaneseText: "再配達のお申し込み方法：Web・電話：０１２０－xxx－xxx（架空の番号）",
      confidence: "ok",
    },
    {
      id: 3,
      japaneseText: "お問い合わせ番号：１２３４－５６７８－９０１２",
      confidence: "ok",
    },
  ],
  partiallyIllegible: false,
  translations: {
    pt: {
      documentType: "Aviso de tentativa de entrega",
      summary:
        "O carteiro tentou entregar uma encomenda mas você não estava. A encomenda ficará guardada até 17 de março de 2025. Você precisa agendar uma nova entrega pelo site ou telefone.",
      deadlines: [
        { id: 1, description: "Prazo de guarda da encomenda — até 17 de março de 2025" },
      ],
      amounts: [],
      actions: [
        {
          id: 1,
          description:
            "Agendar nova entrega pelo site dos Correios ou pelo telefone fictício 0120-xxx-xxx",
        },
        {
          id: 2,
          description:
            "Usar o número de rastreamento 1234-5678-9012 ao reagendar",
        },
      ],
      references: [
        { id: 1, translation: "Prazo de guarda: 17 de março de 2025" },
        { id: 2, translation: "Como reagendar a entrega: pelo site ou pelo telefone fictício 0120-xxx-xxx" },
        { id: 3, translation: "Número de rastreamento: 1234-5678-9012" },
      ],
    },
    en: {
      documentType: "Missed delivery notice",
      summary:
        "The delivery person attempted to deliver a package but you were not home. The package will be held until March 17, 2025. You need to reschedule delivery online or by phone.",
      deadlines: [
        { id: 1, description: "Package storage deadline — by March 17, 2025" },
      ],
      amounts: [],
      actions: [
        {
          id: 1,
          description:
            "Reschedule delivery at the Japan Post website or by calling fictional number 0120-xxx-xxx",
        },
        {
          id: 2,
          description:
            "Use tracking number 1234-5678-9012 when rescheduling",
        },
      ],
      references: [
        { id: 1, translation: "Storage deadline: March 17, 2025" },
        { id: 2, translation: "How to reschedule delivery: online or by calling fictional number 0120-xxx-xxx" },
        { id: 3, translation: "Tracking number: 1234-5678-9012" },
      ],
    },
    tl: {
      documentType: "Abiso ng hindi naihatid na pakete",
      summary:
        "Sinubukan ng delivery person na maihatid ang pakete ngunit wala kayo sa bahay. Ang pakete ay itatago hanggang Marso 17, 2025. Kailangan ninyong mag-schedule ng bagong paghahatid sa online o sa telepono.",
      deadlines: [
        { id: 1, description: "Deadline ng pag-iingat ng pakete — bago mag-Marso 17, 2025" },
      ],
      amounts: [],
      actions: [
        {
          id: 1,
          description:
            "Mag-schedule ng bagong paghahatid sa Japan Post website o tumawag sa kathang-isip na numero 0120-xxx-xxx",
        },
        {
          id: 2,
          description:
            "Gamitin ang tracking number 1234-5678-9012 sa pag-reschedule",
        },
      ],
      references: [
        { id: 1, translation: "Deadline ng pag-iingat: Marso 17, 2025" },
        { id: 2, translation: "Paano mag-reschedule: sa website o sa kathang-isip na numero 0120-xxx-xxx" },
        { id: 3, translation: "Tracking number: 1234-5678-9012" },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Documento 3 — Notificação de imposto municipal (市役所)
// ---------------------------------------------------------------------------

const taxNoticeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420" role="img" aria-label="Documento fictício: notificação de imposto municipal">
  <rect width="320" height="420" fill="#f4f8f0" rx="4"/>
  <rect x="0" y="0" width="320" height="52" fill="#2d5a1b"/>
  <text x="160" y="22" font-family="serif" font-size="13" fill="#d4e8c0" text-anchor="middle">〇〇市役所　税務課</text>
  <text x="160" y="42" font-family="serif" font-size="10" fill="#a0c880" text-anchor="middle">令和７年度　住民税　納税通知書</text>
  <line x1="20" y1="62" x2="300" y2="62" stroke="#a0c880" stroke-width="0.8"/>
  <text x="20" y="82" font-family="serif" font-size="9" fill="#444">納税義務者：　山田　太郎　様</text>
  <text x="20" y="98" font-family="serif" font-size="9" fill="#444">住所：　〇〇市〇〇区〇〇町１－２－３</text>
  <line x1="20" y1="110" x2="300" y2="110" stroke="#ddd" stroke-width="0.5"/>
  <rect x="20" y="120" width="280" height="80" fill="#eef4e8" rx="3"/>
  <text x="160" y="140" font-family="serif" font-size="9" fill="#2d5a1b" text-anchor="middle">年税額</text>
  <text x="160" y="164" font-family="serif" font-size="20" fill="#2d5a1b" text-anchor="middle" font-weight="bold">￥８４，３００</text>
  <text x="160" y="186" font-family="serif" font-size="8" fill="#666" text-anchor="middle">（所得割：¥72,300　均等割：¥12,000）</text>
  <line x1="20" y1="210" x2="300" y2="210" stroke="#ddd" stroke-width="0.5"/>
  <text x="20" y="228" font-family="serif" font-size="9" fill="#333" font-weight="bold">■ 納付期限と納付額</text>
  <rect x="20" y="236" width="280" height="22" fill="#2d5a1b" rx="2"/>
  <text x="40" y="251" font-family="serif" font-size="8" fill="#fff">第１期</text>
  <text x="120" y="251" font-family="serif" font-size="8" fill="#fff">令和７年６月３０日</text>
  <text x="240" y="251" font-family="serif" font-size="8" fill="#fff">￥２１，１００</text>
  <rect x="20" y="260" width="280" height="22" fill="#e8f0e0" rx="2"/>
  <text x="40" y="275" font-family="serif" font-size="8" fill="#333">第２期</text>
  <text x="120" y="275" font-family="serif" font-size="8" fill="#333">令和７年８月３１日</text>
  <text x="240" y="275" font-family="serif" font-size="8" fill="#333">￥２１，１００</text>
  <line x1="20" y1="292" x2="300" y2="292" stroke="#ddd" stroke-width="0.5"/>
  <text x="20" y="310" font-family="serif" font-size="8" fill="#888">※残り２期分（第３・４期）は別途通知いたします。</text>
  <text x="20" y="324" font-family="serif" font-size="8" fill="#888">※口座振替をご利用の場合は手続き不要です。</text>
  <text x="20" y="338" font-family="serif" font-size="8" fill="#888">※お問い合わせ：市役所税務課　０１２０－yyy－yyy（架空の番号）</text>
  <text x="160" y="408" font-family="serif" font-size="7" fill="#aaa" text-anchor="middle">※このドキュメントは架空のサンプルです／FICTIONAL DOCUMENT</text>
</svg>`;

const taxNoticeResult: AnalysisResult = {
  documentType: "Notificação de imposto municipal (住民税)",
  summary:
    "Este exemplo mostra as duas primeiras parcelas do imposto municipal (住民税) com vencimento em 30 de junho e 31 de agosto de 2025. O documento indica um total anual de ¥84.300 — as parcelas 3ª e 4ª serão notificadas separadamente. Se já utiliza débito automático para este imposto, o aviso informa que não é necessário solicitar o pagamento manual.",
  deadlines: [
    {
      id: 1,
      description: "1ª parcela do imposto municipal",
      dateRaw: "令和７年６月３０日",
      dateIso: "2025-06-30",
      referenceId: 1,
    },
    {
      id: 2,
      description: "2ª parcela do imposto municipal",
      dateRaw: "令和７年８月３１日",
      dateIso: "2025-08-31",
      referenceId: 2,
    },
  ],
  amounts: [
    {
      id: 1,
      description: "Total anual indicado no documento (parcelas 3ª e 4ª notificadas separadamente)",
      valueRaw: "￥８４，３００",
      referenceId: 3,
    },
    {
      id: 2,
      description: "Valor da 1ª parcela",
      valueRaw: "￥２１，１００",
      referenceId: 1,
    },
    {
      id: 3,
      description: "Valor da 2ª parcela",
      valueRaw: "￥２１，１００",
      referenceId: 2,
    },
  ],
  actions: [
    {
      id: 1,
      description:
        "Pagar a 1ª parcela (¥21.100) até 30 de junho de 2025 — se não tiver débito automático",
      referenceId: 1,
    },
    {
      id: 2,
      description:
        "Pagar a 2ª parcela (¥21.100) até 31 de agosto de 2025 — se não tiver débito automático",
      referenceId: 2,
    },
  ],
  references: [
    {
      id: 1,
      japaneseText: "第１期　令和７年６月３０日　￥２１，１００",
      confidence: "ok",
    },
    {
      id: 2,
      japaneseText: "第２期　令和７年８月３１日　￥２１，１００",
      confidence: "ok",
    },
    {
      id: 3,
      japaneseText: "年税額　￥８４，３００",
      confidence: "ok",
    },
    {
      id: 4,
      japaneseText: "口座振替をご利用の場合は手続き不要です。",
      confidence: "ok",
    },
  ],
  partiallyIllegible: false,
  translations: {
    pt: {
      documentType: "Notificação de imposto municipal (住民税)",
      summary:
        "Este exemplo mostra as duas primeiras parcelas do imposto municipal. O documento indica um total anual de ¥84.300 — as parcelas 3ª e 4ª serão notificadas separadamente. Se já utiliza débito automático para este imposto, o aviso informa que não é necessário solicitar o pagamento manual.",
      deadlines: [
        { id: 1, description: "1ª parcela — 30 de junho de 2025" },
        { id: 2, description: "2ª parcela — 31 de agosto de 2025" },
      ],
      amounts: [
        { id: 1, description: "Total anual indicado no documento (parcelas 3ª e 4ª notificadas separadamente): ¥84.300" },
        { id: 2, description: "1ª parcela: ¥21.100" },
        { id: 3, description: "2ª parcela: ¥21.100" },
      ],
      actions: [
        {
          id: 1,
          description: "Pagar 1ª parcela (¥21.100) até 30 de junho de 2025 — se não utilizar débito automático",
        },
        {
          id: 2,
          description: "Pagar 2ª parcela (¥21.100) até 31 de agosto de 2025 — se não utilizar débito automático",
        },
      ],
      references: [
        { id: 1, translation: "1ª parcela: 30 de junho de 2025 — ¥21.100" },
        { id: 2, translation: "2ª parcela: 31 de agosto de 2025 — ¥21.100" },
        { id: 3, translation: "Total anual indicado no documento: ¥84.300 (as parcelas 3ª e 4ª serão notificadas separadamente)" },
        { id: 4, translation: "Se já utiliza débito automático (口座振替) para este imposto, o aviso informa que não é necessário solicitar o pagamento manual." },
      ],
    },
    en: {
      documentType: "Resident tax notice (住民税)",
      summary:
        "Annual resident tax bill totaling ¥84,300. The first two installments are due on June 30 and August 31, 2025. If you have automatic bank transfer set up, no action is needed.",
      deadlines: [
        { id: 1, description: "1st installment — June 30, 2025" },
        { id: 2, description: "2nd installment — August 31, 2025" },
      ],
      amounts: [
        { id: 1, description: "Annual total: ¥84,300" },
        { id: 2, description: "1st installment: ¥21,100" },
        { id: 3, description: "2nd installment: ¥21,100" },
      ],
      actions: [
        {
          id: 1,
          description:
            "Pay 1st installment (¥21,100) by June 30, 2025 — if not on auto-pay",
        },
        {
          id: 2,
          description:
            "Pay 2nd installment (¥21,100) by August 31, 2025 — if not on auto-pay",
        },
      ],
      references: [
        { id: 1, translation: "1st installment: June 30, 2025 — ¥21,100" },
        { id: 2, translation: "2nd installment: August 31, 2025 — ¥21,100" },
        { id: 3, translation: "Annual tax total: ¥84,300" },
        { id: 4, translation: "If you use automatic bank transfer (口座振替), no action is required." },
      ],
    },
    tl: {
      documentType: "Abiso ng buwis sa munisipyo (住民税)",
      summary:
        "Taunang buwis sa munisipyo na kabuuang ¥84,300. Ang unang dalawang hulog ay dapat bayaran sa Hunyo 30 at Agosto 31, 2025. Kung mayroon kang awtomatikong pagbabayad sa bangko, hindi na kailangan ng aksyon.",
      deadlines: [
        { id: 1, description: "1st hulog — Hunyo 30, 2025" },
        { id: 2, description: "2nd hulog — Agosto 31, 2025" },
      ],
      amounts: [
        { id: 1, description: "Kabuuang taunang: ¥84,300" },
        { id: 2, description: "1st hulog: ¥21,100" },
        { id: 3, description: "2nd hulog: ¥21,100" },
      ],
      actions: [
        {
          id: 1,
          description:
            "Bayaran ang 1st hulog (¥21,100) bago mag-Hunyo 30, 2025 — kung walang auto-pay",
        },
        {
          id: 2,
          description:
            "Bayaran ang 2nd hulog (¥21,100) bago mag-Agosto 31, 2025 — kung walang auto-pay",
        },
      ],
      references: [
        { id: 1, translation: "1st hulog: Hunyo 30, 2025 — ¥21,100" },
        { id: 2, translation: "2nd hulog: Agosto 31, 2025 — ¥21,100" },
        { id: 3, translation: "Kabuuang taunang buwis: ¥84,300" },
        { id: 4, translation: "Kung gumagamit ka ng awtomatikong bank transfer (口座振替), hindi na kailangan ng aksyon." },
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: "water-bill",
    nameKey: "demo.doc1Name",
    placeholderSvg: waterBillSvg,
    result: waterBillResult,
  },
  {
    id: "delivery-notice",
    nameKey: "demo.doc2Name",
    placeholderSvg: deliverySvg,
    result: deliveryResult,
  },
  {
    id: "tax-notice",
    nameKey: "demo.doc3Name",
    placeholderSvg: taxNoticeSvg,
    result: taxNoticeResult,
  },
];

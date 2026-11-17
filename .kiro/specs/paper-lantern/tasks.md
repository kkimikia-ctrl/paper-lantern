# Paper Lantern — Tarefas de implementação v0.3

> Kiroween 2026 · Atualizado após implementação do Grupo 1, Tailwind e interface completa de demo

Legenda de status: ✅ concluído · 🔲 pendente · ⚠️ pendente com verificação manual necessária

---

## Grupo 1 — Projeto base

### ✅ T-01 · Estrutura do projeto Next.js + TypeScript
- `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs` criados
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` criados
- Tailwind v4 adicionado (`tailwindcss`, `@tailwindcss/postcss`) com `postcss.config.mjs`
- `npm audit` confirmou 0 vulnerabilidades após overrides de `postcss` e `sharp`
- Verificado: `npm run dev` abre `localhost:3000` corretamente

### ⚠️ T-02 · Configurar shadcn/ui
- Substituído pela abordagem de componentes próprios com Tailwind — shadcn/ui não foi necessário para o MVP de demo
- Pode ser adicionado em iteração futura se necessário

### ✅ T-03 · Variáveis de ambiente e .gitignore
- `.gitignore` criado com `.env*.local` bloqueado
- `.env.example` criado com `ANALYZE_API_KEY`, `ANALYZE_MODEL`, `ANALYZE_API_URL`

### ✅ T-04 · Schema de tipos e validação Zod
- `src/lib/schema.ts` criado com todos os tipos
- 15 testes unitários — todos passaram

### ✅ T-05 · i18n simples
- `src/i18n/pt.json`, `en.json`, `tl.json` criados e atualizados com strings de demo
- `src/hooks/useLanguage.ts` e `src/context/LanguageContext.tsx` criados
- 9 testes unitários — todos passaram

---

## Grupo 2 — Route handler de análise

### 🔲 T-06 · Criar prompt versionado
- Pré-requisito: T-04 ✅

### 🔲 T-07 · Implementar route handler `/api/analyze`
- Pré-requisito: T-03 ✅, T-04 ✅, T-06 🔲
- Esqueleto já existe em `src/app/api/analyze/route.ts`

---

## Grupo 3 — Interface principal

### ✅ T-08 · Tela inicial — HomeView com UploadZone
- `src/components/HomeView.tsx` criado com visual de lanterna, fundo escuro com glow
- Botão de upload presente mas desabilitado (tooltip explica que API não está configurada)
- Layout responsivo desde 375 px
- ⚠️ **Verificação manual necessária:** conferir em `localhost:3000`

### ✅ T-09 · LanguageSelector e botão demo
- `src/components/LanguageSelector.tsx` criado — PT / EN / Filipino com flags
- Botão "Ver demonstração" na HomeView ativa o modo demo
- `src/context/LanguageContext.tsx` provê idioma para toda a árvore

### 🔲 T-10 · Integrar upload com `/api/analyze`
- Pré-requisito: T-07 🔲, T-08 ✅

---

## Grupo 4 — Tela de resultado

### ✅ T-11 · Componente AnalysisResult
- `src/components/AnalysisResult.tsx` criado
- Renderiza tipo, resumo, prazos, valores — troca de idioma sem nova chamada à API
- Aviso de IA fixo no rodapé

### ✅ T-12 · Componente ReferenceList
- `src/components/ReferenceList.tsx` criado
- Badges numerados, indicadores de confiança, aviso de texto gerado pelo modelo
- ⚠️ **Verificação manual necessária:** testar em `localhost:3000` → demo

### ✅ T-13 · Dados fictícios e DemoBanner
- `src/lib/demoData.ts` criado com 3 documentos: fatura de água, aviso de entrega, imposto municipal
- SVG inline para cada documento (sem dependências externas)
- `src/components/DemoBanner.tsx` com banner amarelo fixo no topo
- `src/components/DemoView.tsx` orquestra seleção, SVG e resultado
- Fluxo real nunca usa dados de demo (isolamento por `screen` em `page.tsx`)

### ✅ T-14 · Componente ActionChecklist
- `src/components/ActionChecklist.tsx` criado
- Checkboxes acessíveis por teclado, estado em memória de sessão (React state)
- Contador ao vivo, links para referências, risco visual ao marcar

---

## Grupo 5 — Exportação de calendário

### ✅ T-15 · Gerador de .ics no browser
- `src/lib/icsGenerator.ts` criado — geração 100% no cliente
- Eventos all-day (sem horário inventado), trecho japonês na descrição
- `src/lib/icsGenerator.test.ts` com 9 testes
- ⚠️ **Verificação manual necessária:** rodar `npm test` para confirmar os novos testes

### ✅ T-16 · Modal de confirmação de datas
- `src/components/CalendarExportModal.tsx` criado
- Datas pré-preenchidas do modelo, editáveis antes de exportar
- Datas incertas (null) ficam em destaque e bloqueiam o botão de exportar
- Prazos exportados como all-day, nenhum horário inventado

---

## Grupo 6 — Qualidade e entrega

### 🔲 T-17 · Auditoria de acessibilidade
- Pré-requisito: T-08–T-16 ✅ (parcial — T-10 ainda pendente)
- Componentes criados usam `aria-*`, `role`, foco visível, contraste alto

### 🔲 T-18 · Auditoria de privacidade
- Pré-requisito: T-07 🔲

### 🔲 T-19 · Testes de integração — fluxo completo
- Pré-requisito: T-10 🔲

### 🔲 T-20 · README e .env.example finais
- Pré-requisito: T-19 🔲

---

## Itens fora desta lista (pós-MVP)

- Autenticação e histórico
- Suporte a PDF
- Idiomas adicionais
- Bounding boxes
- Integração direta com Google Calendar / Apple Calendar

---

## Grupo 6 — Qualidade e entrega

### 🔲 T-17 · Auditoria de acessibilidade
- Pré-requisito: T-08 a T-16
- Verificar contraste 4,5:1 em todos os textos
- Testar navegação completa por teclado (Tab, Enter, Escape nos modais)
- Adicionar `aria-label` e `role` onde necessário
- Testar com leitor de tela (NVDA ou VoiceOver)

### 🔲 T-18 · Auditoria de privacidade
- Pré-requisito: T-07, T-15
- Confirmar que nenhum middleware loga bodies de request
- Confirmar que a imagem não aparece em nenhum log ou variável de módulo
- Confirmar que `.env.local` não está no repositório
- Revisar headers de resposta (sem cache de conteúdo sensível)

### 🔲 T-19 · Testes de integração — fluxo completo
- Pré-requisito: T-10, T-11, T-12, T-14, T-16
- Fluxo demo: botão → resultado fictício → checklist → exportação .ics
- Fluxo real com mock da API: upload → análise → resultado → exportação
- Fluxo de erro: API não configurada → mensagem correta exibida

### 🔲 T-20 · README e .env.example finais
- Pré-requisito: T-19
- README com: propósito, como rodar localmente, como configurar a chave do modelo escolhido, como usar o modo demo
- Confirmar que `.env.example` reflete todas as variáveis usadas

---

## Ordem de execução sugerida

```
T-01 → T-02, T-03, T-04, T-05
T-04 → T-06
T-03 + T-04 + T-06 → T-07
T-05 → T-08, T-09
T-07 + T-08 → T-10
T-04 + T-05 → T-11
T-11 → T-12, T-14
T-04 → T-13
T-04 → T-15
T-15 + T-11 → T-16
T-08..T-16 → T-17, T-18, T-19
T-19 → T-20
```

---

## Itens fora desta lista (pós-MVP)

- Autenticação e histórico
- Suporte a PDF
- Idiomas adicionais
- Bounding boxes
- Integração direta com Google Calendar / Apple Calendar

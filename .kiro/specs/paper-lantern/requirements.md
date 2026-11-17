# Paper Lantern — Requisitos v0.2

> Kiroween 2026 · Decisões de design incorporadas · Sem implementação ainda

---

## Contexto

Estrangeiros no Japão recebem cartas em japonês que podem conter prazos, valores a pagar e ações obrigatórias. O Paper Lantern fotografa a carta e devolve uma explicação clara no idioma do usuário, sempre ancorada nos trechos originais transcritos do documento. O app nunca inventa conteúdo que não conseguiu ler com confiança.

---

## Decisões de arquitetura incorporadas

| Decisão | Escolha |
|---------|---------|
| Modelo de análise | Modelo multimodal único; chamado exclusivamente pelo servidor via route handler do Next.js |
| Chave de API | Variável de ambiente no servidor; nunca exposta ao navegador nem commitada no repositório |
| Ancoragem | Referências numeradas: cada prazo, valor ou ação aponta para um trecho japonês transcrito; as referências não garantem que a leitura está correta |
| Stack | Next.js + TypeScript; route handler `/api/analyze` como único ponto de chamada à API externa |
| Geração de .ics | No navegador (sem passar pelo servidor); usuário confirma e corrige datas antes de exportar |
| Privacidade | Sem banco de dados, sem logs de conteúdo, sem analytics de documentos |

---

## Escopo da primeira versão (MVP)

- Somente web app (sem app nativo)
- Três idiomas de saída: Português, English, Filipino (Tagalog)
- Suporte a JPEG e PNG; sem vídeo, sem PDF
- Sem autenticação; sem persistência de conteúdo no servidor
- Modo demonstração com 3 documentos fictícios, sem chamar a API
- Upload real nunca retorna resultados simulados; se a API não estiver configurada, o app informa isso

---

## Requisitos funcionais

### RF-01 — Upload de imagem

**Como** usuário, **quero** enviar uma foto de uma carta japonesa **para** iniciar a análise.

| # | Critério de aceitação |
|---|---|
| RF-01-1 | O app aceita JPEG e PNG de até 10 MB arrastados ou selecionados via botão. |
| RF-01-2 | Imagens acima de 10 MB são rejeitadas com mensagem explicando o limite antes de qualquer envio ao servidor. |
| RF-01-3 | O app exibe pré-visualização da imagem antes de processar. |
| RF-01-4 | O usuário pode cancelar e trocar a imagem antes de confirmar o envio. |

---

### RF-02 — Escolha de idioma de saída

**Como** usuário, **quero** escolher o idioma da explicação antes de processar.

| # | Critério de aceitação |
|---|---|
| RF-02-1 | O seletor oferece Português, English e Filipino (Tagalog). |
| RF-02-2 | O idioma escolhido persiste durante a sessão via estado local. |
| RF-02-3 | Trocar o idioma após uma análise re-renderiza a explicação já recebida sem nova chamada à API, pois a resposta do servidor inclui os três idiomas simultaneamente. |
| RF-02-4 | A interface (rótulos, botões, mensagens de erro, avisos) é exibida no idioma escolhido. |

---

### RF-03 — Análise e explicação

**Como** usuário, **quero** receber uma explicação clara da carta **para** entender o que ela diz e o que preciso fazer.

| # | Critério de aceitação |
|---|---|
| RF-03-1 | A explicação apresenta: tipo do documento, resumo em até 3 frases, lista de prazos (data + descrição), lista de valores monetários, lista de ações requeridas. |
| RF-03-2 | Cada prazo, valor e ação carrega uma referência numérica (ex.: [1]) que corresponde a um trecho japonês transcrito do documento, listado em seção separada "Trechos de referência". |
| RF-03-3 | As referências são apresentadas como transcrições do texto original, não como confirmação de que a interpretação está correta. Um aviso fixo na seção diz: "Os trechos abaixo foram extraídos pelo modelo — confirme informações importantes diretamente na carta." |
| RF-03-4 | Trechos que o modelo não conseguiu ler com confiança são marcados com ⚠ e a legenda "trecho ilegível — não interpretado". Nenhum conteúdo é inventado para substituí-los. |
| RF-03-5 | Se a imagem inteira for ilegível, o app exibe mensagem de falha com orientação para tirar nova foto; nenhuma explicação parcial é exibida. |
| RF-03-6 | Se a imagem não for reconhecida como documento em japonês, o app informa isso ao usuário em vez de processar. |
| RF-03-7 | O route handler valida a resposta do modelo contra um schema definido; se a resposta estiver malformada, retorna erro 422 com mensagem ao usuário em vez de exibir dados parciais. |
| RF-03-8 | Indicador de progresso é exibido durante o processamento. Após 30 s sem resposta, o app informa timeout e permite tentar novamente. |
| RF-03-9 | Se a variável de ambiente da API não estiver configurada, o servidor retorna mensagem específica: "A análise de imagens não está disponível nesta instalação." O app exibe essa mensagem sem simular resultados. |

---

### RF-04 — Checklist de ações

**Como** usuário, **quero** marcar ações como concluídas **para** acompanhar o que já fiz.

| # | Critério de aceitação |
|---|---|
| RF-04-1 | Cada ação requerida identificada em RF-03-1 aparece como item de checklist marcável. |
| RF-04-2 | O estado do checklist é mantido em memória de sessão (não em localStorage, para não persistir conteúdo sensível entre sessões). |
| RF-04-3 | Um contador mostra "X de Y concluídas" atualizado em tempo real. |

---

### RF-05 — Exportação de lembretes para calendário

**Como** usuário, **quero** exportar os prazos para meu calendário **para** não perdê-los.

| # | Critério de aceitação |
|---|---|
| RF-05-1 | Antes de gerar o .ics, o app exibe um formulário de confirmação com cada prazo identificado, mostrando a data extraída e permitindo corrigi-la. |
| RF-05-2 | Prazos que contêm apenas data (sem horário) são exportados como eventos de dia inteiro (all-day); nenhum horário é inventado. |
| RF-05-3 | Cada evento inclui: título no idioma escolhido, data confirmada pelo usuário, e nota com o trecho japonês de referência. |
| RF-05-4 | O arquivo .ics é gerado inteiramente no navegador; nenhum dado de prazo ou trecho é enviado ao servidor nesta etapa. |
| RF-05-5 | Se nenhum prazo for identificado, o botão de exportação é desabilitado com tooltip explicativo. |

---

### RF-06 — Modo demonstração

**Como** avaliador do Kiroween, **quero** ver o app funcionando sem precisar de uma carta real **para** avaliar a experiência sem depender de API configurada.

| # | Critério de aceitação |
|---|---|
| RF-06-1 | O app oferece 3 documentos fictícios pré-carregados: fatura de serviço público (水道局), aviso de entrega (日本郵便), notificação de imposto municipal (市役所). |
| RF-06-2 | No modo demo, a análise usa exclusivamente dados embutidos no código — nenhuma chamada à API é feita, nem ao route handler `/api/analyze`. |
| RF-06-3 | Um banner fixo e claramente visível indica "📄 DOCUMENTO FICTÍCIO — apenas para demonstração" durante toda a sessão demo. |
| RF-06-4 | Os documentos fictícios usam japonês plausível escrito para o app; não reproduzem documentos oficiais reais. |
| RF-06-5 | Um botão "Ver demonstração" na tela inicial carrega o primeiro documento sem exigir upload. |
| RF-06-6 | Upload real (RF-01) nunca carrega dados do modo demo; os dois fluxos são mutuamente exclusivos no código. |

---

## Requisitos não-funcionais

| ID | Requisito | Critério |
|----|-----------|----------|
| RNF-01 | Privacidade | A imagem é enviada ao servidor apenas para repassar ao modelo; não é gravada em disco, banco, log de aplicação ou serviço de analytics. A resposta é armazenada apenas em memória de sessão do cliente. |
| RNF-02 | Segurança da chave | A chave da API vive somente em variável de ambiente do servidor (`ANALYZE_API_KEY`). O repositório deve ter um `.env.example` sem valores reais e `.env*.local` no `.gitignore`. |
| RNF-03 | Acessibilidade | WCAG 2.1 AA: contraste mínimo 4,5:1, navegação por teclado, texto alternativo em elementos de imagem. |
| RNF-04 | Responsividade | Usável em tela de celular (mínimo 375 px de largura) e desktop. |
| RNF-05 | Aviso de IA | Cada resultado inclui o aviso curto: "Gerado por IA — confirme informações importantes diretamente na carta." Sem menção obrigatória a advogado ou tradutor. |
| RNF-06 | Modelo configurável | O modelo de análise é definido por variável de ambiente (`ANALYZE_MODEL`). A escolha do modelo e a verificação de custos ocorrem na etapa T-07, consultando a documentação oficial vigente. |

---

## Fora do escopo (MVP)

- Autenticação e histórico de cartas
- Upload de PDF ou imagens multipágina
- Idiomas adicionais além dos três definidos
- Integração direta com apps de calendário (apenas .ics por download)
- Suporte a documentos que não sejam cartas ou avisos formais
- Modo offline / modelo local
- Bounding boxes ou marcação visual sobre a imagem

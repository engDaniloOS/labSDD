# Research: Cancelamento de Pedido Antes do Envio

Nenhum item ficou em `NEEDS CLARIFICATION` no Technical Context: o pedido do usuário já
definiu endpoint, dependências e test runner, e cada escolha foi confirmada contra o código e
a configuração reais do repositório (`package.json`, `tsconfig.json`, `src/pedidos/*`).

## Test runner e chamadas HTTP nos testes

**Decision**: Usar `node:test` (nativo do Node) executado via `tsx`, chamando o `app`
(retornado por `criarApp()` em `src/app.ts`) com `app.listen(0)` em porta efêmera e `fetch`
nativo do Node para as requisições.

**Rationale**: `tsx` já é devDependency do projeto (usada em `dev`/`start`); não há test
runner configurado ainda. `node:test` evita adicionar `jest`/`vitest` só para esta feature
(Princípio IV — mudança pequena). `fetch` é nativo a partir do Node 18+ (o projeto exige
Node >= 24.18), então não é preciso adicionar `supertest`.

**Alternatives considered**:
- `supertest` + `jest`/`vitest`: mais familiar, mas adiciona duas dependências novas para uma
  mudança pequena e isolada.
- `supertest` sozinho sobre `node:test`: evitaria `app.listen`, mas também seria uma
  dependência nova só para esta feature; `fetch` nativo já resolve sem isso.

## Formato dos erros da rota nova (Problem Details, RFC 9457)

**Decision**: Erros de `POST /pedidos/:id/cancelamento` respondem com
`Content-Type: application/problem+json` e corpo `{ type, title, status, detail, instance }`,
usando URIs relativas para `type` (ex.: `/problemas/pedido-nao-encontrado`), já que a API não
publica um domínio de referência para tipos de problema.

- 404 `/problemas/pedido-nao-encontrado` — pedido informado não existe.
- 409 `/problemas/pedido-nao-cancelavel` — pedido existe, mas o status atual (`enviado`,
  `entregue`, ou já `cancelado`) impede o cancelamento; `detail` cita o status atual para que
  "quem tentou precisa entender por quê" (spec, User Story 2).

**Rationale**: RFC 9457 permite URIs relativas em `type` (resolvidas contra a URI da
requisição); um domínio fixo (`https://...`) seria inventado sem necessidade. 409 Conflict é o
código HTTP padrão para "requisição conflita com o estado atual do recurso", que é exatamente
o caso de um pedido não cancelável. Reaproveitar um único tipo de problema (`pedido-nao-
cancelavel`) para enviado/entregue/já-cancelado mantém a mudança pequena (Princípio IV); o
texto em `detail` muda conforme o status atual, então nenhuma informação é perdida.

**Alternatives considered**:
- Um tipo de problema por status (`pedido-ja-enviado`, `pedido-ja-entregue`,
  `pedido-ja-cancelado`): mais granular, mas sem valor adicional para o cliente da API nesta
  feature — aumentaria a superfície sem necessidade.
- Rejeitar com o formato de erro antigo (`{ erro: "..." }` ou `{ message, code }`, já usados em
  `rotas.ts`): violaria o Princípio II, que exige Problem Details para endpoints novos.

## Verbo e caminho do endpoint

**Decision**: `POST /pedidos/:id/cancelamento` (decisão explícita do usuário no prompt de
`/speckit-plan`).

**Rationale**: Segue o padrão REST de "ação sobre um recurso" (sub-recurso nomeado pela ação),
apropriado para uma mudança de estado com efeito colateral (motivo + data de cancelamento)
que não é uma atualização genérica de campos — diferente de um `PATCH /pedidos/:id` com
`status` arbitrário, que abriria a porta para transições de estado não previstas na spec.

**Alternatives considered**:
- `PATCH /pedidos/:id` com `{ status: "cancelado" }`: mais genérico, mas permitiria (ou
  exigiria validar explicitamente) qualquer transição de status pelo mesmo endpoint, quando a
  spec só define a transição de cancelamento.
- `DELETE /pedidos/:id`: semanticamente incorreto — o pedido não é removido, apenas muda de
  status e continua aparecendo na lista (spec, User Story 3).

## Extensão do modelo de status

**Decision**: Adicionar `'cancelado'` ao union `Status` existente em `dados.ts`
(`'criado' | 'pago' | 'enviado' | 'entregue' | 'cancelado'`), e tratar como elegíveis para
cancelamento os status anteriores ao envio: `'criado'` e `'pago'`.

**Rationale**: Os quatro status existentes já definem a ordem do ciclo de vida do pedido; a
regra da spec ("antes de ser enviado" vs. "enviado ou entregue") mapeia diretamente para esses
valores sem precisar de um novo conceito (ex.: um campo booleano separado de "cancelado").

**Alternatives considered**:
- Campo booleano `cancelado: boolean` mantendo o `status` anterior: perderia a exigência da
  spec de que a lista mostre o pedido "com o status cancelado" (User Story 3) como o próprio
  status, não como um atributo adicional.

---

description: "Task list template for feature implementation"
---

# Tasks: Cancelamento de Pedido Antes do Envio

**Input**: Design documents from `/specs/001-cancelar-pedido/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cancelar-pedido.md, quickstart.md

**Tests**: Incluídas — pedidas explicitamente no prompt de `/speckit-plan` (test runner nativo
`node:test` via `tsx`) e exigidas pelo Princípio III da constituição (toda regra de negócio
nova tem teste automatizado).

**Organization**: Tarefas agrupadas pelas user stories do spec.md (US1/US2/US3, por
prioridade).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivo diferente, sem dependência de tarefa incompleta)
- **[Story]**: User story à qual a tarefa pertence (US1, US2, US3)
- Caminhos de arquivo exatos em cada descrição

## Path Conventions

Projeto single: `src/`, `tests/` na raiz do repositório (estrutura já existente em
`src/pedidos/`; `tests/` já referenciado em `tsconfig.json`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Habilitar a execução de testes automatizados — o projeto ainda não tem nenhum
test runner configurado.

- [X] T001 Adicionar o script `"test": "tsx --test tests/**/*.test.ts"` em `package.json`
  (não existe nenhum script de teste hoje; `tsx` já é devDependency).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo de dados e operação de cancelamento compartilhados pelas três user
stories — nenhuma delas pode ser implementada ou testada via HTTP sem isso.

**⚠️ CRITICAL**: Nenhuma user story pode começar antes desta fase estar completa.

- [X] T002 Em `src/pedidos/dados.ts`: adicionar `'cancelado'` ao union `Status` (que passa a
  ser `'criado' | 'pago' | 'enviado' | 'entregue' | 'cancelado'`) e adicionar os campos
  opcionais `canceladoEm?: string` e `motivo?: string` à interface `Pedido`.
- [X] T003 Em `src/pedidos/dados.ts`: implementar a operação `cancelar(id: string, motivo?:
  string)` no objeto retornado por `criarBase()`, ao lado de `listar`/`buscar`/`inserir`.
  Retorna `{ tipo: 'nao-encontrado' }` se não existir pedido com esse `id`; retorna
  `{ tipo: 'nao-cancelavel', statusAtual }` se o `status` atual não estiver em `{'criado',
  'pago'}` (cobre `'enviado'`, `'entregue'` e também `'cancelado'` — ver FR-008 do spec.md);
  caso contrário, muta o pedido para `status: 'cancelado'`, define `canceladoEm` com o
  timestamp atual em ISO 8601 (mesmo formato de `criadoEm`), define `motivo` somente se uma
  string não vazia foi informada, e retorna `{ tipo: 'ok', pedido }`. (depends on T002)
- [X] T004 [P] Em `src/pedidos/serializar.ts`: atualizar `serializarPedido` para incluir
  `motivo` e `canceladoEm` no JSON de saída somente quando definidos no pedido, sem alterar
  os campos já existentes. (depends on T002)

**Checkpoint**: Modelo de dados e operação de cancelamento prontos — as user stories podem
começar.

---

## Phase 3: User Story 1 - Cancelar um pedido elegível (Priority: P1) 🎯 MVP

**Goal**: Operador informa um pedido ainda não enviado e, se quiser, um motivo; o pedido passa
a `status: "cancelado"` com a data do cancelamento registrada.

**Independent Test**: `POST /pedidos/PED-1001/cancelamento` (pedido com status `criado` ou
`pago`) retorna 200 com `status: "cancelado"` e `canceladoEm` preenchido; `GET
/pedidos/PED-1001` confirma a mudança.

### Tests for User Story 1 ⚠️

> Escrever estes testes primeiro; eles devem falhar até a rota existir (T006).

- [X] T005 [US1] Em `tests/pedidos/cancelamento.test.ts` (novo arquivo): testes para (a) pedido
  elegível + motivo → 200, `status: "cancelado"`, `canceladoEm` preenchido, `motivo` igual ao
  enviado; (b) pedido elegível sem motivo → 200, `status: "cancelado"`, campo `motivo` ausente
  no JSON; (c) pedido inexistente (`PED-0000`) → 404, `Content-Type: application/problem+json`,
  `type: "/problemas/pedido-nao-encontrado"`. Subir a API com `criarApp()` + `app.listen(0)` e
  chamar com `fetch` nativo, conforme `research.md`.

### Implementation for User Story 1

- [X] T006 [US1] Em `src/pedidos/rotas.ts`: registrar `POST /pedidos/:id/cancelamento`. Ler
  `motivo` do corpo (opcional) e chamar `base.cancelar(id, motivo)`. Mapear o resultado: `ok` →
  200 com `serializarPedido(pedido)`; `nao-encontrado` → 404 Problem Details (`type:
  "/problemas/pedido-nao-encontrado"`, `title: "Pedido não encontrado"`, `detail` citando o
  `id`); `nao-cancelavel` → 409 Problem Details (`type: "/problemas/pedido-nao-cancelavel"`,
  `title: "Pedido não pode ser cancelado"`, `detail` citando o `id` e o `statusAtual`, conforme
  `contracts/cancelar-pedido.md`). Incluir uma função local para montar a resposta Problem
  Details com `Content-Type: application/problem+json` e `instance` igual ao path da
  requisição. (depends on T003, T004, T005)

**Checkpoint**: User Story 1 funcional de ponta a ponta — pedido elegível pode ser cancelado
via HTTP, com erro Problem Details para pedido inexistente.

---

## Phase 4: User Story 2 - Bloquear cancelamento de pedido enviado ou entregue (Priority: P2)

**Goal**: Pedido `enviado`, `entregue` ou já `cancelado` não pode ser cancelado de novo; quem
tenta recebe uma explicação compreensível do motivo.

**Independent Test**: `POST /pedidos/PED-1003/cancelamento` (status `enviado`) e `POST
/pedidos/PED-1004/cancelamento` (status `entregue`) retornam 409 com Problem Details citando o
status atual.

**Nota**: O branch `nao-cancelavel` de T006 já cobre esses casos (a operação `cancelar()` de
T003 trata `enviado`/`entregue`/`cancelado` da mesma forma). Esta fase adiciona os testes que
comprovam isso — se algum falhar, o ajuste é feito diretamente em T003/T006.

### Tests for User Story 2 ⚠️

- [X] T007 [US2] Em `tests/pedidos/cancelamento.test.ts`: testes para (a) pedido com status
  `enviado` (`PED-1003` da base semente) → 409, Problem Details com `detail` citando
  `"enviado"`; (b) pedido com status `entregue` (`PED-1004`) → 409, `detail` citando
  `"entregue"`; (c) cancelar um pedido que já está `cancelado` (reaproveitar o pedido cancelado
  no teste de US1) → 409, `detail` citando `"cancelado"` (FR-008). (depends on T006)

**Checkpoint**: User Stories 1 e 2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Ver pedidos cancelados na lista (Priority: P3)

**Goal**: Pedido cancelado continua aparecendo em `GET /pedidos`, com `status: "cancelado"` e a
data do cancelamento.

**Independent Test**: Após cancelar um pedido, `GET /pedidos` (sem filtro) inclui esse pedido
com `status: "cancelado"` e `canceladoEm` preenchido.

**Nota**: Nenhuma implementação nova é necessária — `listar()` (em `dados.ts`) já devolve todos
os pedidos independente do status quando chamado sem filtro, e T004 já inclui `canceladoEm` na
serialização. Esta fase só adiciona o teste que comprova o comportamento.

### Tests for User Story 3 ⚠️

- [X] T008 [US3] Em `tests/pedidos/cancelamento.test.ts`: cancelar um pedido elegível e então
  chamar `GET /pedidos` sem filtro; verificar que o pedido aparece na lista com `status:
  "cancelado"` e `canceladoEm` preenchido. (depends on T006, T004)

**Checkpoint**: As três user stories funcionam, isoladamente e em conjunto.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finais que não pertencem a uma única user story.

- [X] T009 [P] Atualizar `docs/api-pedidos.md` com o novo endpoint `POST
  /pedidos/{id}/cancelamento` (requisição, resposta de sucesso e os dois casos de Problem
  Details), seguindo o pedido já existente no topo do arquivo ("Atualize quando mudar a API").
- [X] T010 Validar manualmente os 5 cenários de `quickstart.md` contra a API rodando localmente
  (`npm run dev`), conferindo que batem com o que os testes automatizados cobrem.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente.
- **Foundational (Phase 2)**: Depende do Setup. Bloqueia todas as user stories.
- **User Story 1 (Phase 3)**: Depende da Fase 2. Sem dependência de outras stories.
- **User Story 2 (Phase 4)**: Depende de T006 (rota implementada na Fase 3) — não tem
  implementação própria, só testes sobre o comportamento que T006 já cobre.
- **User Story 3 (Phase 5)**: Depende de T004 e T006 — mesma razão: sem implementação própria.
- **Polish (Phase 6)**: Depende de todas as user stories desejadas estarem completas.

### Within Each User Story

- Testes são escritos antes da implementação em US1 (T005 antes de T006), e devem falhar até
  T006 existir.
- US2 e US3 têm só testes, porque a implementação de T006 (combinada com T002-T004) já cobre o
  comportamento esperado — não há "implementação antes do teste" porque não há implementação
  nova.

### Parallel Opportunities

- T004 pode rodar em paralelo a T003 (arquivos diferentes, ambos dependem só de T002).
- T009 (Polish, documentação) pode rodar em paralelo a qualquer tarefa de teste, já que não
  toca código nem arquivos de teste.
- T005, T007 e T008 editam o mesmo arquivo de teste (`tests/pedidos/cancelamento.test.ts`) em
  sequência — não marcados `[P]` entre si.

---

## Parallel Example: Foundational Phase

```bash
# Depois de T002 (Status/Pedido estendidos em dados.ts):
Task: "Implementar cancelar() em src/pedidos/dados.ts"              # T003
Task: "Atualizar serializarPedido em src/pedidos/serializar.ts"     # T004 [P]
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar a Fase 1 (Setup).
2. Completar a Fase 2 (Foundational) — bloqueia tudo.
3. Completar a Fase 3 (User Story 1) — T005 (testes, devem falhar) → T006 (implementação).
4. **Parar e validar**: rodar `npx tsx --test tests/pedidos/cancelamento.test.ts` e confirmar
   que os testes de US1 passam. Isso já é um incremento demonstrável (MVP).

### Incremental Delivery

1. Setup + Foundational → base pronta.
2. US1 → testar isoladamente → já cancela pedidos elegíveis via HTTP (MVP).
3. US2 → adicionar os testes de bloqueio → confirma que pedidos enviados/entregues/já
   cancelados continuam protegidos.
4. US3 → adicionar o teste de listagem → confirma que o pedido cancelado continua visível.
5. Polish → documentação e validação manual via `quickstart.md`.

Cada fase deixa a API em estado funcional, cabendo tudo em um único pull request (Princípio IV
da constituição): 2 arquivos existentes alterados em `src/pedidos/`, 1 arquivo de teste novo,
1 script novo em `package.json`, e a documentação atualizada.

---

## Notes

- `[P]` = arquivos diferentes, sem dependência pendente.
- `[Story]` mapeia a tarefa à user story correspondente, para rastreabilidade.
- Verificar que os testes de US1 falham antes de T006 (nenhuma rota registrada ainda).
- Rodar `npx tsx --test tests/pedidos/cancelamento.test.ts` depois de cada tarefa de
  implementação.
- Evitar: tarefas vagas, duas tarefas `[P]` tocando o mesmo arquivo, dependências entre stories
  que quebrem a independência de teste.

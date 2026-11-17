# Implementation Plan: Cancelamento de Pedido Antes do Envio

**Branch**: `001-cancelar-pedido` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-cancelar-pedido/spec.md`

## Summary

Permitir que um operador da loja cancele um pedido que ainda não foi enviado, informando o
pedido e, opcionalmente, um motivo. A abordagem técnica aproveita a estrutura já existente em
`src/pedidos` (rotas Express, base em memória, serializador): adiciona-se o status
`cancelado` ao modelo de `Pedido`, uma nova rota `POST /pedidos/:id/cancelamento`, e os erros
dessa rota nova seguem Problem Details (RFC 9457), conforme a constituição do projeto.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), executado com `tsx` em Node.js >= 24.18
(já em uso no projeto).

**Primary Dependencies**: Express 5.1 (já em uso). Nenhuma dependência nova é necessária.

**Storage**: Base em memória (array dentro de `criarBase()` em `src/pedidos/dados.ts`),
recriada a cada processo — sem persistência. N/A banco de dados.

**Testing**: Test runner nativo do Node (`node:test`), executado via `tsx`. As requisições
HTTP contra a rota são feitas com `fetch` nativo do Node contra o `app` (de `criarApp()`)
ouvindo em porta efêmera — sem adicionar `supertest` ou outra dependência de teste.

**Target Platform**: Servidor Node.js (API REST), mesmo alvo da API já em produção.

**Project Type**: single (serviço backend). O cliente web em `cliente/` é servido de forma
estática pela própria API e não requer mudança nesta feature.

**Performance Goals**: Nenhuma meta nova; a operação de cancelamento segue o mesmo perfil das
demais rotas de pedidos (operação simples em memória, sem I/O externo).

**Constraints**: Não alterar o comportamento dos endpoints já existentes (`GET /pedidos`,
`GET /pedidos/:id`, `POST /pedidos`); erros da rota nova DEVEM usar Problem Details (RFC 9457)
por força do Princípio II da constituição; campos novos DEVEM usar camelCase (Princípio I).

**Scale/Scope**: Um novo endpoint, uma extensão pequena do modelo `Pedido` e os testes
correspondentes — escopo compatível com um único pull request (Princípio IV).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. camelCase | Campos novos (`motivo`, `canceladoEm`) e o body da requisição usam camelCase desde o início. | PASS |
| II. Problem Details em endpoints novos | `POST /pedidos/:id/cancelamento` responde erros (404, 409) em Problem Details; rotas antigas permanecem como estão, sem migração retroativa. | PASS |
| III. Teste automatizado para regra de negócio nova | Cada regra (cancelar quando elegível, bloquear quando enviado/entregue/já cancelado, pedido inexistente) terá teste em `node:test`. | PASS |
| IV. Mudança pequena em um único PR | Escopo limitado a `dados.ts`, `rotas.ts`, `serializar.ts` e um arquivo de teste novo; sem dependências novas. | PASS |

Nenhuma violação identificada. Seção "Complexity Tracking" não se aplica.

**Re-check pós Fase 1** (após `data-model.md`, `contracts/` e `quickstart.md`): o desenho
final manteve o escopo em três arquivos existentes (`dados.ts`, `rotas.ts`, `serializar.ts`)
mais um arquivo de teste novo, Problem Details apenas na rota nova, e campos novos em
camelCase (`motivo`, `canceladoEm`). Nenhum gate mudou de status — todos continuam PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-cancelar-pedido/
├── plan.md              # Este arquivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md         # Fase 1 (/speckit-plan)
├── quickstart.md         # Fase 1 (/speckit-plan)
├── contracts/
│   └── cancelar-pedido.md
└── tasks.md              # Fase 2 (/speckit-tasks — ainda não criado)
```

### Source Code (repository root)

```text
src/
└── pedidos/
    ├── dados.ts          # Status ganha 'cancelado'; Pedido ganha canceladoEm e motivo;
    │                     # criarBase() ganha a operação de cancelamento
    ├── rotas.ts          # Nova rota POST /pedidos/:id/cancelamento
    └── serializar.ts     # Passa a incluir motivo e canceladoEm quando presentes

tests/
└── pedidos/
    └── cancelamento.test.ts   # Novo: cobre as regras de negócio desta feature
```

**Structure Decision**: Mantém a estrutura single-project já existente (`src/pedidos` +
`tests/`, já referenciada em `tsconfig.json`). Nenhum diretório novo além de `tests/pedidos/`;
a feature estende os três arquivos existentes do módulo em vez de criar um módulo paralelo.

## Complexity Tracking

> Sem violações do Constitution Check a justificar — seção não aplicável.

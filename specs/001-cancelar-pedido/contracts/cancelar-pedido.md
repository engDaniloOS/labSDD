# Contrato: Cancelar Pedido

`POST /pedidos/{id}/cancelamento`

Cancela um pedido que ainda não foi enviado. Endpoint novo — erros seguem Problem Details
(RFC 9457), diferente das rotas antigas de `/pedidos`.

## Requisição

```http
POST /pedidos/PED-1001/cancelamento
Content-Type: application/json
```

```json
{
  "motivo": "cliente desistiu da compra"
}
```

`motivo` é opcional; a requisição é válida sem corpo ou com `{}`.

## Resposta de sucesso — 200 OK

Pedido serializado (mesmo formato de `GET /pedidos/{id}`), agora com `status: "cancelado"` e
os campos novos:

```json
{
  "id": "PED-1001",
  "cliente": "Ana Souza",
  "status": "cancelado",
  "valor_total": 79.8,
  "criadoEm": "2026-09-28T10:15:00Z",
  "canceladoEm": "2026-11-16T14:32:00Z",
  "motivo": "cliente desistiu da compra",
  "forma_pagamento": { "tipo": "pix", "chave": "ana.souza@exemplo.com" },
  "itens": [{ "sku": "CX-PEQ", "quantidade": 2, "preco_unitario": 39.9 }]
}
```

Quando `motivo` não é informado, o campo `motivo` fica ausente no JSON de resposta.

## Respostas de erro (Problem Details, RFC 9457)

`Content-Type: application/problem+json` (com `charset=utf-8`, adicionado automaticamente pelo
Express) em todos os casos abaixo.

### 404 — pedido não encontrado

```json
{
  "type": "/problemas/pedido-nao-encontrado",
  "title": "Pedido não encontrado",
  "status": 404,
  "detail": "Não existe pedido com o id PED-9999.",
  "instance": "/pedidos/PED-9999/cancelamento"
}
```

### 409 — pedido não pode ser cancelado

Cobre pedido já `enviado`, já `entregue`, ou já `cancelado`.

```json
{
  "type": "/problemas/pedido-nao-cancelavel",
  "title": "Pedido não pode ser cancelado",
  "status": 409,
  "detail": "O pedido PED-1003 está com status \"enviado\" e não pode ser cancelado.",
  "instance": "/pedidos/PED-1003/cancelamento"
}
```

## Mapeamento para os requisitos do spec

| Cenário | FR | Status HTTP |
|---------|----|--------------|
| Pedido elegível, com ou sem motivo | FR-001, FR-002, FR-003, FR-005, FR-006 | 200 |
| Pedido `enviado` ou `entregue` | FR-004 | 409 |
| Pedido já `cancelado` | FR-008 | 409 |
| Pedido inexistente | (Edge Case) | 404 |

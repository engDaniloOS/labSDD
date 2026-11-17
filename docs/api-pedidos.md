# API de Pedidos

Documentação escrita à mão em 2024. Atualize quando mudar a API.

## Endpoints

- `GET /pedidos` lista os pedidos. Aceita `?status=`.
- `GET /pedidos/{id}` devolve um pedido.
- `POST /pedidos` cria um pedido.
- `POST /pedidos/{id}/cancelamento` cancela um pedido que ainda não foi enviado.

## Campos do pedido

```json
{
  "id": "PED-1001",
  "cliente": "Ana Souza",
  "status": "pago",
  "total": 79.8,
  "data_criacao": "2026-09-28T10:15:00Z",
  "forma_pagamento": { "tipo": "pix" }
}
```

## Cancelar pedido

`POST /pedidos/{id}/cancelamento`, corpo opcional `{ "motivo": "texto livre" }`.

- Pedido com status anterior ao envio (`criado` ou `pago`): `200 OK`, pedido devolvido com
  `status: "cancelado"`, `canceladoEm` (data/hora) e `motivo` (se informado).
- Pedido já `enviado`, `entregue` ou já `cancelado`: `409 Conflict`, corpo em
  [Problem Details (RFC 9457)](https://www.rfc-editor.org/rfc/rfc9457), com `detail`
  explicando o status atual.
- Pedido inexistente: `404 Not Found`, também em Problem Details.

## Erros

Os endpoints antigos (`GET`/`POST /pedidos`) devolvem `{ "erro": "mensagem" }` ou
`{ "message": "...", "code": "..." }`, dependendo da rota — formatos herdados, mantidos como
estão. O endpoint novo de cancelamento usa Problem Details (RFC 9457) em todos os erros:

```json
{
  "type": "/problemas/pedido-nao-cancelavel",
  "title": "Pedido não pode ser cancelado",
  "status": 409,
  "detail": "O pedido PED-1003 está com status \"enviado\" e não pode ser cancelado.",
  "instance": "/pedidos/PED-1003/cancelamento"
}
```

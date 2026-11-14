# API de Pedidos

Documentação escrita à mão em 2024. Atualize quando mudar a API.

## Endpoints

- `GET /pedidos` lista os pedidos. Aceita `?status=`.
- `GET /pedidos/{id}` devolve um pedido.
- `POST /pedidos` cria um pedido.

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

## Erros

Erros devolvem `{ "erro": "mensagem" }`.

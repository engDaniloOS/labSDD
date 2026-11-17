# Quickstart: Cancelamento de Pedido Antes do Envio

Guia para validar manualmente a feature depois de implementada. Para o contrato completo, ver
[contracts/cancelar-pedido.md](./contracts/cancelar-pedido.md); para o modelo de dados, ver
[data-model.md](./data-model.md).

## Pré-requisitos

- Dependências instaladas (`npm install`).
- Nenhuma variável de ambiente adicional.

## Subir a API

```sh
npm run dev
```

A API fica em `http://localhost:3000`. A base em memória já vem com pedidos de exemplo
(`PED-1001` a `PED-1005` — ver `src/pedidos/dados.ts`), incluindo um `enviado` (`PED-1003`) e
um `entregue` (`PED-1004`), úteis para validar o bloqueio.

## Cenário 1 — Cancelar um pedido elegível

`PED-1001` está com status `criado`.

```sh
curl -i -X POST http://localhost:3000/pedidos/PED-1001/cancelamento \
  -H "Content-Type: application/json" \
  -d '{"motivo": "cliente desistiu"}'
```

**Esperado**: `200 OK`; corpo com `status: "cancelado"`, `canceladoEm` preenchido e
`motivo: "cliente desistiu"`.

```sh
curl -s http://localhost:3000/pedidos | grep -A3 '"PED-1001"'
```

**Esperado**: `PED-1001` continua na lista, agora com status `cancelado` (User Story 3).

## Cenário 2 — Bloquear pedido já enviado

```sh
curl -i -X POST http://localhost:3000/pedidos/PED-1003/cancelamento
```

**Esperado**: `409 Conflict`, `Content-Type: application/problem+json`, `detail` mencionando
que o pedido está `enviado`.

## Cenário 3 — Bloquear pedido já entregue

```sh
curl -i -X POST http://localhost:3000/pedidos/PED-1004/cancelamento
```

**Esperado**: `409 Conflict`, `detail` mencionando que o pedido está `entregue`.

## Cenário 4 — Pedido inexistente

```sh
curl -i -X POST http://localhost:3000/pedidos/PED-9999/cancelamento
```

**Esperado**: `404 Not Found`, Problem Details com `type: "/problemas/pedido-nao-encontrado"`.

## Cenário 5 — Cancelar sem motivo

Repetir o Cenário 1 com outro pedido elegível, sem enviar corpo (`curl -X POST .../cancelamento`
sem `-d`). **Esperado**: `200 OK`, pedido cancelado, campo `motivo` ausente na resposta.

## Rodar os testes automatizados

```sh
npx tsx --test tests/pedidos/cancelamento.test.ts
```

**Esperado**: todos os testes passam, cobrindo os cinco cenários acima.

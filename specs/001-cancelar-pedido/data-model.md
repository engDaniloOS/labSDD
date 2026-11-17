# Data Model: Cancelamento de Pedido Antes do Envio

## Pedido (extensão)

Entidade já existente em `src/pedidos/dados.ts`. Esta feature estende `Status` e `Pedido`:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|--------------|-----------|
| `status` | `Status` | sim | Ganha o valor `'cancelado'`, além dos quatro já existentes. |
| `canceladoEm` | `string` (ISO 8601) | somente quando `status === 'cancelado'` | Data/hora em que o cancelamento ocorreu. Segue o mesmo formato de `criadoEm`. |
| `motivo` | `string` | não | Motivo informado pelo operador ao cancelar. Ausente quando não informado. |

```ts
export type Status = 'criado' | 'pago' | 'enviado' | 'entregue' | 'cancelado';

export interface Pedido {
  // ...campos existentes sem alteração...
  canceladoEm?: string;
  motivo?: string;
}
```

`canceladoEm` e `motivo` só existem a partir do momento em que o pedido é cancelado; para
pedidos em qualquer outro status eles permanecem `undefined` (omitidos na serialização).

## Regra de elegibilidade (estado)

- **Elegíveis para cancelamento**: `status` em `{'criado', 'pago'}` (qualquer status anterior
  ao envio).
- **Não elegíveis**: `status` em `{'enviado', 'entregue', 'cancelado'}`.
- **Transição**: `{'criado', 'pago'} → 'cancelado'`, definitiva. Não há transição de saída de
  `'cancelado'` nesta feature (reativação está fora de escopo, conforme Assumptions do
  spec.md).

```text
criado ──┐
         ├──► cancelado   (via POST /pedidos/:id/cancelamento)
pago ────┘

criado/pago ──► enviado ──► entregue   (fluxo já existente, sem mudança)
```

## Operação na base em memória

`criarBase()` (em `dados.ts`) ganha uma nova operação, ao lado de `listar`/`buscar`/`inserir`:

```ts
type ResultadoCancelamento =
  | { tipo: 'ok'; pedido: Pedido }
  | { tipo: 'nao-encontrado' }
  | { tipo: 'nao-cancelavel'; statusAtual: Status };

cancelar: (id: string, motivo?: string) => ResultadoCancelamento
```

- `nao-encontrado`: nenhum pedido com o `id` informado.
- `nao-cancelavel`: pedido existe, mas `status` não está em `{'criado', 'pago'}` (inclui o
  caso de já estar `'cancelado'` — ver FR-008 do spec.md). `statusAtual` permite montar a
  mensagem de erro sem uma segunda consulta à base.
- `ok`: pedido passa a `status: 'cancelado'`, `canceladoEm` recebe o timestamp atual, e
  `motivo` é definido somente se foi informado (string não vazia).

## Serialização

`serializarPedido` (em `serializar.ts`) passa a incluir `motivo` e `canceladoEm` no JSON de
saída quando definidos — sem alterar os campos já existentes, consistente com o Princípio I
(campos novos em camelCase) e sem tocar nos campos antigos que já misturam convenções.

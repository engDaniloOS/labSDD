# Feature Specification: Cancelamento de Pedido Antes do Envio

**Feature Branch**: `001-cancelar-pedido`

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Permitir que um pedido seja cancelado antes de ser enviado. Quem opera a loja informa o pedido e, se quiser, um motivo. Pedidos já enviados ou entregues não podem ser cancelados, e quem tentou precisa entender por quê. Um pedido cancelado continua aparecendo na lista, com o status cancelado e a data do cancelamento."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cancelar um pedido elegível (Priority: P1)

Quem opera a loja informa qual pedido deve ser cancelado e, se quiser, um motivo em texto
livre. Se o pedido ainda não foi enviado, ele é cancelado.

**Why this priority**: É o motivo da feature existir — sem isso não há cancelamento.

**Independent Test**: Pode ser testado cancelando um pedido que ainda não foi enviado e
verificando que ele passa a ter status "cancelado" com a data do cancelamento registrada.

**Acceptance Scenarios**:

1. **Given** um pedido que ainda não foi enviado, **When** o operador informa o pedido e um
   motivo e confirma o cancelamento, **Then** o pedido passa a ter status "cancelado", a data
   do cancelamento é registrada, e o motivo informado fica salvo junto ao pedido.
2. **Given** um pedido que ainda não foi enviado, **When** o operador confirma o cancelamento
   sem informar motivo, **Then** o pedido é cancelado normalmente, sem motivo registrado.

---

### User Story 2 - Bloquear cancelamento de pedido enviado ou entregue (Priority: P2)

Quando alguém tenta cancelar um pedido que já foi enviado ou entregue, o sistema impede a
ação e explica por que o cancelamento não é permitido.

**Why this priority**: Protege a operação (logística/entrega já em andamento ou concluída)
de cancelamentos inconsistentes; é a regra que dá segurança à Story 1.

**Independent Test**: Pode ser testado tentando cancelar um pedido com status "enviado" e,
separadamente, um com status "entregue", e verificando que ambos são rejeitados com uma
explicação compreensível.

**Acceptance Scenarios**:

1. **Given** um pedido com status "enviado", **When** o operador tenta cancelá-lo, **Then** o
   sistema rejeita a ação e informa que o pedido já foi enviado e por isso não pode ser
   cancelado.
2. **Given** um pedido com status "entregue", **When** o operador tenta cancelá-lo, **Then** o
   sistema rejeita a ação e informa que o pedido já foi entregue e por isso não pode ser
   cancelado.

---

### User Story 3 - Ver pedidos cancelados na lista (Priority: P3)

Quem opera a loja continua vendo o pedido cancelado na lista de pedidos, agora com o status
"cancelado" e a data em que o cancelamento aconteceu.

**Why this priority**: Garante rastreabilidade do que aconteceu com o pedido; depende das
Stories 1 e 2 já existirem para ter pedidos cancelados a mostrar.

**Independent Test**: Pode ser testado cancelando um pedido e, em seguida, consultando a
lista de pedidos para confirmar que ele aparece com status "cancelado" e a data do
cancelamento.

**Acceptance Scenarios**:

1. **Given** um pedido foi cancelado, **When** o operador consulta a lista de pedidos,
   **Then** o pedido aparece na lista com status "cancelado" e a data do cancelamento.

---

### Edge Cases

- O que acontece quando o operador informa um pedido que não existe? O sistema informa que o
  pedido não foi encontrado e não realiza nenhuma alteração.
- O que acontece quando o operador tenta cancelar um pedido que já está cancelado? O sistema
  informa que o pedido já está cancelado e não altera a data/motivo já registrados.
- O que acontece se o status do pedido mudar para "enviado" entre o operador abrir a
  solicitação e confirmar o cancelamento? O sistema reavalia o status no momento da
  confirmação e bloqueia o cancelamento se o pedido não for mais elegível.
- O que acontece quando o motivo informado é uma string vazia? É tratado como "nenhum motivo
  informado".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que o operador da loja solicite o cancelamento
  informando o pedido a ser cancelado.
- **FR-002**: O sistema MUST permitir que o operador informe, opcionalmente, um motivo em
  texto livre junto à solicitação de cancelamento.
- **FR-003**: O sistema MUST cancelar o pedido somente quando o status atual do pedido for
  anterior ao envio.
- **FR-004**: O sistema MUST rejeitar a solicitação de cancelamento quando o pedido já
  estiver com status "enviado" ou "entregue", informando ao operador o motivo da rejeição.
- **FR-005**: O sistema MUST, ao cancelar um pedido, alterar seu status para "cancelado" e
  registrar a data/hora em que o cancelamento ocorreu.
- **FR-006**: O sistema MUST armazenar o motivo do cancelamento junto ao pedido quando ele for
  informado.
- **FR-007**: O sistema MUST manter o pedido cancelado visível na lista de pedidos, exibindo
  o status "cancelado" e a data do cancelamento.
- **FR-008**: O sistema MUST impedir que um pedido já cancelado seja cancelado novamente,
  informando ao operador que o pedido já está cancelado.

### Key Entities

- **Pedido**: Representa um pedido da loja. Para esta feature, passa a ter um status
  "cancelado" entre seus estados possíveis, além de uma data de cancelamento e um motivo de
  cancelamento (opcional) quando esse status é atingido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador consegue cancelar um pedido elegível informando apenas o pedido e,
  se quiser, um motivo, em uma única solicitação.
- **SC-002**: 100% das tentativas de cancelamento de pedidos já enviados ou entregues são
  bloqueadas e acompanhadas de uma explicação compreensível do motivo da rejeição.
- **SC-003**: 100% dos pedidos cancelados continuam aparecendo na lista de pedidos, com
  status "cancelado" e a data do cancelamento.
- **SC-004**: Nenhum pedido com status "enviado" ou "entregue" tem seu status alterado para
  "cancelado".

## Assumptions

- "Antes de ser enviado" abrange qualquer status de pedido anterior ao envio; apenas
  "enviado" e "entregue" bloqueiam o cancelamento.
- Quem cancela é um operador da loja (uso interno/administrativo); esta feature não cobre o
  cliente final solicitando o próprio cancelamento.
- O motivo do cancelamento é texto livre opcional, de uso interno; esta feature não define se
  ele é exibido ao cliente final.
- O cancelamento é uma ação final: reativar um pedido cancelado está fora do escopo desta
  feature.
- Reversão de estoque ou de pagamento associada ao cancelamento está fora do escopo desta
  feature.

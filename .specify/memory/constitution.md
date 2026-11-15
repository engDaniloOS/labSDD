<!--
Sync Impact Report
Version change: (template, não ratificado) → 1.0.0
Princípios modificados: nenhum (adoção inicial)
Princípios adicionados:
  - I. Nomes de Campos em camelCase
  - II. Problem Details (RFC 9457) em Erros de Endpoints Novos
  - III. Teste Automatizado Obrigatório para Regra de Negócio Nova
  - IV. Mudanças Pequenas em um Único Pull Request
Seções adicionadas:
  - Contexto Técnico e Compatibilidade
  - Fluxo de Desenvolvimento
  - Governance
Seções removidas: nenhuma
Templates dependentes: não revisados/alterados por este comando (fora do escopo; leem a
  constituição em tempo de execução — ver Next Actions na resposta, se aplicável).
Follow-up TODOs: nenhum placeholder pendente.
-->

# TechLog API Constitution

## Core Principles

### I. Nomes de Campos em camelCase
Todos os campos expostos em payloads de requisição e resposta DEVEM usar camelCase
(ex.: `orderId`, `createdAt`). Nomes em snake_case, kebab-case ou PascalCase NÃO são
permitidos em contratos novos ou em campos alterados.
**Rationale**: Mantém consistência com o cliente web existente e evita camadas de
tradução de nomenclatura entre API e consumidores.

### II. Problem Details (RFC 9457) em Erros de Endpoints Novos
Toda resposta de erro de um endpoint novo DEVE seguir o formato Problem Details da
RFC 9457 (campos como `type`, `title`, `status`, `detail`, `instance`, com
`Content-Type: application/problem+json`). Endpoints já existentes que não usam esse
formato NÃO são obrigados a migrar retroativamente só por este princípio; qualquer
endpoint ou rota de erro nova, porém, DEVE adotá-lo desde o início.
**Rationale**: Padroniza o tratamento de erros para novos contratos sem forçar uma
migração disruptiva de endpoints já em produção.

### III. Teste Automatizado Obrigatório para Regra de Negócio Nova
Toda regra de negócio nova (validação, cálculo, transição de estado de pedido,
política, etc.) DEVE ter teste automatizado que a exercite antes de ser considerada
concluída. Pull requests que introduzem regra de negócio sem teste correspondente
DEVEM ser rejeitados na revisão.
**Rationale**: O sistema está em produção processando pedidos reais; testes
automatizados substituem verificação manual repetida e protegem contra regressão.

### IV. Mudanças Pequenas em um Único Pull Request
Cada mudança DEVE ser pequena o suficiente para caber em um único pull request
revisável, com escopo único e objetivo claro. Mudanças maiores DEVEM ser quebradas em
etapas incrementais, cada uma entregando a API em estado funcional.
**Rationale**: Reduz risco de regressão em um sistema já em produção e mantém o tempo
de revisão previsível.

## Contexto Técnico e Compatibilidade

A TechLog API é uma API REST de pedidos em Node.js, TypeScript e Express, já em
produção e consumida por um cliente web existente. Mudanças em contratos (campos,
rotas, formatos de erro) DEVEM considerar o impacto nesse cliente web. Quebra de
compatibilidade em endpoint já existente exige decisão explícita e coordenação com o
time responsável pelo consumidor — não é coberta automaticamente pelos Princípios I e
II acima, que se aplicam a campos e endpoints novos ou alterados.

## Fluxo de Desenvolvimento

Novas funcionalidades seguem o fluxo do Spec Kit (specify → plan → tasks → implement),
com cada entrega respeitando o Princípio IV. A revisão de pull request DEVE verificar:
nomenclatura camelCase nos campos novos/alterados; uso de Problem Details em erros de
endpoints novos; presença de teste automatizado para toda regra de negócio nova; e
escopo compatível com um único PR.

## Governance

Esta constituição tem precedência sobre convenções anteriores do projeto em caso de
conflito. Emendas exigem: registro do Sync Impact Report no topo deste arquivo,
incremento de versão por versionamento semântico (MAJOR para remoção ou redefinição
incompatível de princípio; MINOR para novo princípio ou expansão material; PATCH para
esclarecimentos e correções de texto) e atualização da data de última emenda. Toda
revisão de pull request DEVE verificar conformidade com os princípios acima antes da
aprovação.

**Version**: 1.0.0 | **Ratified**: 2026-11-14 | **Last Amended**: 2026-11-14

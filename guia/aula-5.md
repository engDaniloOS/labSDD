# Aula 5 · O agente dentro da esteira

**Objetivo:** Conectar o fluxo do Spec Kit à esteira de verificação e medir com eval quantas vezes o agente entrega dentro dos portões e dos critérios de aceite.

## 5.1 · Constituição e AGENTS.md com os portões

1. **Traga o script que roda todos os portões e rode.** *(arquivo da referência)*

   ```
   git checkout referencia -- scripts/portoes.mjs
   git commit -m "Portões num comando"
   npm run portoes
   ```

   O que você deve ver: O placar com cinco portões passando: lint, breaking change, tipos, aceite e conformidade.

2. **Emende a constituição. O texto está em prompts/5.1-constituicao-emenda.md.** *(no agente)*

   No terminal da direita, abra o agente:

   ```
   claude
   ```

   Cole a emenda, que está em prompts/5.1-constituicao-emenda.md, e aperte Enter:

   ```
   /speckit-constitution Ajuste a constituição:
   - O princípio de camelCase vale para campos novos. Campos que já existem só mudam por depreciação, nunca por renomeação.
   - Novo princípio: o contrato da API é openapi/openapi.yaml, em OpenAPI 3.1, e é a fonte de verdade da interface. O que o plano gerar na pasta contracts/ de uma feature é proposta; a mudança só vale quando entra no openapi.yaml.
   - Novo princípio: nenhuma tarefa está pronta sem `npm run portoes` passar.
   ```

   O que você deve ver: A constituição na versão 1.1.0, com o relatório de impacto no topo e os dois princípios novos.

   **Plano B:** Se a versão vier diferente de 1.1.0, siga: o que importa é o relatório explicar o motivo. Se o agente listar decisões que tomou sozinho, como o detalhe da depreciação ou trocar a referência ao docs/api-pedidos.md, confira se seguem a emenda e siga, sem pedir mudança. Se ele sugerir tirar o relatório de impacto do topo antes do commit, não tire: é um comentário HTML e é o que você mostra.

3. **Traga o AGENTS.md e faça o CLAUDE.md importar ele. Abra o AGENTS.md.** *(arquivo da referência)*

   Quando o agente terminar, saia com /exit. No terminal da direita:

   ```
   git checkout referencia -- AGENTS.md
   printf '\n@AGENTS.md\n' >> CLAUDE.md
   code AGENTS.md
   ```

   O que você deve ver: O AGENTS.md com três partes: o que ler antes de mudar, as regras do contrato e o que rodar antes de dizer que terminou.

   **Plano B:** O CLAUDE.md já existe, com as instruções do curso para o agente não usar o material de apoio. A linha entra no fim dele, sem apagar nada.

4. **Registre as regras do agente.**

   No terminal da direita:

   ```
   git add -A
   git commit -m "Constituição emendada e AGENTS.md"
   ```

   O que você deve ver: Commit criado, com a constituição, o AGENTS.md e o CLAUDE.md.

5. **Sessão nova do agente. Peça a renomeação de forma_pagamento, de prompts/5.1-pedido-renomear.md.** *(no agente)*

   No terminal da direita, se o claude estiver aberto, saia com /exit. Abra uma sessão nova:

   ```
   claude
   ```

   Cole o pedido, que está em prompts/5.1-pedido-renomear.md, e aperte Enter:

   ```
   Renomeie o campo forma_pagamento da resposta de pedidos para formaPagamento, seguindo o princípio de camelCase da constituição. Atualize o contrato em openapi/openapi.yaml e o código. Não faça commit.
   ```

   Quando o agente terminar, role até o fim da resposta e confira os comandos do AGENTS.md, com o resultado de cada um. Saia com /exit e veja o que mudou, sem abrir arquivos:

   ```
   git --no-pager diff --stat
   git --no-pager diff -- src/pedidos/serializar.ts
   ```

   O que você deve ver: O agente acrescenta formaPagamento e marca forma_pagamento como deprecated, ou pergunta antes. No fim, os quatro comandos com o resultado. O stat lista openapi/openapi.yaml e src/pedidos/serializar.ts, e o diff do serializador mostra os dois campos.

6. **Confira com os portões e o changelog. Depois, descarte: era demonstração.**

   No terminal da direita:

   ```
   npm run portoes
   npm run contrato:changelog
   ```

   Descarte a mudança:

   ```
   git restore --source=HEAD --staged --worktree .
   git clean -fd
   ```

   O que você deve ver: Todos os portões passando. No changelog, formaPagamento adicionada e forma_pagamento depreciada. Depois do descarte, git status limpo.

> O agente obedeceu numa mudança pequena.

## 5.2 · A mesma feature, agora com a esteira

### Antes do 5.2: o ponto de partida

O vídeo 5.2 começa de um repositório sem o cancelamento, com a esteira inteira montada. Prepare numa branch separada:

```bash
git switch -c aula5-sem-cancelamento
git checkout referencia -- scripts/preparar-5.2.mjs
npm run preparar:5.2
git add -A && git commit -m "Ponto de partida do 5.2"
git tag v5.2-inicio
git switch main
```

1. **Parta do ponto preparado e rode os portões.**

   No terminal da direita:

   ```
   git switch -c cancelamento-na-esteira v5.2-inicio
   export CONTRATO_BASE=v5.2-inicio
   npm run portoes
   ```

   O que você deve ver: Todos os portões passando, sem o cancelamento no código, no contrato e nas specs.

   **Plano B:** No Windows, o export funciona no Git Bash; no PowerShell, não. Se a tag não existir, faça o preparo do início deste vídeo.

2. **Sessão nova do agente. Rode o specify com o mesmo texto do 1.2, de prompts/1.2-specify.md.** *(no agente)*

   No terminal da direita, se o claude estiver aberto, saia com /exit. Abra uma sessão nova:

   ```
   claude
   ```

   Cole o mesmo specify do 1.2, de prompts/1.2-specify.md, e aperte Enter. Se ele fizer perguntas, escolha Type something e cole o bloco de respostas do mesmo arquivo:

   ```
   /speckit-specify Permitir que um pedido seja cancelado antes de ser enviado. Quem opera a loja informa o pedido e, se quiser, um motivo. Pedidos já enviados ou entregues não podem ser cancelados, e quem tentou precisa entender por quê. Um pedido cancelado continua aparecendo na lista, com o status cancelado e a data do cancelamento.
   ```

   O que você deve ver: As mesmas perguntas Q1 a Q3 do 1.2, se o specify tiver dúvida, e depois specs/001-.../spec.md. Responda com o mesmo bloco de respostas de prompts/1.2-specify.md, no campo de texto livre.

3. **Rode o plan com o texto de prompts/1.3-plan.md e abra o Constitution Check.** *(no agente)*

   Na mesma sessão, cole o mesmo plan do 1.3, de prompts/1.3-plan.md, e aperte Enter:

   ```
   /speckit-plan Use a estrutura que já existe em src/pedidos: rotas Express, a base em memória e o serializador. O cancelamento é um POST /pedidos/{id}/cancelamento. Testes com o test runner nativo do Node (node:test), rodando com tsx.
   ```

   Quando terminar, no editor: Ctrl+P, digite plan.md e Enter. No arquivo, Ctrl+F e busque Constitution Check.

   O que você deve ver: No Constitution Check, os princípios novos: o openapi.yaml como fonte de verdade e npm run portoes como critério de pronto. Em contracts/, uma proposta que aponta para a mudança no openapi.yaml.

   **Plano B:** Se o plano não citar o openapi.yaml, confira na próxima etapa se as tarefas incluem a mudança no contrato.

4. **Gere as tarefas e procure duas delas.** *(no agente)*

   Na mesma sessão:

   ```
   /speckit-tasks
   ```

   Quando terminar, no editor: Ctrl+P, digite tasks.md e Enter. Ctrl+F e busque openapi.yaml e depois portoes.

   O que você deve ver: Uma tarefa que muda openapi/openapi.yaml antes do código, e uma no fim que roda npm run portoes.

5. **Registre e crie a tag.**

   ```
   git add -A
   git commit -m "Spec, plano e tarefas do cancelamento dentro da esteira"
   git tag v5.3-inicio
   ```

   O que você deve ver: Commit e tag criados.

> As regras mudaram o plano antes de mudar o código.

## 5.3 · Eval de conformidade

1. **Traga o eval, leia o comentário do topo e veja o gabarito.** *(arquivo da referência)*

   No terminal da direita:

   ```
   git checkout referencia -- scripts/eval.mjs eval/
   code scripts/eval.mjs
   ```

   Depois do comentário do topo, abra o gabarito e passe pelos nomes dos seis testes, do CA1 ao CA6:

   ```
   code eval/aceite/cancelamento.test.ts
   ```

   O que você deve ver: O comentário com os dois corretores e a linha do EVAL_AGENTE, que chama o Claude Code em modo não interativo. Depois, no cancelamento.test.ts, os seis testes, do CA1 ao CA6.

2. **Compare os dois contextos.**

   No terminal da direita:

   ```
   git --no-pager diff --no-index eval/contextos/A.md eval/contextos/B.md
   ```

   O que você deve ver: B acrescenta as regras do contrato e os comandos que o agente roda antes de dizer que terminou.

3. **Veja a tarefa.**

   No terminal da direita:

   ```
   code prompts/5.3-tarefa-eval.md
   ```

   O que você deve ver: A feature de cancelamento num prompt só, com as regras e a instrução de trabalhar até terminar.

4. **Rode o eval completo: três execuções de cada contexto.**

   ```
   npm run eval -- --n 3 --contexto eval/contextos/A.md --contexto eval/contextos/B.md
   ```

   O que você deve ver: O placar de A e de B, com forma, comportamento e custo. Cada execução leva alguns minutos, e as seis consomem o limite do seu plano do Claude. O custo mostrado é estimativa a preço de lista.

   **Dica:** Se A e B empatarem, também é resultado: para esta tarefa, a regra extra não mudou nada.

5. **Registre e crie a tag.**

   No terminal da direita:

   ```
   git add -A
   git commit -m "Eval de conformidade do agente"
   git tag v5.4-inicio
   ```

   O que você deve ver: Commit e tag criados. A pasta relatorios/ fica fora do Git, e as cópias estão fora do repositório.

> Você tem a esteira e um número.

## 5.4 · Encerramento e plano de adoção em 90 dias

1. **Rode a esteira inteira uma última vez.**

   ```
   git switch main
   unset CONTRATO_BASE
   npm run portoes
   ```

   O que você deve ver: O placar com os cinco portões passando, na main.

2. **No GitHub, abra a lista de pull requests fechados.**

   ```
   gh pr list --state all --web
   ```

   O que você deve ver: O PR do agente barrado no 3.3, a depreciação aprovada, o drift que passou, o PR da conformidade e o PR descartável da pausa do 3.3.

---

[Voltar ao README](../README.md)

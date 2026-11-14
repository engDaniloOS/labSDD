# Aula 1 · SDD na prática com o Spec Kit

**Objetivo:** Conduzir uma feature da spec à implementação com o Spec Kit e um agente de código, e reconhecer o que esse fluxo não confere sozinho.

## 1.1 · Apresentando o curso, a TechLog API e o percurso

1. **No VS Code, no clone do repositório, crie as branches de apoio, confira o ambiente e suba a API.**

   ```
   git switch main
   for b in referencia sincronia-2.1 reserva-1.3; do git branch -f --track $b origin/$b; done
   npm install
   npm run conferir
   npm run dev
   ```

   O que você deve ver: Três branches locais criadas. Na conferência, ok nas ferramentas e na rede, e o Spec Kit marcado como depois, porque ele entra no 1.2. Por fim, a TechLog API em http://localhost:3000 no terminal.

   **Plano B:** Se a porta 3000 estiver ocupada, feche a outra instância. Não troque a porta: o curso inteiro usa a 3000.

2. **Abra o cliente no navegador.**

   ```
   http://localhost:3000
   ```

   O que você deve ver: A tabela com cinco pedidos: PED-1001 a PED-1005, com status, total e pagamento.

   **Plano B:** Se a tabela não aparecer, confira se a API subiu sem erro no terminal da esquerda.

3. **Abra docs/api-pedidos.md por dez segundos.**

   ```
   docs/api-pedidos.md
   ```

   O que você deve ver: A documentação escrita à mão, com os campos total e data_criacao.

> O ambiente está conferido, e a API legada responde.

## 1.2 · Constituição e spec da feature

1. **Instale o Spec Kit na versão fixada e confira.**

   ```
   uv tool install specify-cli==1.2.0
   specify version
   ```

   O que você deve ver: Depois do banner do Spec Kit, um quadro com CLI Version 1.2.0.

   **Plano B:** Se o comando specify não for encontrado, feche o terminal e abra outro. Se já estiver instalado em outra versão: uv tool install specify-cli==1.2.0 --force.

2. **Inicie o Spec Kit dentro do repositório existente.**

   ```
   specify init --here --force --integration claude --integration-options="--no-model-invocation" --script sh
   ```

   O que você deve ver: As pastas .specify/ e .claude/skills/ criadas, com as skills speckit-*. Entre os painéis do fim, um aviso sugere pôr .claude/ no .gitignore. Aqui não: as skills precisam ir para o Git, e o .gitignore do projeto já deixa de fora o arquivo de configurações locais do Claude Code.

   **Plano B:** Se pedir confirmação, responda sim. Se reclamar da integração, rode specify integration list e confira a chave claude.

3. **Veja o que entrou no repositório.**

   ```
   git status --short
   ```

   O que você deve ver: Arquivos novos em .specify/ e .claude/, e nada alterado em src/.

   **Plano B:** Se aparecer package-lock.json modificado, o npm da sua máquina reescreveu o lockfile. Desfaça com git checkout -- package-lock.json.

4. **Abra o agente e escreva a constituição. O texto está em prompts/1.2-constituicao.md.** *(no agente)*

   ```
   claude
   
   /speckit-constitution Este é o repositório da TechLog API, uma API REST de pedidos em Node, TypeScript e Express, já em produção, com um cliente web que a consome. Princípios do projeto:
   1. Nomes de campos em camelCase.
   2. Erros de endpoints novos no formato Problem Details (RFC 9457).
   3. Toda regra de negócio nova tem teste automatizado.
   4. Mudanças pequenas, que caibam num único pull request.
   ```

   O que você deve ver: O arquivo .specify/memory/constitution.md com os quatro princípios e uma versão, normalmente 1.0.0. No topo do arquivo, um comentário Sync Impact Report, que vai junto no commit. Se a versão vier 2.0.0, é porque o agente tratou a troca do modelo como mudança maior: não pede ação.

   **Plano B:** Se o agente perguntar se o camelCase vale também para os campos que já existem, responda: mantenha o princípio como está escrito, sem exceção nem regra para os campos existentes. Se travar ou sair muito diferente, traga a reserva: git show referencia:reserva/speckit/memory/constitution.md > .specify/memory/constitution.md

5. **Abra a constituição em texto e leia os princípios.**

   ```
   .specify/memory/constitution.md
   ```

   O que você deve ver: Os princípios em seções numeradas e a linha de versão no fim.

6. **Escreva a spec da feature. O texto está em prompts/1.2-specify.md.** *(no agente)*

   ```
   /speckit-specify Permitir que um pedido seja cancelado antes de ser enviado. Quem opera a loja informa o pedido e, se quiser, um motivo. Pedidos já enviados ou entregues não podem ser cancelados, e quem tentou precisa entender por quê. Um pedido cancelado continua aparecendo na lista, com o status cancelado e a data do cancelamento.
   
   Respostas do produto para as suas perguntas. Use a linha que corresponde a cada pergunta, mesmo que ela venha com outras palavras:
   - Pedido já cancelado: não é erro. Devolve o pedido como está, sem mudar a data nem o motivo, mesmo que venha outro motivo.
   - Motivo: opcional, até 200 caracteres. Acima disso, recusa com erro de validação. Motivo vazio vale como sem motivo.
   - Pedido pago: pode ser cancelado. O sistema só registra o cancelamento, e o reembolso fica fora desta feature.
   - Pedido enviado ou entregue: não pode ser cancelado, e a resposta explica o motivo.
   - Cliente web, a tela: fora do escopo. A tela fica como está.
   - Desfazer o cancelamento: não existe nesta feature. O cancelamento é definitivo.
   - Quem pode cancelar, autenticação: fora do escopo. A API ainda não tem autenticação.
   - Reembolso, estoque, notificação: fora do escopo.
   - Pedido que não existe: responde que o pedido não foi encontrado.
   - Nomes dos campos novos: canceladoEm para a data e motivoCancelamento para o motivo.
   - Corpo da requisição: um objeto com o campo motivo, opcional.
   Para o que não estiver aqui: o escopo é só a API. Escolha a opção que mexe menos e registre como suposição.
   ```

   O que você deve ver: Se ficou dúvida que muda o escopo, o specify para e faz até três perguntas (Q1, Q2, Q3), cada uma com uma tabela de opções. Responda com o bloco de respostas: escolha a opção de texto livre (Type something) e cole o bloco de respostas de prompts/1.2-specify.md, com as decisões do produto. Se as perguntas vierem em abas, cole na primeira e repita nas outras se ele pedir. Quando aparecer [Pasted text], Ctrl+V mostra o texto inteiro. No fim, a pasta specs/001-.../ com spec.md e checklists/requirements.md: histórias com prioridade, cenários de aceite, requisitos FR-001 em diante e a seção Assumptions.

   **Plano B:** Se travar, traga a spec da referência e aponte o Spec Kit para ela. Apague a seção Clarifications antes do clarify: mkdir -p specs/001-cancelar-pedido && git show referencia:reserva/speckit/specs/001-cancelar-pedido/spec.md > specs/001-cancelar-pedido/spec.md && printf '{"feature_directory": "specs/001-cancelar-pedido"}\n' > .specify/feature.json

7. **Leia a spec: cenários de aceite e a seção Assumptions.**

   ```
   specs/001-*/spec.md
   ```

   O que você deve ver: Cenários no formato Given, When, Then e, no fim, a seção Assumptions, com o que o agente decidiu sozinho. Se alguma pergunta ficou sem resposta, ela aparece como NEEDS CLARIFICATION.

8. **Rode o clarify e responda com o bloco de respostas.** *(no agente)*

   ```
   /speckit-clarify
   
   Respostas do produto para as suas perguntas. Use a linha que corresponde a cada pergunta, mesmo que ela venha com outras palavras:
   - Pedido já cancelado: não é erro. Devolve o pedido como está, sem mudar a data nem o motivo, mesmo que venha outro motivo.
   - Motivo: opcional, até 200 caracteres. Acima disso, recusa com erro de validação. Motivo vazio vale como sem motivo.
   - Pedido pago: pode ser cancelado. O sistema só registra o cancelamento, e o reembolso fica fora desta feature.
   - Pedido enviado ou entregue: não pode ser cancelado, e a resposta explica o motivo.
   - Cliente web, a tela: fora do escopo. A tela fica como está.
   - Desfazer o cancelamento: não existe nesta feature. O cancelamento é definitivo.
   - Quem pode cancelar, autenticação: fora do escopo. A API ainda não tem autenticação.
   - Reembolso, estoque, notificação: fora do escopo.
   - Pedido que não existe: responde que o pedido não foi encontrado.
   - Nomes dos campos novos: canceladoEm para a data e motivoCancelamento para o motivo.
   - Corpo da requisição: um objeto com o campo motivo, opcional.
   Para o que não estiver aqui: o escopo é só a API. Escolha a opção que mexe menos e registre como suposição.
   ```

   O que você deve ver: Duas formas, e as duas valem. Ele faz até cinco perguntas, uma por vez, e você responde com o bloco. Ou, como o bloco já veio junto do comando, ele mesmo responde cada pergunta com a linha correspondente e só mostra o resultado. Nos dois casos, a seção Clarifications na spec, com a data da sessão, as perguntas e as respostas.

   **Plano B:** Se vier pergunta fora da tabela, responda pelo bom senso e anote o critério que usou. Se o clarify disser que não achou dúvida crítica, leia a seção Assumptions e siga.

9. **Registre o estado e crie a tag do próximo vídeo.**

   ```
   git add -A
   git commit -m "Spec Kit, constituição e spec do cancelamento"
   git tag v1.3-inicio
   ```

   O que você deve ver: Commit criado e a tag v1.3-inicio, na main. No Windows, o git add -A mostra vários avisos CRLF will be replaced by LF nos arquivos da .specify. É esperado: o commit guarda LF.

> A spec está aprovada.

## 1.3 · Plano, tarefas e implementação

1. **Sessão nova do agente. Rode o plan com o texto de prompts/1.3-plan.md.** *(no agente)*

   ```
   /speckit-plan Use a estrutura que já existe em src/pedidos: rotas Express, a base em memória e o serializador. O cancelamento é um POST /pedidos/{id}/cancelamento. Testes com o test runner nativo do Node (node:test), rodando com tsx.
   ```

   O que você deve ver: Em specs/001-*/: plan.md, research.md, data-model.md, quickstart.md e a pasta contracts/.

   **Plano B:** Se travar, traga os arquivos da reserva, que já apontam o Spec Kit para a pasta certa: git checkout reserva-1.3 -- specs .specify/feature.json

2. **Abra plan.md na seção Constitution Check.**

   ```
   specs/001-*/plan.md
   ```

   O que você deve ver: Os princípios da constituição conferidos um a um.

3. **Abra a pasta contracts/.**

   ```
   specs/001-*/contracts/
   ```

   O que você deve ver: Um arquivo descrevendo o POST /pedidos/{id}/cancelamento. Pode ser Markdown ou YAML, dependendo do agente.

4. **Gere as tarefas e leia o arquivo.** *(no agente)*

   ```
   /speckit-tasks
   ```

   O que você deve ver: tasks.md em fases: Setup, Foundational, uma por história, Polish. Tarefas numeradas T001 em diante.

5. **Implemente.** *(no agente)*

   ```
   /speckit-implement
   ```

   O que você deve ver: Código novo em src/pedidos e testes. O agente marca as tarefas como feitas em tasks.md. No fim, um relatório com o que fez. O formato varia: pode trazer o que ficou diferente do plano, o que não foi verificado e problemas encontrados.

   **Plano B:** Se perguntar se segue com checklist incompleto, responda yes e anote qual item ficou aberto. Se travar ou sair do trilho, interrompa e traga a reserva com git checkout reserva-1.3 -- src specs tests. Siga do passo 7.

6. **Rode o converge.** *(no agente)*

   ```
   /speckit-converge
   ```

   O que você deve ver: Um resumo de achados e o resultado Converged, ou tarefas novas numa seção Convergence de tasks.md.

   **Plano B:** Se ele acrescentar tarefas, rode /speckit-implement e /speckit-converge de novo. Repita até ele responder que convergiu.

7. **Rode os testes que o agente escreveu.**

   ```
   npx tsx --test
   ```

   O que você deve ver: Todos passando.

   **Plano B:** Se o agente escreveu os testes em outro lugar, use o comando que ele indicou no quickstart.md ou no plan.md.

8. **Cancele um pedido pela API.**

   ```
   curl -s -X POST http://localhost:3000/pedidos/PED-1002/cancelamento -H "content-type: application/json" -d '{"motivo":"teste"}'
   ```

   O que você deve ver: O pedido PED-1002 com status cancelado e canceladoEm preenchido.

   **Plano B:** Se a API não recarregou, reinicie o npm run dev no terminal da esquerda.

9. **Registre e crie a tag do próximo vídeo.**

   ```
   git add -A
   git commit -m "Cancelamento de pedido implementado pelo agente"
   git tag v1.4-inicio
   ```

   O que você deve ver: Commit e tag criados, na main.

   **Plano B:** Se o prompt do terminal mostrar outra branch, como 001-cancelar-pedido, o agente criou uma branch por conta própria. Faça o commit e a tag onde está e traga a main até ali: git switch main && git merge --ff-only 001-cancelar-pedido && git branch -d 001-cancelar-pedido, com o nome que aparecer.

> A feature passou em tudo o que o fluxo conferiu.

## 1.4 · O que ninguém confere

1. **Recarregue o cliente no navegador.**

   ```
   http://localhost:3000
   ```

   O que você deve ver: A lista de pedidos, como no começo: uma tabela com Pedido, Cliente, Status, Total em reais e Pagamento.

   **Plano B:** Se o cliente já estiver quebrado, o seu agente renomeou campos sozinho, seguindo o princípio de camelCase. Veja com git diff v1.3-inicio -- src/pedidos/serializar.ts e pule para o passo 4.

2. **Aplique o princípio de camelCase num campo antigo. Abra o serializador, src/pedidos/serializar.ts, e ache a linha com Ctrl+F, buscando valor_total: com os dois-pontos. Troque valor_total por valorTotal e salve.**

   ```
   code src/pedidos/serializar.ts
   ```

   na linha do valor_total (Ctrl+F e busque valor_total:):

   ```
       valor_total: p.valorTotal,
   ```

   vira

   ```
       valorTotal: p.valorTotal,
   ```

   O que você deve ver: Uma linha alterada. Ao salvar, a API reinicia sozinha.

3. **Rode os testes que o agente escreveu.**

   ```
   npx tsx --test
   ```

   O que você deve ver: Todos passando.

   **Plano B:** Se algum teste quebrar, o seu agente testou o nome do campo. Desta vez ele testou, mas nada no fluxo garantia isso. Siga.

4. **Recarregue o cliente.**

   ```
   http://localhost:3000
   ```

   O que você deve ver: A coluna Total com R$ NaN em todos os pedidos.

5. **Rode o diagnóstico.**

   ```
   npm run diagnostico
   ```

   O que você deve ver: A tabela com as três fontes. valor_total marcado com o cliente lê e a API não devolve; valorTotal só na API. Embaixo: documentação desatualizada em total e data_criacao, e 1 campo que o cliente lê e a API não devolve.

   **Plano B:** Se acusar erro de conexão, a API não está rodando. Suba com npm run dev.

6. **Abra o arquivo dentro de contracts/ da feature e veja o que ele cobre.**

   ```
   specs/001-*/contracts/
   ```

   O que você deve ver: Um arquivo só, com o POST /pedidos/{id}/cancelamento: a requisição e as respostas. Nenhuma linha sobre o GET /pedidos nem sobre valor_total.

7. **Corrija: volte o nome no serializador e confira.**

   ```
   src/pedidos/serializar.ts
   npm run diagnostico
   ```

   O que você deve ver: Nenhum campo marcado. O cliente volta a mostrar a lista. A base é em memória, então ao salvar o arquivo a API reinicia e os pedidos voltam ao estado inicial.

   **Plano B:** Se o seu agente tinha renomeado campos no 1.3, volte todos.

8. **Sincronize o código com a referência do curso.** *(arquivo da referência)*

   ```
   git checkout --no-overlay sincronia-2.1 -- src cliente
   git rm -r -q -f --ignore-unmatch tests
   npm run diagnostico
   ```

   O que você deve ver: src/ com a implementação de referência do cancelamento, sem os arquivos que o agente criou, a pasta tests/ removida e o diagnóstico sem campo marcado.

   **Plano B:** Se a API não reiniciar sozinha, pare e suba de novo com npm run dev.

9. **Registre e crie a tag do próximo vídeo.**

   ```
   git add -A
   git commit -m "Ponto de sincronia da Aula 2"
   git tag v2.1-inicio
   ```

   O que você deve ver: Commit e tag criados.

---

[Voltar ao README](../README.md)

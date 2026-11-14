# Aula 3 · Portões no pull request

**Objetivo:** Configurar portões que conferem o contrato a cada pull request: style guide como regras, detecção de breaking change e política de depreciação.

## 3.1 · Style guide como código com Spectral

1. **Traga o package.json da referência e instale o Spectral.** *(arquivo da referência)*

   ```
   git checkout referencia -- package.json package-lock.json
   npm install
   ```

   O que você deve ver: O npm termina com added e o número de pacotes, sem listar os nomes.

   **Plano B:** O npm mostra três tipos de aviso, todos esperados: pacotes depreciados (deprecated), vulnerabilidades em dependências e, nas versões novas do npm, install scripts não aprovados (esbuild e @scarf/scarf). Os três vêm das dependências das ferramentas de desenvolvimento, não da API. Não rode npm audit fix nem aprove os scripts: o audit fix troca as versões fixadas, e as saídas do curso podem mudar. Se quiser comentar, uma frase basta: são avisos das ferramentas, e as versões ficam fixas de propósito.

2. **Crie o .spectral.yaml na raiz do projeto, só com as regras padrão, e rode o lint.**

   No terminal da direita, crie e abra o arquivo. O nome começa com ponto:

   ```
   code .spectral.yaml
   ```

   No arquivo, escreva esta linha na coluna 0 e salve:

   ```
   extends: ["spectral:oas"]
   ```

   No terminal:

   ```
   npm run contrato:lint
   ```

   O que você deve ver: No results with a severity of 'error' found! Antes, pode aparecer um aviso DEP0040 sobre punycode: é do Node, não do contrato.

3. **No .spectral.yaml, escreva a regra de caminhos abaixo do extends. Depois, prove a regra: estrague o caminho do cancelamento no contrato, veja o erro e conserte.**

   No .spectral.yaml, deixe uma linha em branco abaixo do extends. Com o cursor na coluna 0, cole o bloco abaixo:

   ```
   rules:
     techlog-caminhos-kebab-case:
       description: Caminhos em minúsculas, com hífen entre palavras.
       message: "Caminho fora do padrão: {{property}}"
       severity: error
       given: "$.paths"
       then:
         field: "@key"
         function: pattern
         functionOptions:
           match: "^(/([a-z0-9]+(-[a-z0-9]+)*|\\{[a-zA-Z]+\\}))+$"
   ```

   Salve. O arquivo fica assim:

   ```
   extends: ["spectral:oas"]
   
   rules:
     techlog-caminhos-kebab-case:
       description: Caminhos em minúsculas, com hífen entre palavras.
       message: "Caminho fora do padrão: {{property}}"
       severity: error
       given: "$.paths"
       then:
         field: "@key"
         function: pattern
         functionOptions:
           match: "^(/([a-z0-9]+(-[a-z0-9]+)*|\\{[a-zA-Z]+\\}))+$"
   ```

   Para provar: em openapi/openapi.yaml, Ctrl+F e busque /cancelamento. Troque o c por C maiúsculo, para ficar /pedidos/{id}/Cancelamento, e salve. No terminal:

   ```
   npm run contrato:lint
   ```

   Volte o C para minúsculo, salve e rode de novo:

   ```
   npm run contrato:lint
   ```

   O que você deve ver: Com o caminho trocado para /pedidos/{id}/Cancelamento: um erro techlog-caminhos-kebab-case, com a linha do arquivo e a mensagem. Com o caminho de volta ao normal, o lint passa de novo.

   **Plano B:** Se o Spectral reclamar da expressão, confira as barras invertidas antes das chaves. Se a troca à mão deixar outra diferença no contrato, desfaça tudo com git checkout -- openapi/openapi.yaml.

4. **No .spectral.yaml, dentro de rules, escreva a regra de erro em Problem Details, só para endpoint novo, e rode o lint.**

   No .spectral.yaml, deixe uma linha em branco abaixo da primeira regra. Com o cursor na coluna 2, a mesma de techlog-caminhos-kebab-case, cole o bloco abaixo:

   ```
     techlog-erros-problem-details:
       description: Endpoint novo responde erros 4xx e 5xx como application/problem+json (RFC 9457).
       message: "{{description}}"
       severity: error
       given: "$.paths[*][?(@ && @['x-legado'] !== true)].responses[?(@property.match(/^[45]/))].content"
       then:
         field: application/problem+json
         function: truthy
   ```

   Salve. O arquivo completo fica assim:

   ```
   extends: ["spectral:oas"]
   
   rules:
     techlog-caminhos-kebab-case:
       description: Caminhos em minúsculas, com hífen entre palavras.
       message: "Caminho fora do padrão: {{property}}"
       severity: error
       given: "$.paths"
       then:
         field: "@key"
         function: pattern
         functionOptions:
           match: "^(/([a-z0-9]+(-[a-z0-9]+)*|\\{[a-zA-Z]+\\}))+$"
   
     techlog-erros-problem-details:
       description: Endpoint novo responde erros 4xx e 5xx como application/problem+json (RFC 9457).
       message: "{{description}}"
       severity: error
       given: "$.paths[*][?(@ && @['x-legado'] !== true)].responses[?(@property.match(/^[45]/))].content"
       then:
         field: application/problem+json
         function: truthy
   ```

   No terminal:

   ```
   npm run contrato:lint
   ```

   O que você deve ver: Nenhum erro: o cancelamento já responde em application/problem+json.

   **Experimente:** Para provar a regra, troque o 409 do cancelamento para application/json e rode de novo. Volte antes de seguir.

5. **Traga o ruleset completo e rode.** *(arquivo da referência)*

   ```
   git checkout referencia -- .spectral.yaml
   npm run contrato:lint
   ```

   O que você deve ver: 8 problems (0 errors, 8 warnings): dois erros legados fora da RFC 9457 e seis avisos de campo em snake_case (forma_pagamento aparece duas vezes).

6. **Registre e crie a tag.**

   ```
   git add -A
   git commit -m "Style guide da TechLog no Spectral"
   git tag v3.2-inicio
   ```

   O que você deve ver: Commit e tag criados.

> O lint confere uma versão do contrato.

## 3.2 · Breaking change antes do merge com oasdiff

1. **Traga os scripts do oasdiff e instale o binário.** *(arquivo da referência)*

   ```
   git checkout referencia -- scripts/oasdiff.mjs scripts/instalar-oasdiff.mjs
   npm run oasdiff:instalar
   ```

   O que você deve ver: Pronto: bin/oasdiff. No Windows, bin\oasdiff.exe.

2. **Mudança 1: no contrato, openapi/openapi.yaml, vá ao schema Pedido, na linha 209. Para ir até ela, clique dentro do arquivo, aperte Ctrl+G, que abre o Ir para a linha (não é a busca do Ctrl+F), digite 209 e Enter. Ali, tire o cliente de dois lugares: da lista do required e das propriedades. Salve e rode no terminal.**

   No editor, abra openapi/openapi.yaml, clique dentro do arquivo, aperte Ctrl+G, digite 209 e Enter. O cursor vai para o schema Pedido.
   Duas linhas abaixo, no required, apague o cliente da lista. A linha fica assim:

   ```
         required: [id, status, valor_total, criadoEm, forma_pagamento, itens]
   ```

   Em properties, apague estas duas linhas:

   ```
           cliente:
             type: string
   ```

   Salve. O começo do Pedido fica assim:

   ```
       Pedido:
         type: object
         required: [id, status, valor_total, criadoEm, forma_pagamento, itens]
         properties:
           id:
             type: string
             examples: [PED-1001]
           status:
             $ref: '#/components/schemas/StatusPedido'
   ```

   No terminal:

   ```
   npm run contrato:quebras
   ```

   O que você deve ver: 4 alterações: 4 error, do tipo response-required-property-removed, uma por operação que devolve Pedido.

   **Plano B:** Se reclamar de main:openapi/openapi.yaml, a main local não tem o contrato. Confira se você está na main e se o commit do 2.1 entrou: git log --oneline main -- openapi/openapi.yaml.

3. **Desfaça a mudança 1 com o git checkout. Mudança 2: no mesmo schema Pedido (Ctrl+G, 209 e Enter), dentro de properties, acrescente o campo opcional observacao, sem pôr no required. Salve e rode.**

   No terminal, desfaça a mudança 1:

   ```
   git checkout -- openapi/openapi.yaml
   ```

   No editor, Ctrl+G, 209 e Enter. Em properties, logo abaixo das duas linhas do cliente, acrescente:

   ```
           observacao:
             type: string
   ```

   Salve. O começo do Pedido fica assim:

   ```
       Pedido:
         type: object
         required: [id, cliente, status, valor_total, criadoEm, forma_pagamento, itens]
         properties:
           id:
             type: string
             examples: [PED-1001]
           cliente:
             type: string
           observacao:
             type: string
           status:
             $ref: '#/components/schemas/StatusPedido'
   ```

   No terminal:

   ```
   npm run contrato:quebras
   ```

   O que você deve ver: No breaking changes to report, but the specs are different.

4. **Veja o changelog da mudança 2.**

   ```
   npm run contrato:changelog
   ```

   O que você deve ver: Quatro linhas info: a propriedade opcional observacao foi adicionada à resposta.

5. **Desfaça a mudança 2 com o git checkout. Mudança 3: no schema PedidoDeCancelamento (Ctrl+G, 317 e Enter), torne motivo obrigatório com uma linha required, logo abaixo do type. Salve e rode.**

   No terminal, desfaça a mudança 2:

   ```
   git checkout -- openapi/openapi.yaml
   ```

   No editor, Ctrl+G, 317 e Enter. O cursor vai para o schema PedidoDeCancelamento. Logo abaixo de type: object, acrescente:

   ```
         required: [motivo]
   ```

   Salve. O schema fica assim:

   ```
       PedidoDeCancelamento:
         type: object
         required: [motivo]
         properties:
           motivo:
             type: string
             maxLength: 200
   ```

   No terminal:

   ```
   npm run contrato:quebras
   ```

   O que você deve ver: 1 error: a propriedade de requisição motivo tornou-se obrigatória.

6. **Desfaça, registre e crie a tag.**

   No terminal, desfaça a mudança 3, registre e suba:

   ```
   git checkout -- openapi/openapi.yaml
   git add -A
   git commit -m "Detecção de breaking change com oasdiff"
   git tag v3.3-inicio
   git push --tags origin main
   ```

   O que você deve ver: Commit, tag e push.

> Os dois comandos rodam na sua máquina.

## 3.3 · O portão no pull request

1. **Traga o workflow e suba para a main.** *(arquivo da referência)*

   No terminal da direita, confira antes que não há nada pendente. A saída tem que vir vazia; se vier alguma linha, pare e veja o que é antes do commit:

   ```
   git status --short
   ```

   Traga o workflow e suba:

   ```
   git checkout referencia -- .github/workflows/contrato.yml
   git add -A
   git commit -m "Portões do contrato no pull request"
   git push origin main
   ```

   O que você deve ver: O workflow Contrato aparece na aba Actions do GitHub.

   **Plano B:** Se o Actions estiver desligado, ative em Settings, Actions.

2. **Abra e feche um PR descartável para o check rodar uma vez. Depois, exija o check contrato na proteção da main.**

   No terminal da direita, abra um PR descartável só para o check rodar uma vez. O -C cria a branch mesmo que o nome já exista de outra vez:

   ```
   git switch -C pr-descartavel
   echo "" >> README.md
   git commit -am "PR descartável"
   git push -u origin pr-descartavel
   gh pr create --fill
   sleep 15 && gh pr checks --watch
   ```

   Quando aparecer contrato com pass, feche o PR e volte para a main:

   ```
   gh pr close pr-descartavel --delete-branch
   git switch main
   ```

   No GitHub, no repositório: Settings, Rules, Rulesets, New ruleset, New branch ruleset. Em algumas contas o caminho é Settings, Branches, Add branch ruleset.
   Ruleset Name: main. Enforcement status: Active. Bypass list: vazia.
   Target branches: Add target, Include default branch.
   Rules: marque Require status checks to pass, clique em Add checks, digite contrato e selecione. Deixe marcadas as regras que já vêm marcadas. Clique em Create.

   O que você deve ver: A regra que exige o check contrato antes do merge, valendo também para administradores.

   **Atenção:** O check só aparece na lista da regra depois de rodar uma vez. Por isso o PR descartável: mude uma linha do README, abra, espere o check e feche.

3. **Sessão nova do agente. Peça a renomeação. O texto está em prompts/3.3-pedido-renomear.md.** *(no agente)*

   No terminal da direita, se o claude estiver aberto, saia com /exit. Abra uma sessão nova:

   ```
   claude
   ```

   Cole o pedido, que está em prompts/3.3-pedido-renomear.md, e aperte Enter:

   ```
   Renomeie o campo valor_total da resposta de pedidos para valorTotal, seguindo o princípio de camelCase da constituição. Atualize o contrato em openapi/openapi.yaml. Crie uma branch a partir da main, faça o commit e abra um pull request para a main.
   ```

   O que você deve ver: Uma branch nova, um commit mudando contrato e código, e um PR aberto com gh pr create.

   **Plano B:** Se o agente perguntar antes, propondo depreciar em vez de renomear, peça para renomear de fato, num PR só, para a main: é a quebra que o portão precisa barrar. Se ele abrir o PR contra outra branch, o check não roda: aponte para a main com gh pr edit NÚMERO --base main e feche e reabra o PR. Se o agente não conseguir abrir o PR, abra você com gh pr create.

4. **Abra o PR no GitHub e espere o check.**

   Quando o agente terminar, saia com /exit. No terminal da direita, veja o número do PR:

   ```
   gh pr list
   ```

   Abra o PR no navegador, trocando NÚMERO pelo número da lista:

   ```
   gh pr view NÚMERO --web
   ```

   Se o navegador não abrir, entre na aba Pull requests do repositório no GitHub e clique no PR.
   No PR, role a aba Conversation até o fim: o check Contrato com um X vermelho e o merge bloqueado. Clique em Details e abra o passo Breaking change contra a main para ler a mensagem.

   O que você deve ver: O check Contrato vermelho no passo Breaking change contra a main. No log do passo, a mesma mensagem em português que o terminal mostrou: valor_total removida da resposta. O merge bloqueado pela regra da main.

5. **Feche o PR do agente. Numa branch nova, faça do jeito certo: acrescente valorTotal e deprecie valor_total, no contrato e no serializador.**

   No terminal, feche o PR do agente, trocando NÚMERO, e crie a branch:

   ```
   gh pr list
   gh pr close NÚMERO --delete-branch
   git switch main && git switch -c depreciar-valor-total
   ```

   No editor, em openapi/openapi.yaml, Ctrl+G, 209 e Enter. Em properties, por volta da linha 220, apague as três linhas do valor_total: valor_total, type e description. No lugar delas, com o cursor na coluna 8, a mesma de valor_total, cole o bloco abaixo:

   ```
           valor_total:
             type: number
             description: Valor total em reais. Use valorTotal; este nome sai depois do prazo de depreciação.
             deprecated: true
           valorTotal:
             type: number
             description: Valor total em reais.
   ```

   Salve. O trecho fica assim, entre status e criadoEm:

   ```
           status:
             $ref: '#/components/schemas/StatusPedido'
           valor_total:
             type: number
             description: Valor total em reais. Use valorTotal; este nome sai depois do prazo de depreciação.
             deprecated: true
           valorTotal:
             type: number
             description: Valor total em reais.
           criadoEm:
             type: string
             format: date-time
   ```

   No editor, abra src/pedidos/serializar.ts. Ctrl+F e busque valor_total: com os dois-pontos. A mudança é acrescentar uma linha: a resposta passa a ter os dois nomes, com o mesmo valor. Apague a linha encontrada e, no lugar dela, com o cursor na coluna 4, cole o bloco abaixo. Ele traz a linha antiga de volta e a nova logo abaixo dela:

   ```
       valor_total: p.valorTotal,
       valorTotal: p.valorTotal,
   ```

   Salve. O começo do objeto devolvido fica assim:

   ```
       id: p.id,
       cliente: p.cliente,
       status: p.status,
       valor_total: p.valorTotal,
       valorTotal: p.valorTotal,
       criadoEm: p.criadoEm,
   ```

   O que você deve ver: Contrato e serializador com os dois campos.

6. **Confira localmente e abra o PR.**

   No terminal, confira antes de abrir o PR:

   ```
   npm run contrato:quebras
   npm run contrato:changelog
   ```

   Registre, suba e abra o PR. Espere o check e faça o merge:

   ```
   git commit -am "Deprecia valor_total em favor de valorTotal"
   git push -u origin depreciar-valor-total
   gh pr create --fill
   sleep 15 && gh pr checks --watch
   gh pr view --web
   ```

   No navegador, confira o check Contrato verde e o botão de merge liberado, o contraste com o PR do agente. Volte ao terminal e faça o merge:

   ```
   gh pr merge --merge --delete-branch
   ```

   O que você deve ver: Nenhuma quebra; o changelog com valorTotal adicionada e valor_total depreciada. No GitHub, o check verde e o merge feito.

   **Plano B:** Se aparecer no checks reported, o check ainda não começou. Espere alguns segundos e rode gh pr checks --watch de novo.

7. **Mude só o código: troque cliente por nomeCliente no serializador, numa branch nova, e abra o PR.**

   No terminal da direita, crie a branch a partir da main atualizada:

   ```
   git switch main && git pull && git switch -c refatora-serializador
   ```

   No editor, abra src/pedidos/serializar.ts. Ctrl+F e busque cliente: p.cliente. Troque a linha:

   ```
       cliente: p.cliente,
   ```

   por:

   ```
       nomeCliente: p.cliente,
   ```

   Salve. No terminal, confira a mudança: uma linha só, e o contrato não mudou:

   ```
   git diff
   ```

   Registre, suba e abra o PR. Espere o check e faça o merge:

   ```
   git commit -am "Refatora o serializador"
   git push -u origin refatora-serializador
   gh pr create --fill
   sleep 15 && gh pr checks --watch
   gh pr merge --merge --delete-branch
   ```

   O que você deve ver: O check verde e o merge feito. O diff troca cliente por nomeCliente no serializador.

   **Plano B:** Se aparecer no checks reported, o check ainda não começou. Espere alguns segundos e rode gh pr checks --watch de novo.

8. **Atualize a main local e crie a tag.**

   ```
   git switch main && git pull
   git tag v4.1-inicio
   git push --tags
   ```

   O que você deve ver: A main com a depreciação e a demonstração de drift.

> O portão só lê o contrato, e uma mudança só no código passou por ele.

---

[Voltar ao README](../README.md)

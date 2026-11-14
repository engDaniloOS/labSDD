# Aula 4 · O servidor contra o contrato

**Objetivo:** Desacoplar cliente e servidor com um mock gerado do contrato, conferir o servidor real com testes gerados e aplicar a conferência dentro do código na própria stack.

## 4.1 · Mock a partir do contrato com Prism

1. **Abra um terceiro terminal, só para o mock, e suba o Prism nele. A API continua no terminal da esquerda, e os comandos seguem no da direita.**

   No painel do terminal, clique no + (New Terminal) para abrir um terceiro terminal. Nele:

   ```
   npm run mock
   ```

   O que você deve ver: Prism is listening on http://127.0.0.1:4010, depois de listar as quatro operações do contrato.

   **Plano B:** Se a porta 4010 estiver ocupada, feche a outra instância do Prism.

2. **Busque dois pedidos diferentes no mock.**

   No terminal da direita:

   ```
   curl -s localhost:4010/pedidos/PED-1002
   curl -s localhost:4010/pedidos/PED-7777
   ```

   O que você deve ver: As duas chamadas devolvem o mesmo PED-1002, de Bruno Lima: o exemplo PedidoPago do contrato.

3. **Traga a versão do cliente com o botão de cancelar e abra o cliente apontando para o mock.** *(arquivo da referência)*

   No terminal da direita:

   ```
   git checkout referencia -- cliente/app.js
   ```

   No navegador, na aba do cliente, abra o endereço abaixo e clique em Cancelar no PED-1002:

   ```
   http://localhost:3000/?api=http://localhost:4010
   ```

   Na tela, nada muda. Olhe o terminal do mock: o POST no cancelamento chegou, passou na validação e recebeu 200. Logo depois, o cliente buscou a lista de novo.

   O que você deve ver: A tabela com dois pedidos, PED-1002 e PED-1003, a linha Dados de http://localhost:4010 no topo e o botão Cancelar só no PED-1002. Ao clicar, nada muda na lista. No terminal do mock, o post /pedidos/PED-1002/cancelamento com Request passed the validation rules e status 200, e um get /pedidos logo depois.

   **Plano B:** Se o clique não aparecer no terminal do mock, o navegador está com o app.js antigo: recarregue sem cache, com Ctrl+Shift+R. Se aparecer erro de CORS no console, confira se o Prism é a versão 5.16.0, do package.json: ele libera o acesso entre portas por padrão.

4. **Mande uma requisição fora do contrato.**

   No terminal da direita:

   ```
   curl -s -i "localhost:4010/pedidos?status=perdido"
   ```

   O que você deve ver: HTTP 422, com um corpo application/problem+json dizendo que status precisa ser um dos valores do enum.

5. **Pare o mock com Ctrl+C, feche o terminal dele, registre e crie a tag.**

   No terminal do mock, pare com Ctrl+C e feche esse terminal pelo ícone da lixeira. No terminal da direita:

   ```
   git add -A
   git commit -m "Cliente com o botão de cancelar"
   git tag v4.2-inicio
   ```

   O que você deve ver: Commit e tag criados.

> O mock confere quem consome.

## 4.2 · A resposta real contra o contrato com Schemathesis

1. **Abra o cliente apontando para a API real.**

   No navegador, na aba do cliente, abra:

   ```
   http://localhost:3000
   ```

   O que você deve ver: A coluna Cliente mostra undefined em todos os pedidos.

   **Plano B:** Se os nomes aparecerem, o merge do refatora-serializador não veio. Rode git pull na main, ou troque à mão cliente por nomeCliente em src/pedidos/serializar.ts.

2. **Traga o script de conformidade e rode.**

   No terminal da direita:

   ```
   git checkout referencia -- scripts/conformidade.mjs
   npm run conformidade
   ```

   O que você deve ver: Falhas Response violates schema nas quatro operações que devolvem Pedido (listar, buscar, criar e cancelar), com a mensagem de que cliente é uma propriedade obrigatória, e uma linha curl para reproduzir cada uma. Os curl apontam para a porta 3100, onde o script sobe a API.

   **Plano B:** Se a primeira execução demorar, é o uvx baixando o Schemathesis. Se as falhas vierem com outro texto, leia as que vierem: o importante é chegar no campo cliente.

3. **Repita a requisição de uma falha contra a API da porta 3000.**

   ```
   curl -s localhost:3000/pedidos/PED-1001
   ```

   O que você deve ver: O pedido com nomeCliente no lugar de cliente.

4. **Corrija o serializador, que ainda devolve nomeCliente por causa da demonstração de drift, e rode de novo.**

   No editor, abra src/pedidos/serializar.ts. Ctrl+F e busque nomeCliente. Troque a linha:

   ```
       nomeCliente: p.cliente,
   ```

   por:

   ```
       cliente: p.cliente,
   ```

   Salve. O começo do objeto devolvido fica assim:

   ```
       id: p.id,
       cliente: p.cliente,
       status: p.status,
   ```

   No terminal da direita:

   ```
   npm run conformidade
   ```

   O que você deve ver: Nenhuma falha. O resumo com as operações testadas e todas as checagens passando.

   **Plano B:** Se ainda falhar em outro ponto, leia a falha antes de corrigir.

5. **Registre e crie a tag.**

   ```
   git add -A
   git commit -m "Conformidade do servidor com Schemathesis"
   git tag v4.3-inicio
   ```

   O que você deve ver: Commit e tag criados.

> Você conferiu respostas para requisições válidas.

## 4.3 · Casos que ninguém escreveu

1. **Rode a conformidade completa, com dados válidos e inválidos.**

   ```
   npm run conformidade:completa
   ```

   O que você deve ver: Perto de 20 falhas, todas Response violates schema; o número exato varia com a máquina. Nas quatro operações: {"tipo":"pix"} is not valid under any of the schemas listed in the 'oneOf' keyword. Nos testes com estado, os pedidos que o próprio teste criou: "sku" is a required property, preço less than the minimum of 0 e null is not of type "number" no total.

   **Plano B:** O número de falhas varia com a máquina. O importante é ver os dois tipos de defeito: o Pix sem chave nas quatro operações e os pedidos com dados absurdos que o POST aceitou. Para salvar a saída num arquivo no Windows, ponha PYTHONUTF8=1 antes do comando.

2. **Teste o caso mais simples de todos, um pedido só com o cliente e sem itens, contra a API da porta 3000.**

   ```
   curl -s -i -X POST localhost:3000/pedidos -H "content-type: application/json" -d '{"cliente":"Teste"}'
   ```

   O que você deve ver: HTTP 500. No terminal da esquerda, Cannot read properties of undefined (reading 'map').

3. **Traga a validação completa do POST /pedidos e rode de novo.** *(arquivo da referência)*

   No terminal da direita:

   ```
   git checkout referencia -- src/pedidos/rotas.ts
   npm run conformidade:completa
   ```

   O que você deve ver: Nenhuma falha.

   **Plano B:** Se ainda falhar, não abra o PR: o check de conformidade roda o mesmo comando e barraria o merge. Leia a falha, que aponta o campo que a validação deixou passar, e corrija em src/pedidos/rotas.ts.

4. **Traga o workflow de conformidade, numa branch, e abra o PR.** *(arquivo da referência)*

   No terminal da direita:

   ```
   git switch -c conformidade-no-ci
   git checkout referencia -- .github/workflows/conformidade.yml
   git add -A
   git commit -m "Conformidade do servidor no pull request"
   git push -u origin conformidade-no-ci
   gh pr create --fill
   ```

   O que você deve ver: Dois checks no PR, Contrato e Conformidade, os dois verdes.

5. **Espere os checks do PR, exija o novo check na regra da main, faça o merge e crie a tag.**

   No terminal, espere os dois checks, contrato e conformidade, ficarem verdes:

   ```
   gh pr checks --watch
   ```

   No GitHub, no repositório: Settings, Rules, Rulesets e clique na regra main. Em Require status checks to pass, clique em Add checks, digite conformidade e selecione. Clique em Save changes. Se pedir, confirme o acesso.
   No terminal, faça o merge e crie a tag:

   ```
   gh pr merge --merge --delete-branch
   git switch main && git pull
   git tag v4.4-inicio
   ```

   O que você deve ver: A regra exigindo contrato e conformidade. A main local com o merge.

> O CI confere depois que o código foi escrito.

## 4.4 · Na sua stack: tipos gerados e validação em execução

1. **Gere os tipos do contrato e traga o serializador tipado.** *(arquivo da referência)*

   No terminal da direita:

   ```
   git checkout referencia -- .gitignore
   npm run gerar:tipos
   git checkout referencia -- src/pedidos/serializar.ts
   git --no-pager diff --staged -- src/pedidos/serializar.ts
   ```

   No diff, repare em duas linhas: o import que vem de ../gerado/api.js e a linha da função serializarPedido, que agora termina em : PedidoNoContrato.

   O que você deve ver: O gerar:tipos escreve src/gerado/api.d.ts. No diff do serializador, o import do arquivo gerado e o retorno PedidoNoContrato, o Pedido do contrato.

2. **Confira que compila. Depois, refaça à mão a troca de cliente por nomeCliente e compile de novo.**

   No terminal da direita:

   ```
   npm run tipos
   ```

   No editor, em src/pedidos/serializar.ts, Ctrl+F e busque cliente: p.cliente. Troque a linha:

   ```
       cliente: p.cliente,
   ```

   por:

   ```
       nomeCliente: p.cliente,
   ```

   Salve. Repare que o editor já sublinha a linha em vermelho. No terminal:

   ```
   npm run tipos
   ```

   O que você deve ver: Primeiro sem erros. Depois do drift, um erro TS2353 em serializar.ts dizendo que nomeCliente não existe no tipo do pedido.

   **Plano B:** Se o tsc acusar erros em outros arquivos, leia antes de seguir: pode ser arquivo que o agente criou na Aula 1. Corrija ou apague, porque os portões da Aula 5 rodam o mesmo tsc.

3. **Desfaça a troca, confira que compila e registre.**

   No editor, em serializar.ts, volte nomeCliente para cliente e salve. No terminal da direita, confira:

   ```
   npm run tipos
   ```

   Sem erros, registre:

   ```
   git add -A
   git commit -m "Tipos gerados a partir do contrato"
   git tag v5.1-inicio
   ```

   O que você deve ver: O tsc sem erros, de novo. Depois, o commit e a tag criados.

> A esteira está completa.

---

[Voltar ao README](../README.md)

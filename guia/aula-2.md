# Aula 2 · A spec que a máquina confere

**Objetivo:** Transformar o contrato e os critérios de aceite em artefatos que a máquina confere: o OpenAPI 3.1 do módulo de Pedidos e testes de aceite.

## 2.1 · O contrato de Pedidos em OpenAPI 3.1

1. **Na raiz do projeto, crie openapi/openapi.yaml e escreva o cabeçalho. No Explorer, New File com o nome openapi/openapi.yaml cria a pasta e o arquivo de uma vez. Pelo terminal: mkdir -p openapi && code openapi/openapi.yaml**

   ```
   openapi: 3.1.0
   info:
     title: TechLog API
     version: 1.0.0
   servers:
     - url: http://localhost:3000
   ```

   O que você deve ver: Arquivo novo, com as seis linhas do cabeçalho.

2. **Abaixo do cabeçalho, escreva paths e components: o GET legado, o cancelamento novo e os três schemas. Salve o arquivo.**

   ```
   paths:
     /pedidos/{id}:
       get:
         operationId: buscarPedido
         x-legado: true
         parameters:
           - name: id
             in: path
             required: true
             schema:
               type: string
         responses:
           '200':
             description: O pedido.
             content:
               application/json:
                 schema:
                   $ref: '#/components/schemas/Pedido'
           '404':
             description: Pedido não encontrado, no formato de erro antigo.
             content:
               application/json:
                 schema:
                   $ref: '#/components/schemas/ErroLegado'
     /pedidos/{id}/cancelamento:
       post:
         operationId: cancelarPedido
         responses:
           '200':
             description: Pedido cancelado.
             content:
               application/json:
                 schema:
                   $ref: '#/components/schemas/Pedido'
           '409':
             description: O pedido já saiu para entrega.
             content:
               application/problem+json:
                 schema:
                   $ref: '#/components/schemas/Problema'
   
   components:
     schemas:
       Pedido:
         type: object
         required: [id, cliente, status, valor_total, criadoEm]
         properties:
           id: { type: string }
           cliente: { type: string }
           status: { type: string }
           valor_total: { type: number }
           criadoEm: { type: string, format: date-time }
       ErroLegado:
         type: object
         required: [erro]
         properties:
           erro: { type: string }
       Problema:
         type: object
         required: [type, title, status]
         properties:
           type: { type: string, format: uri }
           title: { type: string }
           status: { type: integer }
           detail: { type: string }
           instance: { type: string }
   ```

   O que você deve ver: Os dois endpoints em paths, o GET com x-legado e o POST do cancelamento, e os três schemas em components: Pedido, ErroLegado e Problema.

   **Plano B:** Se o tempo apertar, escreva só o GET e o Pedido e traga o resto por commit no passo seguinte.

3. **Traga o contrato completo da referência e abra o arquivo.** *(arquivo da referência)*

   ```
   git show referencia:reserva/contrato/openapi-2.1.yaml | sed '1,3d' > openapi/openapi.yaml
   code openapi/openapi.yaml
   ```

   O que você deve ver: No arquivo, o contrato completo, com quase 500 linhas: quatro operações, os schemas, os exemplos e as tags.

   **Atenção:** No Windows, rode o comando no Git Bash, que tem o sed. Copie a linha inteira de uma vez, para ela não quebrar ao colar.

4. **Abra o NovoPedido e repare que itens é obrigatório.**

   ```
   openapi/openapi.yaml, em components/schemas/NovoPedido
   ```

   O que você deve ver: required: [cliente, itens, forma_pagamento].

5. **Registre e crie a tag do próximo vídeo.**

   ```
   git add -A
   git commit -m "Contrato OpenAPI 3.1 do módulo de Pedidos"
   git tag v2.2-inicio
   ```

   O que você deve ver: Commit e tag criados.

> O contrato existe, e descreve a API como ela é hoje.

## 2.2 · Critérios de aceite como teste

1. **Abra a spec nos cenários de aceite e nas clarificações.**

   ```
   specs/001-*/spec.md
   ```

   O que você deve ver: Os cenários Given, When, Then, a seção Assumptions e, se o clarify perguntou, a seção Clarifications.

2. **Abra o package.json, na raiz do projeto. Logo abaixo da linha "scripts": {, aperte Enter e escreva o script de teste como a primeira linha da lista. Ela termina com vírgula, porque outras linhas vêm depois. Salve.**

   ```
   code package.json
   ```

   package.json, logo abaixo de "scripts": {, como primeira linha:

   ```
   "test:aceite": "tsx --test --test-reporter=spec \"tests/aceite/*.test.ts\"",
   ```

   O que você deve ver: O script na seção scripts.

3. **Na raiz do projeto, crie tests/aceite/cancelamento.test.ts e escreva o CA1. No Explorer, New File com o nome tests/aceite/cancelamento.test.ts cria as duas pastas e o arquivo de uma vez. Pelo terminal: mkdir -p tests/aceite && code tests/aceite/cancelamento.test.ts**

   ```
   import { test, before, after } from 'node:test';
   import assert from 'node:assert/strict';
   import type { Server } from 'node:http';
   import type { AddressInfo } from 'node:net';
   import { criarApp } from '../../src/app.js';
   
   let servidor: Server;
   let api: string;
   
   before(async () => {
     servidor = criarApp().listen(0);
     await new Promise((ok) => servidor.once('listening', ok));
     api = `http://localhost:${(servidor.address() as AddressInfo).port}`;
   });
   
   after(() => servidor.close());
   
   test('CA1: pedido criado ou pago pode ser cancelado', async () => {
     const resposta = await fetch(`${api}/pedidos/PED-1002/cancelamento`, {
       method: 'POST',
       headers: { 'content-type': 'application/json' },
       body: JSON.stringify({ motivo: 'Cliente desistiu' }),
     });
     assert.equal(resposta.status, 200);
     const pedido = await resposta.json();
     assert.equal(pedido.status, 'cancelado');
     assert.ok(pedido.canceladoEm);
   });
   ```

   O que você deve ver: O arquivo com o servidor subindo numa porta livre e o primeiro critério.

4. **Rode.**

   ```
   npm run test:aceite
   ```

   O que você deve ver: CA1 passando.

   **Plano B:** Se falhar, leia a mensagem antes de mexer. É o critério da spec dizendo o que o código não fez.

5. **Traga os outros critérios e leia os testes.** *(arquivo da referência)*

   ```
   git checkout referencia -- tests/aceite
   npm run test:aceite
   ```

   O que você deve ver: Oito testes passando: CA1 a CA6 do cancelamento e dois do legado.

   **Plano B:** Se algum falhar, veja qual critério e corrija o código.

6. **Registre, crie a tag e suba para o GitHub.**

   ```
   git add -A
   git commit -m "Testes de aceite do cancelamento"
   git tag v3.1-inicio
   git push -u origin main --tags
   ```

   O que você deve ver: A main e as tags no GitHub.

   **Plano B:** Se o push for recusado por permissão, o origin ainda aponta para o repositório do curso: crie um repositório vazio e público na sua conta e rode git remote set-url origin <url> antes do push.

> As duas camadas de spec viraram arquivos que rodam.

---

[Voltar ao README](../README.md)

# TechLog API · material do curso

Repositório do curso **Spec-Driven API Engineering: Do Design-First à Governança de Contratos e Automação com IA**, da Alura. Com ele você refaz o curso inteiro, do começo ao fim, no seu ritmo.

A TechLog é uma empresa inventada. Os pedidos, os clientes e as pessoas também.

## Como usar

- **Comece pelo [passo a passo](#o-curso-passo-a-passo) abaixo.** Ele mostra o caminho das cinco aulas, vídeo por vídeo.
- **Para os detalhes de uma aula, abra o guia dela**, na pasta `guia/`: [Aula 1](guia/aula-1.md), [Aula 2](guia/aula-2.md), [Aula 3](guia/aula-3.md), [Aula 4](guia/aula-4.md) e [Aula 5](guia/aula-5.md). Cada passo traz o comando, o que você deve ver e um plano B.
- **Prefere ler tudo numa página só, com botão de copiar em cada comando?** Baixe o repositório e abra o arquivo `guia.html` no navegador. Ele marca os passos que você já fez.
- **Os prompts longos estão em `prompts/`**, um por arquivo, com o texto pronto para colar no agente.
- **Terminal da esquerda e da direita:** no curso, a API fica rodando num terminal, à esquerda, e os comandos vão no outro, à direita. Abra os dois no VS Code, lado a lado.
- **Passos marcados como *arquivo da referência*** trazem um arquivo pronto da branch `referencia`, em vez de digitar.

## O que você precisa

- Node 24 ou mais novo
- Git e uma conta no GitHub (o GitHub CLI, `gh`, é usado a partir da Aula 3)
- [uv](https://docs.astral.sh/uv/), que instala o Spec Kit e roda o Schemathesis. Não precisa instalar Python: o uv baixa uma versão compatível sozinho
- Um agente de código. No curso, o Claude Code, que pede plano pago do Claude

Não precisa de Docker.

### Instalação no Mac e no Windows

Faça de cima para baixo. Cada célula diz onde: no site, no PowerShell ou no terminal do VS Code. No Windows, o terminal do VS Code é o Git Bash, configurado na linha 7.

| # | Etapa | Mac | Windows | Observação |
|---|---|---|---|---|
| 1 | Git | **Terminal**<br>`xcode-select --install` | **Site**<br>Instalador de git-scm.com | Vem primeiro: no Windows, é ele que traz o Git Bash. Avance com as opções padrão. |
| 2 | Node 24 ou mais novo | **Site**<br>Instalador LTS de nodejs.org | **Site**<br>Instalador LTS de nodejs.org | Se já tem Node, confira com node -v: o Prism, que roda o mock, pede 24.18 ou mais novo. No Windows, deixe desmarcada a opção de ferramentas para módulos nativos: o curso não precisa e ela demora. |
| 3 | VS Code | **Site**<br>Instalador de code.visualstudio.com | **Site**<br>Instalador de code.visualstudio.com | No Windows, mantenha marcada a opção Adicionar ao PATH. |
| 4 | GitHub CLI | **Site**<br>Instalador de cli.github.com | **Site**<br>Instalador de cli.github.com | O login vem mais adiante. |
| 5 | uv | **Terminal**<br>`curl -LsSf https://astral.sh/uv/install.sh \| sh`<br>`echo 'export UV_PYTHON=3.12' >> ~/.zshrc` | **PowerShell**<br>`powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 \| iex"`<br>`setx UV_PYTHON 3.12` | Não tem instalador de clicar. Instala o Spec Kit e roda o Schemathesis. Não precisa instalar Python: o uv baixa um. A segunda linha fixa o Python 3.12, no Mac e no Windows. Sem ela, o uv usa o mais novo que achar, inclusive um que já esteja na máquina, e uma dependência do Schemathesis, o PyYAML, ainda não tem pacote pronto para ele. |
| 6 | Claude Code | **Terminal**<br>`curl -fsSL https://claude.ai/install.sh \| bash` | **PowerShell**<br>`winget install Anthropic.ClaudeCode` | Não tem instalador de clicar. Pelo winget, a versão não se atualiza sozinha. No Mac, a instalação nativa se atualiza em segundo plano. |
| 7 | Git Bash como terminal do VS Code | **Não precisa**<br>O terminal do Mac já serve | **VS Code**<br>Feche e abra o VS Code. Depois: Ctrl+Shift+P, Terminal: Select Default Profile, Git Bash | Abra um terminal novo. No Windows, o prompt mostra MINGW64 ou UCRT64, conforme a versão do Git: os dois são o Git Bash. Daqui em diante, tudo roda nesse terminal. |
| 8 | Caminho das ferramentas do uv | **Terminal do VS Code**<br>`uv tool update-shell` | **Git Bash no VS Code**<br>`uv tool update-shell` | O Spec Kit é instalado na aula, no vídeo 1.2. Este passo só garante que o comando specify vai aparecer depois. Feche o VS Code inteiro e abra de novo: um terminal novo, sozinho, não pega o caminho. |
| 9 | Login no GitHub | **Terminal do VS Code**<br>`gh auth login` | **Git Bash no VS Code**<br>`gh auth login` | Escolha GitHub.com, HTTPS e login pelo navegador. |
| 10 | Nome e email no Git | **Terminal do VS Code**<br>`git config --global user.name "Seu Nome"`<br>`git config --global user.email "seu@email"` | **Git Bash no VS Code**<br>`git config --global user.name "Seu Nome"`<br>`git config --global user.email "seu@email"` | Use --global se este for o único nome que você usa no Git. Se a máquina já usa outro nome em outros projetos, rode sem --global, dentro do clone do curso, logo depois do git clone. |
| 11 | Login no Claude Code | **Terminal do VS Code**<br>`claude` | **Git Bash no VS Code**<br>`claude` | Siga o login no navegador. Precisa de plano pago do Claude. Saia com /exit. |
| 12 | Repositório e conferência | **Terminal do VS Code**<br>`git clone https://github.com/njqfwork/alura-sdd.git techlog-api`<br>`cd techlog-api`<br>`npm install`<br>`npm run conferir` | **Git Bash no VS Code**<br>`git clone https://github.com/njqfwork/alura-sdd.git techlog-api`<br>`cd techlog-api`<br>`npm install`<br>`npm run conferir` | A conferência mostra o que ainda falta: versões, login no GitHub e acesso à rede. |

**No Windows, use o Git Bash.** Ele vem com o Git for Windows. No VS Code, aperte Ctrl+Shift+P, escolha *Terminal: Select Default Profile* e depois *Git Bash*. Todos os comandos do curso rodam nele do mesmo jeito que no Mac. No PowerShell, vários não rodam.

## Primeiros passos

```bash
git clone https://github.com/njqfwork/alura-sdd.git techlog-api
cd techlog-api
for b in referencia sincronia-2.1 reserva-1.3; do git branch -f --track $b origin/$b; done
npm install
npm run conferir
npm run dev
```

O `npm run conferir` mostra o que falta na sua máquina: versões, login no GitHub e acesso à rede.

A partir da Aula 2, o curso usa o **seu** repositório no GitHub: o push começa no vídeo 2.2, e os pull requests e o GitHub Actions, no 3.3. Antes do push do vídeo 2.2, crie um repositório vazio e público na sua conta e aponte o origin para ele:

```bash
git remote set-url origin <url do seu repositório>
```

As branches de apoio continuam locais, então `git checkout referencia -- arquivo` segue funcionando.

A API sobe em http://localhost:3000, e o cliente web abre no mesmo endereço.

## O curso, passo a passo

Siga na ordem: cada vídeo parte do que o anterior deixou pronto, e termina criando a tag de início do próximo. Para começar de um vídeo qualquer, veja [Pular para um vídeo](#pular-para-um-vídeo).

### Aula 1 · SDD na prática com o Spec Kit · [guia](guia/aula-1.md)

**Você sai com:** uma feature, o cancelamento de pedido, conduzida da spec à implementação com o Spec Kit, e a lista do que esse fluxo não confere sozinho.

1. **1.1 · O curso, a TechLog API e o percurso.** Branches de apoio, conferência do ambiente e a API no ar.
2. **1.2 · Constituição e spec da feature.** `specify init`, a constituição e a spec do cancelamento, com o clarify.
3. **1.3 · Plano, tarefas e implementação.** O agente implementa a partir da spec, com testes.
4. **1.4 · O que ninguém confere.** O diagnóstico mostra o que a spec não garantiu: documentação, cliente e API divergindo.

### Aula 2 · A spec que a máquina confere · [guia](guia/aula-2.md)

**Você sai com:** o contrato de Pedidos em OpenAPI 3.1 e os critérios de aceite como testes que rodam.

1. **2.1 · O contrato de Pedidos em OpenAPI 3.1.** O contrato descreve a API como ela é hoje.
2. **2.2 · Critérios de aceite como teste.** Cada critério vira um teste, e o repositório vai para o seu GitHub.

### Aula 3 · Portões no pull request · [guia](guia/aula-3.md)

**Você sai com:** o contrato conferido a cada pull request, com style guide, breaking change e depreciação.

1. **3.1 · Style guide como código com Spectral.** As regras do contrato viram lint.
2. **3.2 · Breaking change antes do merge com oasdiff.** A quebra é barrada antes de entrar, e a depreciação mostra o caminho certo.
3. **3.3 · O portão no pull request.** O GitHub Actions roda os portões, a regra da main exige o check, e uma mudança do agente é barrada.

### Aula 4 · O servidor contra o contrato · [guia](guia/aula-4.md)

**Você sai com:** um mock gerado do contrato, o servidor real testado contra ele e os tipos do código gerados do contrato.

1. **4.1 · Mock a partir do contrato com Prism.** O cliente trabalha contra o mock, sem a API.
2. **4.2 · A resposta real contra o contrato com Schemathesis.** O servidor de verdade é conferido contra o contrato.
3. **4.3 · Casos que ninguém escreveu.** Dados inválidos gerados, e a conformidade no pull request.
4. **4.4 · Na sua stack: tipos gerados.** O contrato vira tipos, e o código que diverge não compila.

### Aula 5 · O agente dentro da esteira · [guia](guia/aula-5.md)

**Você sai com:** o agente trabalhando com as regras e os portões do projeto, e um eval que mede quantas vezes ele acerta.

1. **5.1 · Constituição e AGENTS.md com os portões.** As regras e os portões viram instruções que o agente lê.
2. **5.2 · A mesma feature, agora com a esteira.** O cancelamento refeito do zero: as regras mudam o plano antes de mudar o código.
3. **5.3 · Eval de conformidade.** O agente implementa sozinho, com dois contextos, e um corretor dá a nota.
4. **5.4 · Encerramento e plano de adoção em 90 dias.** A esteira inteira e como levar para o seu time.

## Como o repositório está organizado

| Branch | O que tem |
|---|---|
| `main` | O ponto de partida: a API legada, sem contrato, sem portões e sem Spec Kit. É onde você trabalha |
| `referencia` | A versão final de cada arquivo do curso. Quando o seu resultado sair diferente, traga o arquivo com `git checkout referencia -- <arquivo>` |
| `sincronia-2.1` | O fim da Aula 1, para todo mundo começar a Aula 2 na mesma base |
| `reserva-1.3` | O resultado do vídeo 1.3, com a feature implementada e testes, para quando a sua execução travar |

**Dois tipos de tag.**

| Tag | O que marca |
|---|---|
| `v1.3-inicio`, `v2.2-inicio` e as outras sem prefixo | O **seu** caminho. Você cria cada uma no fim do vídeo, seguindo o guia |
| `curso/v1.2-inicio` a `curso/v5.4-inicio` | O estado da gravação no início de cada vídeo. Vêm com o repositório e servem para pular para um vídeo ou comparar o seu resultado |

A `curso/v5.1-fim` marca a `main` no fim do 5.1, antes do preparo do 5.2. Todas as tags `curso/` trazem este README e o guia atualizados.

O `CLAUDE.md`, na raiz, pede ao agente que não leia o material de apoio do curso: as pastas `prompts/` e `guia/`, este README, o `guia.html`, as branches acima, menos a `main`, e as tags `curso/`. Sem isso, o agente acharia as respostas de referência e as soluções prontas, e o fluxo do curso perderia o sentido: ele deixaria de perguntar o que falta e copiaria o que já está pronto. Se você usar outro agente, dê a ele a mesma instrução.

## Comandos do curso

A coluna Vídeo diz quando cada comando passa a existir no seu repositório.

| Comando | O que faz | Vídeo |
|---|---|---|
| `npm run dev` | Sobe a API e o cliente | 1.1 |
| `npm run conferir` | Mostra o que falta na sua máquina | Antes do curso |
| `npm run diagnostico` | Compara documentação, cliente e API | 1.4 |
| `npm run test:aceite` | Testes de aceite | 2.2 |
| `npm run contrato:lint` | Style guide do contrato, com Spectral | 3.1 |
| `npm run contrato:quebras` | Breaking change contra a main, com oasdiff | 3.2 |
| `npm run oasdiff:instalar` | Baixa o oasdiff para a pasta bin/ | 3.2 |
| `npm run contrato:changelog` | Changelog do contrato | 3.2 |
| `npm run mock` | Mock do contrato, com Prism | 4.1 |
| `npm run conformidade` | Respostas do servidor contra o contrato, com Schemathesis | 4.2 |
| `npm run conformidade:completa` | Dados válidos e inválidos | 4.3 |
| `npm run gerar:tipos` e `npm run tipos` | Tipos gerados do contrato e compilação | 4.4 |
| `npm run portoes` | Todos os portões, com placar | 5.1 |
| `npm run preparar:5.2` | Tira o cancelamento para o ponto de partida do 5.2 | 5.2 |
| `npm run eval` | Eval do agente | 5.3 |

## Se você se perder

**Voltar ao começo de um vídeo que você já fez.** Use a tag que você criou:

```bash
git reset --hard v2.2-inicio
```

**Comparar o seu resultado com o da gravação.** Diferenças são esperadas no que o agente escreveu, como specs e testes. Nos arquivos que vêm da referência, o resultado deve bater:

```bash
git --no-pager diff --stat curso/v3.1-inicio v3.1-inicio -- src openapi tests
```

**Trazer um arquivo pronto, sem mexer no resto.** A referência tem a versão final de cada arquivo:

```bash
git checkout referencia -- caminho/do/arquivo
```

**Começar a Aula 2 na mesma base de todo mundo.** É o último passo do vídeo 1.4: ele troca o código pelo da `sincronia-2.1` e mantém as suas specs:

```bash
git checkout --no-overlay sincronia-2.1 -- src cliente
git rm -r -q -f --ignore-unmatch tests
git add -A
git commit -m "Ponto de sincronia da Aula 2"
git tag v2.1-inicio
```

**O agente travou no vídeo 1.3.** Traga o resultado pronto e siga do passo 7 do guia:

```bash
git checkout reserva-1.3 -- src specs tests
```

### Pular para um vídeo

Volte a `main` para o estado da gravação no início do vídeo e crie a sua tag nele. O reset descarta o que você fez na `main`. Se quiser guardar, crie antes uma branch com `git branch meu-caminho`.

```bash
git switch main
git reset --hard curso/v4.2-inicio
git tag -f v4.2-inicio
npm install
```

Troque `4.2` pelo vídeo, de `1.2` a `5.1`. O Spec Kit já vem nas tags: a partir do 1.3, você não precisa rodar o `specify init`, só ter o Claude Code instalado.

**A partir do 5.2, a Aula 5 trabalha em outras branches.** Para pular para o 5.2, o 5.3 ou o 5.4:

```bash
git switch main
git reset --hard curso/v5.1-fim
git tag -f v5.2-inicio curso/v5.2-inicio
npm install
```

- **5.2:** siga do passo 1 do guia, sem o preparo.
- **5.3:** crie também a branch da feature e a sua tag:

  ```bash
  git switch -C cancelamento-na-esteira curso/v5.3-inicio
  git tag -f v5.3-inicio
  export CONTRATO_BASE=v5.2-inicio
  ```

- **5.4:** nada além disso. O 5.4 roda na `main`.

**O seu GitHub depois de pular.** A partir do 2.2, os vídeos usam o seu repositório no GitHub. Se ele ainda não existe, crie como em [Primeiros passos](#primeiros-passos) e envie com `git push -u origin main`. Se já existe com outro histórico, envie com `git push -f origin main`. Se a regra da `main`, criada no 3.3, recusar o push, desligue a regra no GitHub, envie e ligue de novo.

### Problemas comuns na instalação

**O uv falha com `failed to build pyyaml`.** O uv escolheu um Python novo demais, ou um que já estava na sua máquina, e o PyYAML, dependência do Schemathesis, ainda não tem pacote pronto para ele. Fixe a versão 3.12 e feche o VS Code inteiro antes de tentar de novo. Você não precisa instalar esse Python: o uv baixa sozinho.

```bash
# Windows, no PowerShell
setx UV_PYTHON 3.12
# Mac, no terminal
echo 'export UV_PYTHON=3.12' >> ~/.zshrc
```

**`claude`, `uv`, `specify` ou `gh` não encontrado.** Feche o VS Code inteiro e abra de novo, não só o terminal. Para o `specify`, rode `uv tool update-shell` antes.

**No Windows, o `git add` avisa `CRLF will be replaced by LF`.** É esperado. Alguns arquivos são gravados com o fim de linha do Windows, e o repositório converte para LF no commit. Siga normalmente.

Dúvidas e o que você levou para o seu repositório: fórum do curso na Alura.

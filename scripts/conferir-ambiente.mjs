// Confere, em um minuto, se a máquina está pronta para gravar ou acompanhar o curso.
// Uso: node scripts/conferir-ambiente.mjs
// Não instala nada. Só mostra o que falta.

import { spawnSync } from 'node:child_process';

const win = process.platform === 'win32';
const linhas = [];
const ok = (nome, passou, detalhe) => linhas.push({ nome, passou, detalhe });
// No Windows, o comando vai como um texto só para o shell. Lista de argumentos com shell ligado
// gera o aviso de depreciação DEP0190 no Node 24 ou mais novo.
const rodar = (cmd, args) => win
  ? spawnSync([cmd, ...args].join(' '), { encoding: 'utf8', shell: true, timeout: 20000 })
  : spawnSync(cmd, args, { encoding: 'utf8', timeout: 20000 });

function versao(cmd, args = ['--version']) {
  const r = rodar(cmd, args);
  if (r.error || r.status !== 0) return null;
  return (r.stdout || r.stderr).trim().split('\n')[0];
}

// Ferramentas
const node = process.versions.node;
const [nodeMaior, nodeMenor] = node.split('.').map(Number);
ok('Node 24.18 ou mais novo', nodeMaior > 24 || (nodeMaior === 24 && nodeMenor >= 18), `v${node}`);
for (const [nome, cmd, args] of [
  ['Git', 'git'],
  ['GitHub CLI', 'gh'],
  ['uv', 'uv'],
  ['Claude Code', 'claude'],
]) {
  const v = versao(cmd, args);
  ok(nome, Boolean(v), v ?? 'não encontrado no PATH');
}
// O specify version abre com um banner; a saída em JSON traz só a versão.
const specJson = rodar('specify', ['version', '--json']);
let spec = null;
try { spec = JSON.parse(specJson.stdout).cli_version; } catch {}
// O Spec Kit é instalado durante o curso. Antes disso, aparece como pendente, sem contar como falta.
ok('Spec Kit na versão 1.2.0', spec === null ? 'depois' : spec === '1.2.0', spec ?? 'entra durante o curso');

const gh = rodar('gh', ['auth', 'status']);
ok('GitHub CLI autenticado', gh.status === 0, gh.status === 0 ? 'ok' : 'rode gh auth login');

const nomeGit = versao('git', ['config', 'user.name']);
ok('Git com nome configurado', Boolean(nomeGit), nomeGit ?? 'rode git config --global user.name "Seu Nome"');

if (win) {
  const shell = process.env.SHELL ?? '';
  ok('Terminal Git Bash', shell.includes('bash'), shell || 'abra pelo Git Bash');
  const crlf = versao('git', ['config', 'core.autocrlf']);
  ok('Fins de linha', true, `core.autocrlf=${crlf ?? 'padrão'}; o .gitattributes do repositório fixa LF`);
}

// Rede: cada endereço que o curso usa
// Um proxy corporativo costuma responder 403 no lugar do site, então cada endereço
// tem o status que prova o acesso de verdade. O pedido vai com range, para baixar
// só um byte; por isso 206 também conta como acesso.
const enderecos = [
  ['GitHub', 'https://github.com/oasdiff/oasdiff', (s) => s === 200 || s === 206],
  ['Downloads do GitHub (oasdiff)', 'https://github.com/oasdiff/oasdiff/releases/download/v1.33.0/oasdiff_1.33.0_linux_amd64.tar.gz', (s) => s === 200 || s === 206],
  ['Registro do npm', 'https://registry.npmjs.org/express', (s) => s === 200 || s === 206],
  ['PyPI (Schemathesis e Spec Kit)', 'https://pypi.org/simple/schemathesis/', (s) => s === 200 || s === 206],
  ['API da Anthropic (Claude Code)', 'https://api.anthropic.com/v1/models', (s) => s === 401 || s === 200],
];
for (const [nome, url, prova] of enderecos) {
  try {
    const r = await fetch(url, { headers: { range: 'bytes=0-0' }, signal: AbortSignal.timeout(15000) });
    ok(`Rede: ${nome}`, prova(r.status), `HTTP ${r.status}`);
  } catch (e) {
    ok(`Rede: ${nome}`, false, `sem acesso (${e.cause?.code ?? e.name})`);
  }
}

console.log('\nConferência do ambiente\n');
const rotulo = (p) => (p === 'depois' ? 'depois' : p ? 'ok    ' : 'FALTA ');
for (const l of linhas) console.log(`${rotulo(l.passou)}  ${l.nome.padEnd(40)} ${l.detalhe}`);
const faltas = linhas.filter((l) => !l.passou).length;
console.log(faltas ? `\n${faltas} item(ns) para resolver.` : '\nTudo pronto.');
process.exit(faltas ? 1 : 0);

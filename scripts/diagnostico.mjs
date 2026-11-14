// Compara três fontes sobre os campos de um pedido:
// o que a documentação diz, o que o cliente lê e o que a API devolve.
// Uso: npm run diagnostico            (API em http://localhost:3000)
//      npm run diagnostico -- http://localhost:4010

import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:3000';

const doc = readFileSync('docs/api-pedidos.md', 'utf8');
const blocoJson = doc.match(/```json\r?\n([\s\S]*?)```/)[1];
const naDocumentacao = Object.keys(JSON.parse(blocoJson));

const cliente = readFileSync('cliente/app.js', 'utf8');
const noCliente = [...new Set([...cliente.matchAll(/\bp\.([a-zA-Z_]+)/g)].map((m) => m[1]))];

let naApi;
try {
  const resposta = await fetch(`${base}/pedidos`);
  // Junta os campos de todos os pedidos: campo opcional, como canceladoEm, só aparece em alguns.
  const pedidos = await resposta.json();
  naApi = [...new Set(pedidos.flatMap((p) => Object.keys(p)))];
} catch (erro) {
  console.error(`Não consegui falar com a API em ${base}. Ela está rodando? (npm run dev)`);
  process.exit(2);
}

const todos = [...new Set([...naDocumentacao, ...noCliente, ...naApi])];
const marca = (lista, campo) => (lista.includes(campo) ? 'sim' : '·');

console.log(`\nCampos de um pedido em ${base}\n`);
console.log('campo'.padEnd(18), 'documentação'.padEnd(14), 'cliente lê'.padEnd(12), 'API devolve');
console.log('-'.repeat(58));
let problemas = 0;
for (const campo of todos) {
  const doc_ = marca(naDocumentacao, campo);
  const cli = marca(noCliente, campo);
  const api = marca(naApi, campo);
  const alerta = cli === 'sim' && api === '·' ? '  <- o cliente lê e a API não devolve' : '';
  if (alerta) problemas++;
  console.log(campo.padEnd(18), doc_.padEnd(14), cli.padEnd(12), api + alerta);
}
const docErrada = naDocumentacao.filter((c) => !naApi.includes(c));
console.log('\nDocumentação desatualizada em:', docErrada.length ? docErrada.join(', ') : 'nada');
console.log('Campos que o cliente lê e a API não devolve:', problemas || 'nenhum');
// Sai sempre com 0: o diagnóstico informa, não barra. Assim o npm não acrescenta
// linhas de erro embaixo da tabela.
process.exit(0);

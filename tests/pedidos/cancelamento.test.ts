import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { criarApp } from '../../src/app.js';

async function comApp<T>(fn: (url: string) => Promise<T>): Promise<T> {
  const app = criarApp();
  const servidor = app.listen(0);
  await new Promise<void>((resolve) => servidor.once('listening', resolve));
  const { port } = servidor.address() as AddressInfo;
  try {
    return await fn(`http://localhost:${port}`);
  } finally {
    await new Promise<void>((resolve) => servidor.close(() => resolve()));
  }
}

// User Story 1 - Cancelar um pedido elegível

test('cancela pedido elegível e registra o motivo informado', async () => {
  await comApp(async (url) => {
    const resposta = await fetch(`${url}/pedidos/PED-1001/cancelamento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: 'cliente desistiu' }),
    });

    assert.equal(resposta.status, 200);
    const corpo = await resposta.json();
    assert.equal(corpo.status, 'cancelado');
    assert.equal(corpo.motivo, 'cliente desistiu');
    assert.ok(corpo.canceladoEm, 'canceladoEm deveria estar preenchido');
  });
});

test('cancela pedido elegível sem motivo e não inclui o campo na resposta', async () => {
  await comApp(async (url) => {
    const resposta = await fetch(`${url}/pedidos/PED-1002/cancelamento`, { method: 'POST' });

    assert.equal(resposta.status, 200);
    const corpo = await resposta.json();
    assert.equal(corpo.status, 'cancelado');
    assert.ok(corpo.canceladoEm, 'canceladoEm deveria estar preenchido');
    assert.equal('motivo' in corpo, false, 'motivo não deveria aparecer quando não informado');
  });
});

test('cancelar pedido inexistente retorna 404 em Problem Details', async () => {
  await comApp(async (url) => {
    const resposta = await fetch(`${url}/pedidos/PED-0000/cancelamento`, { method: 'POST' });

    assert.equal(resposta.status, 404);
    assert.ok(resposta.headers.get('content-type')?.startsWith('application/problem+json'));
    const corpo = await resposta.json();
    assert.equal(corpo.type, '/problemas/pedido-nao-encontrado');
    assert.equal(corpo.status, 404);
    assert.equal(corpo.instance, '/pedidos/PED-0000/cancelamento');
  });
});

// User Story 2 - Bloquear cancelamento de pedido enviado ou entregue

test('pedido já enviado não pode ser cancelado', async () => {
  await comApp(async (url) => {
    const resposta = await fetch(`${url}/pedidos/PED-1003/cancelamento`, { method: 'POST' });

    assert.equal(resposta.status, 409);
    assert.ok(resposta.headers.get('content-type')?.startsWith('application/problem+json'));
    const corpo = await resposta.json();
    assert.equal(corpo.type, '/problemas/pedido-nao-cancelavel');
    assert.match(corpo.detail, /enviado/);
  });
});

test('pedido já entregue não pode ser cancelado', async () => {
  await comApp(async (url) => {
    const resposta = await fetch(`${url}/pedidos/PED-1004/cancelamento`, { method: 'POST' });

    assert.equal(resposta.status, 409);
    const corpo = await resposta.json();
    assert.equal(corpo.type, '/problemas/pedido-nao-cancelavel');
    assert.match(corpo.detail, /entregue/);
  });
});

test('pedido já cancelado não pode ser cancelado de novo', async () => {
  await comApp(async (url) => {
    const primeiro = await fetch(`${url}/pedidos/PED-1001/cancelamento`, { method: 'POST' });
    assert.equal(primeiro.status, 200);

    const segundo = await fetch(`${url}/pedidos/PED-1001/cancelamento`, { method: 'POST' });
    assert.equal(segundo.status, 409);
    const corpo = await segundo.json();
    assert.equal(corpo.type, '/problemas/pedido-nao-cancelavel');
    assert.match(corpo.detail, /cancelado/);
  });
});

// User Story 3 - Ver pedidos cancelados na lista

test('pedido cancelado continua aparecendo na lista, com status e data', async () => {
  await comApp(async (url) => {
    const cancelamento = await fetch(`${url}/pedidos/PED-1001/cancelamento`, { method: 'POST' });
    assert.equal(cancelamento.status, 200);

    const listagem = await fetch(`${url}/pedidos`);
    const pedidos = await listagem.json();
    const pedido = pedidos.find((p: { id: string }) => p.id === 'PED-1001');

    assert.ok(pedido, 'PED-1001 deveria continuar na lista');
    assert.equal(pedido.status, 'cancelado');
    assert.ok(pedido.canceladoEm, 'canceladoEm deveria estar preenchido na lista');
  });
});

// Cliente da TechLog API. Lista os pedidos.
// Por padrão fala com a API no mesmo endereço da página.
// Para apontar para outro servidor, como o mock, use ?api=http://localhost:4010

const api = new URLSearchParams(location.search).get('api') ?? '';
document.getElementById('origem').textContent = `Dados de ${api || location.origin}`;

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

async function carregar() {
  const conteudo = document.getElementById('conteudo');
  try {
    const resposta = await fetch(`${api}/pedidos`);
    const pedidos = await resposta.json();
    const linhas = pedidos.map((p) => `
      <tr>
        <td>${p.id}</td>
        <td>${p.cliente}</td>
        <td><span class="selo">${p.status}</span></td>
        <td class="valor">${moeda.format(p.valor_total)}</td>
        <td>${p.forma_pagamento.tipo}</td>
      </tr>`).join('');
    conteudo.innerHTML = `
      <table>
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Status</th><th>Total</th><th>Pagamento</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>`;
  } catch (erro) {
    conteudo.innerHTML = `<div class="erro">Não foi possível mostrar os pedidos: ${erro.message}</div>`;
  }
}

carregar();

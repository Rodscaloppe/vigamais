// Monta o menu lateral em todas as telas. A página atual vem de <body data-pagina="...">.
(function () {
  var itens = [
    { href: 'index.html', id: 'painel', texto: 'Painel' },
    { grupo: 'OBRA' },
    { href: 'obra.html', id: 'obra', texto: 'Obras e custos' },
    { href: 'assistente.html', id: 'assistente', texto: 'Assistente de compras (IA)' },
    { href: 'suprimentos.html', id: 'suprimentos', texto: 'Suprimentos e cotações' },
    { href: 'planilha.html', id: 'planilha', texto: 'Planilha de cotações' },
    { href: 'calculadora.html', id: 'calculadora', texto: 'Calculadora de materiais' },
    { href: 'cesta.html', id: 'cesta', texto: 'Cesta de compras e curva ABC' },
    { href: 'fornecedores.html', id: 'fornecedores', texto: 'Ranking de fornecedores' },
    { href: 'diario.html', id: 'diario', texto: 'Diário de obra' },
    { grupo: 'VENDAS' },
    { href: 'atendimento.html', id: 'atendimento', texto: 'Atendimento (WhatsApp)' },
    { href: 'funil.html', id: 'funil', texto: 'Funil de vendas' },
    { href: 'campanhas.html', id: 'campanhas', texto: 'Campanhas e origem dos leads' },
    { href: 'espelho.html', id: 'espelho', texto: 'Espelho de vendas' },
    { href: 'contratos.html', id: 'contratos', texto: 'Contratos e chaves' },
    { grupo: 'GESTÃO' },
    { href: 'financeiro.html', id: 'financeiro', texto: 'Financeiro e contabilidade' },
    { href: 'assistencia.html', id: 'assistencia', texto: 'Assistência técnica' },
    { grupo: 'INTELIGÊNCIA' },
    { href: 'agentes.html', id: 'agentes', texto: 'Agentes de IA' },
    { href: 'autonomia.html', id: 'autonomia', texto: 'Autonomia e travas da IA' },
    { href: 'ideias.html', id: 'ideias', texto: 'Ideias e próximos passos' }
  ];
  var atual = document.body.getAttribute('data-pagina');
  var nav = document.getElementById('menu');
  if (!nav) return;

  var marca = document.createElement('div');
  marca.className = 'marca';
  marca.innerHTML = 'Viga<span>mais</span>';
  nav.appendChild(marca);

  itens.forEach(function (item) {
    var el;
    if (item.grupo) {
      el = document.createElement('div');
      el.className = 'grupo';
      el.textContent = item.grupo;
    } else {
      el = document.createElement('a');
      el.href = item.href;
      el.textContent = item.texto;
      if (item.id === atual) el.setAttribute('aria-current', 'page');
    }
    nav.appendChild(el);
  });
})();

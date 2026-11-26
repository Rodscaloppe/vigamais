// Memória de preços compartilhada entre as telas (planilha, assistente, calculadora, fornecedores).
// Nesta versão de exemplo os dados ficam no localStorage do navegador.
(function () {
  var CHAVE = 'vigamais.planilha.v1';
  var VALIDADE_DIAS = 15;

  function isoDe(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function diasAtras(n) { var d = new Date(); d.setDate(d.getDate() - n); return isoDe(d); }
  function utc(iso) { var p = iso.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function somaDias(iso, n) { return isoDe(new Date(utc(iso) + n * 86400000 + new Date().getTimezoneOffset() * 60000)); }
  function dataBR(iso) { var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  var HOJE = isoDe(new Date());

  function reais(n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function numero(n, casas) { return n.toLocaleString('pt-BR', { minimumFractionDigits: casas || 0, maximumFractionDigits: casas || 0 }); }
  function lerPreco(texto) {
    var t = String(texto).trim().replace(/[R$\s]/g, '');
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(t);
    return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
  }

  // O que se sabe de cada loja além do preço (exemplo). No sistema, vem do histórico de pedidos e entregas.
  var LOJAS = {
    'Depósito Aroeira': { resposta: 96, minutos: 12, pontualidade: 94, frete: 0 },
    'Materiais Ipê': { resposta: 88, minutos: 9, pontualidade: 97, frete: 380 },
    'Ferragens Jatobá': { resposta: 81, minutos: 21, pontualidade: 86, frete: 250 },
    'Constrular Cedro': { resposta: 52, minutos: 44, pontualidade: 90, frete: 300 },
    'Concreteira Aroeira': { resposta: 92, minutos: 7, pontualidade: 95, frete: 0 },
    'Concretos Ipê': { resposta: 85, minutos: 15, pontualidade: 88, frete: 0 },
    'Usina Jatobá': { resposta: 60, minutos: 38, pontualidade: 82, frete: 0 },
    'Olaria Cedro': { resposta: 74, minutos: 26, pontualidade: 79, frete: 420 }
  };

  function exemplo() {
    var A = 'Depósito Aroeira', I = 'Materiais Ipê', J = 'Ferragens Jatobá', C = 'Constrular Cedro';
    var W = 'WhatsApp · texto', AU = 'WhatsApp · áudio', P = 'Orçamento em PDF', L = 'Ligação da IA';
    var bruto = [
      ['Aço CA-50 10 mm', 'kg', A, 7.62, 66, W], ['Aço CA-50 10 mm', 'kg', A, 7.28, 2, W],
      ['Aço CA-50 10 mm', 'kg', I, 7.45, 2, L], ['Aço CA-50 10 mm', 'kg', J, 7.62, 2, AU],
      ['Cimento CP II-F 32 50 kg', 'saco', A, 35.60, 40, W], ['Cimento CP II-F 32 50 kg', 'saco', A, 34.90, 2, W],
      ['Cimento CP II-F 32 50 kg', 'saco', I, 33.80, 2, L], ['Cimento CP II-F 32 50 kg', 'saco', J, 35.50, 2, AU],
      ['Areia média', 'm³', A, 152.00, 2, W], ['Areia média', 'm³', I, 144.00, 30, W], ['Areia média', 'm³', I, 139.00, 2, L],
      ['Brita 1', 'm³', A, 126.00, 2, W], ['Brita 1', 'm³', I, 129.00, 2, L], ['Brita 1', 'm³', J, 131.00, 2, P],
      ['Concreto usinado fck 30', 'm³', 'Concreteira Aroeira', 505.00, 1, W], ['Concreto usinado fck 30', 'm³', 'Concreteira Aroeira', 498.00, 1, AU],
      ['Concreto usinado fck 30', 'm³', 'Concretos Ipê', 506.00, 1, W], ['Concreto usinado fck 30', 'm³', 'Usina Jatobá', 515.00, 1, L],
      ['Argamassa AC-II 20 kg', 'saco', I, 18.20, 0, W], ['Argamassa AC-II 20 kg', 'saco', I, 17.90, 0, W],
      ['Argamassa AC-II 20 kg', 'saco', A, 18.40, 0, P], ['Argamassa AC-II 20 kg', 'saco', J, 18.90, 0, AU], ['Argamassa AC-II 20 kg', 'saco', C, 18.20, 0, L],
      ['Vergalhão CA-50 8 mm', 'kg', A, 7.55, 0, P], ['Vergalhão CA-50 8 mm', 'kg', I, 7.80, 0, W],
      ['Vergalhão CA-50 8 mm', 'kg', J, 7.70, 0, AU], ['Vergalhão CA-50 8 mm', 'kg', C, 7.95, 0, L],
      ['Bloco cerâmico 14×19×29', 'un.', 'Olaria Cedro', 2.30, 25, W]
    ];
    return bruto.map(function (r, i) {
      return { seq: i + 1, material: r[0], un: r[1], loja: r[2], preco: r[3], data: diasAtras(r[4]), origem: r[5] };
    });
  }

  function carregar() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (Array.isArray(salvo) && salvo.length) return salvo;
    } catch (e) { /* sem armazenamento: segue com o exemplo */ }
    return exemplo();
  }
  function salvar(lista) {
    try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch (e) { /* ignora */ }
  }
  function chave(material, loja) { return material.trim().toLowerCase() + '|' + loja.trim().toLowerCase(); }

  // Agrupa por material + loja, em ordem de data (e de chegada no mesmo dia).
  function grupos(cotacoes) {
    var mapa = {};
    cotacoes.forEach(function (c) {
      var k = chave(c.material, c.loja);
      if (!mapa[k]) mapa[k] = { k: k, material: c.material, loja: c.loja, un: c.un, valores: [] };
      mapa[k].valores.push(c);
    });
    var lista = Object.keys(mapa).map(function (k) { return mapa[k]; });
    lista.forEach(function (g) {
      g.valores.sort(function (a, b) { return a.data === b.data ? a.seq - b.seq : (a.data < b.data ? -1 : 1); });
      g.primeiro = g.valores[0];
      g.ultimo = g.valores[g.valores.length - 1];
      g.valeAte = somaDias(g.ultimo.data, VALIDADE_DIAS);
      g.valida = g.valeAte >= HOJE;
    });
    var melhor = {};
    lista.forEach(function (g) {
      if (!g.valida) return;
      var m = g.material.trim().toLowerCase();
      if (!melhor[m] || g.ultimo.preco < melhor[m].ultimo.preco) melhor[m] = g;
    });
    lista.forEach(function (g) { g.melhor = melhor[g.material.trim().toLowerCase()] === g; });
    lista.sort(function (a, b) {
      var m = a.material.localeCompare(b.material, 'pt-BR');
      return m !== 0 ? m : a.ultimo.preco - b.ultimo.preco;
    });
    return lista;
  }

  // Tudo o que a planilha sabe de um material: usado pelo assistente e pela calculadora antes de cotar.
  function consultar(cotacoes, termo) {
    var t = String(termo).trim().toLowerCase();
    if (!t) return null;
    var doMaterial = grupos(cotacoes).filter(function (g) { return g.material.toLowerCase().indexOf(t) >= 0; });
    if (!doMaterial.length) return { situacao: 'sem-preco', grupos: [] };
    var validos = doMaterial.filter(function (g) { return g.valida; });
    if (!validos.length) return { situacao: 'vencido', grupos: doMaterial, ultimo: doMaterial[0] };
    validos.sort(function (a, b) { return a.ultimo.preco - b.ultimo.preco; });
    return { situacao: 'valido', grupos: doMaterial, validos: validos, melhor: validos[0] };
  }

  window.Planilha = {
    CHAVE: CHAVE, VALIDADE_DIAS: VALIDADE_DIAS, HOJE: HOJE, LOJAS: LOJAS,
    dataBR: dataBR, somaDias: somaDias, reais: reais, numero: numero, lerPreco: lerPreco,
    exemplo: exemplo, carregar: carregar, salvar: salvar, chave: chave, grupos: grupos, consultar: consultar
  };
})();

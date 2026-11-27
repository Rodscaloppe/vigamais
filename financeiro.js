// Lançamentos de exemplo da tela Financeiro: tudo fica só na página (recarregar volta ao exemplo).
(function () {
  var CONTAS = [
    { nome: 'Conta da obra · Acácias', emp: 'Jardim das Acácias', sis: 1486000, ext: 1492400 },
    { nome: 'Conta da obra · Mirante', emp: 'Mirante do Parque', sis: 712000, ext: 712000 },
    { nome: 'Conta da obra · Vila Serena', emp: 'Vila Serena', sis: 384000, ext: 384000 },
    { nome: 'Aplicação de liquidez diária', emp: 'Todas', sis: 838000, ext: 838000 }
  ];
  var CONCILIAR = [
    { data: '25/11', desc: 'Pix recebido sem identificação', valor: 6486.40, sug: 'Parece a parcela de um contrato: confirmar o comprador', feito: false },
    { data: '24/11', desc: 'Tarifa bancária', valor: -86.40, sug: 'Lançar como despesa bancária', feito: false }
  ];
  var MOVS = [
    { data: '26/11', desc: 'Medição de empreiteira', sub: 'Acácias · Alvenaria', valor: -64200 },
    { data: '25/11', desc: 'Parcelas de novembro, 12 boletos', sub: 'Acácias e Vila Serena', valor: 38700 },
    { data: '24/11', desc: 'Aço CA-50, 3,8 t · pedido 305', sub: 'Acácias · Estrutura', valor: -28310 },
    { data: '23/11', desc: 'Locação de grua', sub: 'Acácias · Estrutura · parcela de outubro', valor: -18500 }
  ];
  var SEM_ETAPA = [
    { desc: 'Frete de areia', valor: 1240, etapa: '' },
    { desc: 'Aluguel de betoneira', valor: 2900, etapa: '' }
  ];
  var ETAPAS = ['Fundação', 'Estrutura', 'Alvenaria e vedação', 'Instalações', 'Acabamento', 'Administração da obra'];
  var EMPREENDIMENTOS = ['Jardim das Acácias', 'Mirante do Parque', 'Vila Serena', 'Sem obra'];
  var resumo = { receber: 1180000, pagar: 1460000 };
  var mesFechado = false;

  function $(id) { return document.getElementById(id); }
  function el(tag, classe, texto) { var e = document.createElement(tag); if (classe) e.className = classe; if (texto !== undefined) e.textContent = texto; return e; }
  function reais(v) { return (v < 0 ? '−' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function milhoes(v) { return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mi'; }
  // aceita "1.234,56", "1234,56" e "1234.56"
  function lerValor(txt) {
    var t = String(txt).replace(/[R$\s]/g, '');
    if (!t) return null;
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    var n = Number(t);
    return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
  }
  function hoje() { var d = new Date(); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2); }
  function dataCurta(iso) { var p = iso.split('-'); return p[2] + '/' + p[1]; }
  function avisar(texto) { $('msg').textContent = texto; }
  function saldoTotal() { return CONTAS.reduce(function (s, c) { return s + c.sis; }, 0); }

  function pintarResumo() {
    $('k-saldo').textContent = milhoes(saldoTotal());
    $('k-receber').textContent = milhoes(resumo.receber);
    $('k-pagar').textContent = milhoes(resumo.pagar);
  }

  // ---------- Contas a pagar e a receber ----------
  function botaoBaixa(tr, tipo) {
    var td = el('td'), b = el('button', 'btn pequeno-btn', 'Dar baixa');
    b.type = 'button';
    b.addEventListener('click', function () { abrir('baixa', { tr: tr, tipo: tipo }); });
    td.appendChild(b); tr.appendChild(td);
  }
  function prepararLinhas(id, tipo) {
    Array.prototype.forEach.call($(id).rows, function (tr) {
      var celula = tr.cells[tr.cells.length - 1];
      tr.dataset.valor = lerValor(celula.textContent) || 0;
      tr.dataset.nome = tr.cells[0].querySelector('b').textContent;
      botaoBaixa(tr, tipo);
    });
  }
  function novaConta(tipo, d) {
    var tr = el('tr', 'nova'), td = el('td');
    td.appendChild(el('b', '', d.desc)); td.appendChild(el('br')); td.appendChild(el('span', 'pequeno', d.emp));
    tr.appendChild(td);
    var origem = el('td'); origem.appendChild(el('span', 'selo azul', 'lançada à mão')); tr.appendChild(origem);
    tr.appendChild(el('td', '', dataCurta(d.venc)));
    tr.appendChild(el('td', 'num', reais(d.valor)));
    tr.dataset.valor = d.valor; tr.dataset.nome = d.desc;
    botaoBaixa(tr, tipo);
    $(tipo === 'pagar' ? 'tb-pagar' : 'tb-receber').prepend(tr);
    var dias = (new Date(d.venc + 'T00:00:00') - new Date()) / 864e5;
    var entra = dias <= 30;
    if (entra) resumo[tipo] += d.valor;
    pintarResumo();
    avisar('Conta a ' + tipo + ' guardada: ' + d.desc + ', ' + reais(d.valor) + ', vence em ' + dataCurta(d.venc) + '.'
      + (entra ? ' O resumo de 30 dias foi atualizado.' : ' Vence depois de 30 dias, então não entra no resumo.'));
  }
  function darBaixa(ctx, d) {
    var tr = ctx.tr, original = Number(tr.dataset.valor), conta = CONTAS[d.conta], sinal = ctx.tipo === 'pagar' ? -1 : 1;
    conta.sis += sinal * d.valor; conta.ext += sinal * d.valor;
    resumo[ctx.tipo] = Math.max(0, resumo[ctx.tipo] - original);
    MOVS.unshift({ data: hoje(), desc: (ctx.tipo === 'pagar' ? 'Pagamento · ' : 'Recebimento · ') + tr.dataset.nome, sub: conta.nome, valor: sinal * d.valor });
    tr.className = 'baixada';
    var td = tr.cells[tr.cells.length - 1]; td.textContent = '';
    td.appendChild(el('span', 'selo verde', (ctx.tipo === 'pagar' ? 'paga' : 'recebida') + ' em ' + hoje()));
    pintarResumo(); pintarBancos();
    var dif = d.valor - original;
    avisar('Baixa registrada: ' + tr.dataset.nome + ', ' + reais(d.valor) + ' pela ' + conta.nome + '.'
      + (Math.abs(dif) >= 0.01 ? ' Diferença de ' + reais(dif) + ' em relação ao valor da conta (' + (dif > 0 ? 'juros ou multa' : 'desconto') + ').' : '')
      + ' O saldo e as movimentações foram atualizados.');
  }

  // ---------- Caixa e bancos ----------
  function pintarBancos() {
    var corpo = $('tb-bancos'); corpo.textContent = '';
    var tSis = 0, tExt = 0;
    CONTAS.forEach(function (c) {
      var tr = el('tr'), dif = Math.round((c.ext - c.sis) * 100) / 100;
      tSis += c.sis; tExt += c.ext;
      tr.appendChild(el('td')).appendChild(el('b', '', c.nome));
      tr.appendChild(el('td', '', c.emp));
      tr.appendChild(el('td', 'num', reais(c.sis)));
      tr.appendChild(el('td', 'num', reais(c.ext)));
      tr.appendChild(el('td', 'num' + (dif ? ' neg' : ''), dif ? reais(dif) : '—'));
      tr.appendChild(el('td')).appendChild(dif ? el('span', 'selo laranja', 'a conciliar') : el('span', 'selo verde', 'conciliada'));
      corpo.appendChild(tr);
    });
    var t = el('tr', 'total'); t.appendChild(el('td', '', 'Total')); t.appendChild(el('td'));
    t.appendChild(el('td', 'num', reais(tSis))); t.appendChild(el('td', 'num', reais(tExt)));
    var d = Math.round((tExt - tSis) * 100) / 100; t.appendChild(el('td', 'num', d ? reais(d) : '—')); t.appendChild(el('td'));
    corpo.appendChild(t);

    var cc = $('tb-concil'); cc.textContent = '';
    CONCILIAR.forEach(function (x) {
      var tr = el('tr', x.feito ? 'baixada' : '');
      tr.appendChild(el('td', '', x.data)); tr.appendChild(el('td', '', x.desc));
      tr.appendChild(el('td', 'num' + (x.valor < 0 ? ' neg' : ''), reais(x.valor))); tr.appendChild(el('td', '', x.sug));
      var td = el('td');
      if (x.feito) td.appendChild(el('span', 'selo verde', 'lançado'));
      else { var b = el('button', 'btn pequeno-btn', 'Lançar'); b.type = 'button'; b.addEventListener('click', function () { conciliar(x); }); td.appendChild(b); }
      tr.appendChild(td); cc.appendChild(tr);
    });

    var mv = $('tb-mov'); mv.textContent = '';
    MOVS.slice(0, 6).forEach(function (m) {
      var tr = el('tr'), td = el('td');
      tr.appendChild(el('td', '', m.data));
      td.appendChild(el('b', '', m.desc)); td.appendChild(el('br')); td.appendChild(el('span', 'pequeno', m.sub)); tr.appendChild(td);
      tr.appendChild(el('td', 'num' + (m.valor < 0 ? ' neg' : ''), reais(m.valor)));
      mv.appendChild(tr);
    });
    pintarFechamento();
  }
  function conciliar(x) {
    x.feito = true; CONTAS[0].sis = Math.round((CONTAS[0].sis + x.valor) * 100) / 100;
    MOVS.unshift({ data: x.data, desc: x.desc, sub: CONTAS[0].nome + ' · conciliado', valor: x.valor });
    pintarResumo(); pintarBancos();
    var falta = CONCILIAR.filter(function (c) { return !c.feito; }).length;
    avisar('Lançado: ' + x.desc + ', ' + reais(x.valor) + '. ' + (falta ? 'Falta ' + falta + ' lançamento para conciliar a conta Acácias.' : 'A conta Acácias está conciliada: uma pendência do fechamento foi resolvida.'));
  }
  function novaMov(d) {
    var conta = CONTAS[d.conta], v = d.tipo === 'saida' ? -d.valor : d.valor;
    conta.sis += v; conta.ext += v;
    MOVS.unshift({ data: hoje(), desc: d.desc, sub: conta.nome + ' · lançada à mão', valor: v });
    pintarResumo(); pintarBancos();
    avisar('Movimentação guardada: ' + d.desc + ', ' + reais(v) + ' na ' + conta.nome + '. Saldo da conta: ' + reais(conta.sis) + '.');
  }

  // ---------- Fechamento do mês ----------
  function pintarFechamento() {
    var lista = $('chk'); lista.textContent = '';
    var faltaConc = CONCILIAR.filter(function (c) { return !c.feito; }).length;
    var faltaEtapa = SEM_ETAPA.filter(function (c) { return !c.etapa; }).length;
    var pend = (faltaConc ? 1 : 0) + (faltaEtapa ? 1 : 0);
    function item(estado, titulo, sub, extra) {
      var li = el('li'), m = el('span', 'marca' + (estado === 'ok' ? '' : estado === 'pend' ? ' pend' : ' falta'), estado === 'ok' ? '✓' : estado === 'pend' ? '!' : '');
      var meio = el('div'); meio.appendChild(el('b', '', titulo)); meio.appendChild(el('br')); meio.appendChild(el('span', 'pequeno', sub));
      li.appendChild(m); li.appendChild(meio);
      li.appendChild(el('span', 'selo ' + (estado === 'ok' ? 'verde' : estado === 'pend' ? 'laranja' : ''), estado === 'ok' ? 'pronto' : estado === 'pend' ? 'pendente' : 'aguarda'));
      if (extra) li.appendChild(extra);
      lista.appendChild(li);
    }
    item('ok', 'Toda compra do mês tem nota anexada', '41 de 41 pedidos e medições');
    item('ok', 'Débitos iguais aos créditos', 'conferido em todos os lançamentos do mês');
    item(faltaConc ? 'pend' : 'ok', 'Conciliação bancária', faltaConc ? '3 de 4 contas; faltam ' + faltaConc + ' lançamento(s) na conta Acácias, na aba Caixa e bancos' : '4 de 4 contas conciliadas');
    var extra = null;
    if (faltaEtapa) {
      extra = el('div', 'extra');
      SEM_ETAPA.forEach(function (c) {
        if (c.etapa) return;
        var linha = el('div', 'linha-etapa'), sel = el('select'), b = el('button', 'btn pequeno-btn', 'Definir');
        sel.setAttribute('aria-label', 'Etapa de ' + c.desc);
        sel.appendChild(new Option('Escolha a etapa', ''));
        ETAPAS.forEach(function (e) { sel.appendChild(new Option(e, e)); });
        b.type = 'button';
        b.addEventListener('click', function () {
          if (!sel.value) { avisar('Escolha a etapa de “' + c.desc + '” antes de definir.'); sel.focus(); return; }
          c.etapa = sel.value; pintarFechamento();
          avisar(c.desc + ', ' + reais(c.valor) + ', agora pertence à etapa ' + c.etapa + '.');
        });
        linha.appendChild(el('span', '', c.desc + ' · ' + reais(c.valor))); linha.appendChild(sel); linha.appendChild(b);
        extra.appendChild(linha);
      });
    }
    item(faltaEtapa ? 'pend' : 'ok', 'Custos de obra com etapa definida', faltaEtapa ? faltaEtapa + ' custo(s) entraram sem etapa' : 'todos os custos têm etapa', extra);
    item(mesFechado ? 'ok' : 'falta', 'Custo apropriado às unidades vendidas', mesFechado ? 'calculado no fechamento' : 'roda sozinho depois das pendências');
    item(mesFechado ? 'ok' : 'falta', 'Pacote para o contador', 'DRE, balanço, balancete, diário e razão, em CSV e PDF');

    var selo = $('st-mes'), bt = $('bt-fechar'), nota = $('nota-fechar');
    if (mesFechado) { selo.className = 'selo verde'; selo.textContent = 'fechado em ' + hoje(); bt.disabled = true; bt.textContent = 'Novembro fechado'; nota.textContent = 'Só a diretoria reabre um mês fechado.'; }
    else if (pend) { selo.className = 'selo ambar'; selo.textContent = 'em aberto · ' + pend + (pend === 1 ? ' pendência' : ' pendências'); bt.disabled = true; nota.textContent = 'Libera quando ' + (pend === 1 ? 'a pendência for resolvida.' : 'as duas pendências forem resolvidas.'); }
    else { selo.className = 'selo azul'; selo.textContent = 'pronto para fechar'; bt.disabled = false; nota.textContent = 'Sem pendências. Depois de fechado, o mês não aceita lançamento.'; }
  }
  $('bt-fechar').addEventListener('click', function () { mesFechado = true; pintarFechamento(); avisar('Novembro fechado. O pacote do contador foi gerado e o mês não aceita mais lançamento.'); });

  // ---------- Formulário ----------
  var janela = $('janela'), atual = null;
  function campo(id, rotulo, tipo, opcoes, valor) {
    var c = el('div', 'campo'), l = el('label', '', rotulo), i;
    l.htmlFor = id;
    if (tipo === 'select') { i = el('select'); opcoes.forEach(function (o, n) { i.appendChild(new Option(o, typeof valor === 'object' && valor ? valor[n] : n)); }); }
    else { i = el('input'); i.type = tipo === 'date' ? 'date' : 'text'; if (tipo === 'valor') i.inputMode = 'decimal'; if (valor !== undefined) i.value = valor; }
    i.id = id; c.appendChild(l); c.appendChild(i); return c;
  }
  function abrir(tipo, ctx) {
    atual = { tipo: tipo, ctx: ctx };
    var campos = $('j-campos'); campos.textContent = ''; $('j-erro').textContent = '';
    var nomes = CONTAS.map(function (c) { return c.nome; });
    if (tipo === 'pagar' || tipo === 'receber') {
      $('j-titulo').textContent = tipo === 'pagar' ? 'Nova conta a pagar' : 'Nova conta a receber';
      var d = new Date(); d.setDate(d.getDate() + 15);
      campos.appendChild(campo('f-desc', tipo === 'pagar' ? 'O que é e para quem' : 'O que é e de quem', 'text'));
      campos.appendChild(campo('f-emp', 'Empreendimento', 'select', EMPREENDIMENTOS, EMPREENDIMENTOS));
      campos.appendChild(campo('f-venc', 'Vencimento', 'date', null, d.toISOString().slice(0, 10)));
      campos.appendChild(campo('f-valor', 'Valor (R$)', 'valor'));
    } else if (tipo === 'mov') {
      $('j-titulo').textContent = 'Lançar movimentação';
      campos.appendChild(campo('f-desc', 'Descrição', 'text'));
      campos.appendChild(campo('f-conta', 'Conta', 'select', nomes));
      campos.appendChild(campo('f-tipo', 'Tipo', 'select', ['Entrada', 'Saída'], ['entrada', 'saida']));
      campos.appendChild(campo('f-valor', 'Valor (R$)', 'valor'));
    } else {
      $('j-titulo').textContent = (ctx.tipo === 'pagar' ? 'Pagar: ' : 'Receber: ') + ctx.tr.dataset.nome;
      campos.appendChild(campo('f-conta', 'Conta de banco', 'select', nomes));
      campos.appendChild(campo('f-valor', ctx.tipo === 'pagar' ? 'Valor pago (R$)' : 'Valor recebido (R$)', 'valor', null,
        Number(ctx.tr.dataset.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })));
    }
    janela.showModal();
    campos.querySelector('input, select').focus();
  }
  $('j-cancela').addEventListener('click', function () { janela.close(); });
  $('j-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var erro = $('j-erro'), valor = lerValor($('f-valor').value), desc = $('f-desc') ? $('f-desc').value.trim() : 'x';
    if (!desc) { erro.textContent = 'Preencha a descrição.'; $('f-desc').focus(); return; }
    if (valor === null) { erro.textContent = 'Informe um valor maior que zero, como 1.250,00.'; $('f-valor').focus(); return; }
    var t = atual.tipo;
    if (t === 'pagar' || t === 'receber') {
      if (!$('f-venc').value) { erro.textContent = 'Escolha o vencimento.'; $('f-venc').focus(); return; }
      novaConta(t, { desc: desc, emp: $('f-emp').value, venc: $('f-venc').value, valor: valor });
    } else if (t === 'mov') novaMov({ desc: desc, conta: Number($('f-conta').value), tipo: $('f-tipo').value, valor: valor });
    else darBaixa(atual.ctx, { conta: Number($('f-conta').value), valor: valor });
    janela.close();
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-novo]'), function (b) {
    b.addEventListener('click', function () { abrir(b.getAttribute('data-novo')); });
  });

  prepararLinhas('tb-pagar', 'pagar'); prepararLinhas('tb-receber', 'receber');
  pintarResumo(); pintarBancos();
})();

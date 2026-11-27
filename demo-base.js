// Motor das telas de exemplo animadas. A página define window.DEMO = { dur, cenas: [segundos], legendas: [[segundo, html]] }.
// Marcações: data-in / data-out (segundos em que o elemento entra e sai); data-flui (não ocupa espaço antes de entrar);
// data-on + data-classe (liga uma classe a partir de um segundo); data-larg="de,para,início,duração" (largura em %);
// data-conta="de,para,início,duração,tipo" (número que cresce; tipo: reais, int, pct1).
(function () {
  var D = window.DEMO, DUR = D.dur;
  function lim(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function suave(x) { x = lim(x); return x * x * (3 - 2 * x); }
  var FORMATO = {
    reais: function (v) { return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); },
    int: function (v) { return Math.round(v).toLocaleString('pt-BR'); },
    pct1: function (v) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  };
  function lista(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  var animados = lista('[data-in]').map(function (e) {
    return { e: e, a: parseFloat(e.getAttribute('data-in')), b: e.hasAttribute('data-out') ? parseFloat(e.getAttribute('data-out')) : Infinity,
      some: e.hasAttribute('data-flui') || e.classList.contains('estado'), parado: e.classList.contains('conversa') || e.classList.contains('quadro') };
  });
  var ligados = lista('[data-on]').map(function (e) { return { e: e, t: parseFloat(e.getAttribute('data-on')), c: e.getAttribute('data-classe') }; });
  var larguras = lista('[data-larg]').map(function (e) { return { e: e, p: e.getAttribute('data-larg').split(',').map(parseFloat) }; });
  var contas = lista('[data-conta]').map(function (e) { var p = e.getAttribute('data-conta').split(','); return { e: e, p: p.slice(0, 4).map(parseFloat), f: FORMATO[p[4]] }; });
  var legenda = document.getElementById('legenda');
  var spans = D.legendas.map(function (l) { var s = document.createElement('span'); s.innerHTML = l[1]; legenda.appendChild(s); return s; });
  var chips = lista('#etapas span');

  function desenhar(t) {
    animados.forEach(function (x) {
      var p = suave((t - x.a) / 0.45), q = isFinite(x.b) ? 1 - suave((t - x.b + 0.3) / 0.3) : 1, visivel = t >= x.a && t < x.b;
      if (x.some) x.e.style.display = visivel ? '' : 'none'; else x.e.style.visibility = visivel ? 'visible' : 'hidden';
      x.e.style.opacity = (p * q).toFixed(3);
      if (!x.parado) x.e.style.transform = 'translateY(' + ((1 - p) * 10).toFixed(1) + 'px)';
    });
    ligados.forEach(function (x) { x.e.classList.toggle(x.c, t >= x.t); });
    larguras.forEach(function (x) { x.e.style.width = (x.p[0] + (x.p[1] - x.p[0]) * suave((t - x.p[2]) / x.p[3])) + '%'; });
    contas.forEach(function (x) { x.e.textContent = x.f(x.p[0] + (x.p[1] - x.p[0]) * suave((t - x.p[2]) / x.p[3])); });
    spans.forEach(function (s, i) {
      var a = D.legendas[i][0], b = i + 1 < D.legendas.length ? D.legendas[i + 1][0] : Infinity;
      s.style.opacity = (suave((t - a) / 0.4) * (isFinite(b) ? 1 - suave((t - b + 0.3) / 0.3) : 1)).toFixed(3);
    });
    chips.forEach(function (c, i) { var fim = i + 1 < D.cenas.length ? D.cenas[i + 1] : Infinity; c.className = t >= fim ? 'feito' : t >= D.cenas[i] ? 'agora' : ''; });
    document.getElementById('progresso').style.width = (lim(t / DUR) * 100) + '%';
  }
  window.desenhar = desenhar; window.DURACAO = DUR;   // usados para gravar o vídeo quadro a quadro

  var gravar = /[?&]gravar=1/.test(location.search), moldura = document.getElementById('moldura');
  function ajustar() { moldura.style.transform = 'translateX(-50%) scale(' + (gravar ? 1 : Math.min(window.innerWidth / 1280, (window.innerHeight - 56) / 720)) + ')'; }
  if (gravar) document.body.classList.add('gravar');
  window.addEventListener('resize', ajustar); ajustar();

  var t = 0, tocando = !gravar, ultimo = null;
  var cursor = document.getElementById('tempo'), relogio = document.getElementById('relogio'), btPlay = document.getElementById('bt-play');
  cursor.max = DUR;
  function mostrar() { desenhar(t); cursor.value = t; relogio.textContent = Math.floor(t) + ' s de ' + DUR + ' s'; btPlay.textContent = tocando ? 'Pausar' : (t >= DUR ? 'Ver de novo' : 'Continuar'); }
  function passo(agora) { if (tocando) { if (ultimo !== null) t += (agora - ultimo) / 1000; if (t >= DUR) { t = DUR; tocando = false; } mostrar(); } ultimo = agora; requestAnimationFrame(passo); }
  btPlay.addEventListener('click', function () { if (t >= DUR) t = 0; tocando = !tocando; mostrar(); });
  document.getElementById('bt-ini').addEventListener('click', function () { t = 0; tocando = true; mostrar(); });
  cursor.addEventListener('input', function () { t = parseFloat(cursor.value); tocando = false; mostrar(); });
  mostrar(); if (!gravar) requestAnimationFrame(passo);
})();

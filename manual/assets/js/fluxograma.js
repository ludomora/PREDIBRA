// assets/js/fluxograma.js
// Fluxograma do acompanhamento nutricional, desenhado como SVG (identidade visual do Plano Alimentar).
// Uso no conteúdo: <figure class="fluxo" data-fluxo="1|2|3|4|todos"></figure>

(function () {
  const TELE = {
    1: { c: 'var(--azul)', lt: 'var(--azul-lt)' },
    2: { c: 'var(--laranja)', lt: 'var(--laranja-lt)' },
    3: { c: 'var(--verde)', lt: 'var(--verde-lt)' },
    4: { c: 'var(--rosa)', lt: 'var(--rosa-lt)' },
  };
  const YES = { c: 'var(--verde-dk)', s: 'var(--verde)' };
  const NO = { c: 'var(--rosa-dk)', s: 'var(--rosa)' };

  const FONT_PX = 13;
  const LINE = 17;
  const PAD_X = 14;
  const PAD_Y = 12;
  const HEX = 18;

  // Text markup: **bold**, *italic*, \n = paragraph break.
  const FLOWS = {
    1: {
      W: 1000,
      nodes: {
        S: { type: 'start', x: 0, cy: 62, w: 170, text: '1ª Teleconsulta' },
        A: { type: 'action', x: 210, cy: 62, w: 165, text: 'Faça o acolhimento inicial e explique o acompanhamento' },
        B: { type: 'action', x: 415, cy: 62, w: 175, text: 'Avalie o consumo de ultraprocessados e defina alimentos prioritários para intervenção' },
        C: { type: 'action', x: 630, cy: 62, w: 165, text: 'Preencha a tabela do diagnóstico de consumo dos ultraprocessados prioritários' },
        D: { type: 'action', x: 835, cy: 62, w: 165, text: 'Pactue conjuntamente as metas de redução dos ultraprocessados prioritários selecionados' },
        N: { type: 'next', x: 790, cy: 178, w: 210, text: 'Ir para a 2ª teleconsulta', next: 2 },
      },
      edges: [
        { from: 'S', fp: 'r', to: 'A', tp: 'l' },
        { from: 'A', fp: 'r', to: 'B', tp: 'l' },
        { from: 'B', fp: 'r', to: 'C', tp: 'l' },
        { from: 'C', fp: 'r', to: 'D', tp: 'l' },
        { pts: n => [[n.N.cx, n.D.b[1]], n.N.t] },
      ],
    },
    2: {
      W: 1000,
      nodes: {
        S: { type: 'start', x: 0, cy: 24, w: 180, text: '2ª Teleconsulta' },
        D1: { type: 'decision', x: 0, cy: 232, w: 180, text: 'O participante conseguiu realizar todas as metas pactuadas?' },
        A: { type: 'action', x: 230, cy: 112, w: 170, text: 'Investigue os principais obstáculos e facilitadores para a execução das metas' },
        B: { type: 'action', x: 440, cy: 112, w: 170, text: 'Retome os ultraprocessados selecionados como prioritários na teleconsulta 1' },
        C: { type: 'action', x: 650, cy: 112, w: 260, text: 'Apresente estratégias para superação dos obstáculos e repactue conjuntamente novas metas de redução dos ultraprocessados' },
        Dd: { type: 'action', x: 230, cy: 352, w: 170, text: 'Investigue os principais facilitadores para a execução das metas' },
        D2: { type: 'decision', x: 440, cy: 352, w: 195, text: 'Existem outros alimentos ultraprocessados identificados para serem alvo de intervenção?' },
        E: { type: 'action', x: 680, cy: 268, w: 230, text: 'Pactue conjuntamente novas metas de redução dos ultraprocessados' },
        F: { type: 'action', x: 680, cy: 410, w: 230, text: 'Avalie o consumo dos *in natura* ou minimamente processados' },
        G: { type: 'action', x: 680, cy: 512, w: 230, text: 'Pactue conjuntamente metas e estratégias para melhorar o consumo desses alimentos' },
        N: { type: 'next', x: 680, cy: 610, w: 230, text: 'Ir para a 3ª teleconsulta', next: 3 },
      },
      edges: [
        { from: 'S', fp: 'b', to: 'D1', tp: 't' },
        { from: 'D1', fp: 'r', to: 'A', tp: 'l', via: 205, label: 'no' },
        { from: 'D1', fp: 'r', to: 'Dd', tp: 'l', via: 205, label: 'yes' },
        { from: 'A', fp: 'r', to: 'B', tp: 'l' },
        { from: 'B', fp: 'r', to: 'C', tp: 'l' },
        { from: 'Dd', fp: 'r', to: 'D2', tp: 'l' },
        { from: 'D2', fp: 'r', to: 'E', tp: 'l', via: 657, label: 'yes' },
        { from: 'D2', fp: 'r', to: 'F', tp: 'l', via: 657, label: 'no' },
        { from: 'F', fp: 'b', to: 'G', tp: 't' },
        { pts: n => [n.C.r, [955, n.C.r[1]], [955, n.N.r[1]], n.N.r] },
        { pts: n => [n.E.r, [955, n.E.r[1]]], arrow: false },
        { pts: n => [n.G.r, [955, n.G.r[1]]], arrow: false },
      ],
    },
    3: {
      W: 1000,
      nodes: {
        S: { type: 'start', x: 0, cy: 24, w: 180, text: '3ª Teleconsulta' },
        D1: { type: 'decision', x: 0, cy: 214, w: 180, text: 'O participante conseguiu realizar todas as metas pactuadas?' },
        A: { type: 'action', x: 230, cy: 124, w: 180, text: 'Investigue os principais obstáculos e facilitadores para a execução das metas' },
        B: { type: 'action', x: 230, cy: 304, w: 180, text: 'Investigue os principais facilitadores para a execução das metas' },
        D2: { type: 'decision', x: 460, cy: 214, w: 215, text: 'Na última consulta, foi realizada a avaliação do consumo de *in natura* ou minimamente processados?' },
        C: { type: 'action', x: 725, cy: 214, w: 255, emphasis: true, text: 'Apresente e explique o **PLANO ALIMENTAR** completo.\nFaça as adaptações necessárias conforme pactuação conjunta, considerando o consumo de *in natura* ou minimamente processados e os facilitadores e obstáculos encontrados pelo participante' },
        F: { type: 'action', x: 477, cy: 420, w: 180, text: 'Avalie o consumo dos *in natura* ou minimamente processados' },
        N: { type: 'next', x: 725, cy: 520, w: 255, text: 'Ir para a 4ª teleconsulta', next: 4 },
      },
      edges: [
        { from: 'S', fp: 'b', to: 'D1', tp: 't' },
        { from: 'D1', fp: 'r', to: 'A', tp: 'l', via: 205, label: 'no' },
        { from: 'D1', fp: 'r', to: 'B', tp: 'l', via: 205, label: 'yes' },
        { from: 'A', fp: 'r', to: 'D2', tp: 'l', via: 435 },
        { from: 'B', fp: 'r', to: 'D2', tp: 'l', via: 435 },
        { from: 'D2', fp: 'r', to: 'C', tp: 'l', label: 'yes' },
        { from: 'D2', fp: 'b', to: 'F', tp: 't', label: 'no' },
        { from: 'F', fp: 'r', to: 'C', tp: 'b' },
        { pts: n => [n.C.r, [992, n.C.r[1]], [992, n.N.r[1]], n.N.r] },
      ],
    },
    4: {
      W: 1000,
      nodes: {
        S: { type: 'start', x: 0, cy: 24, w: 180, text: '4ª Teleconsulta' },
        D1: { type: 'decision', x: 0, cy: 204, w: 180, text: 'O participante conseguiu executar o plano alimentar?' },
        A: { type: 'action', x: 230, cy: 114, w: 190, text: 'Investigue os principais obstáculos e facilitadores para a execução do plano alimentar' },
        B: { type: 'action', x: 460, cy: 114, w: 190, text: 'Apresente estratégias para superação dos possíveis obstáculos' },
        C: { type: 'action', x: 230, cy: 294, w: 190, text: 'Investigue os principais facilitadores para a execução do plano alimentar' },
        E: { type: 'action', x: 720, cy: 204, w: 260, emphasis: true, text: 'Relembre a trajetória do acompanhamento nutricional e explique sobre o seguimento do cuidado e da pesquisa' },
      },
      edges: [
        { from: 'S', fp: 'b', to: 'D1', tp: 't' },
        { from: 'D1', fp: 'r', to: 'A', tp: 'l', via: 205, label: 'no' },
        { from: 'D1', fp: 'r', to: 'C', tp: 'l', via: 205, label: 'yes' },
        { from: 'A', fp: 'r', to: 'B', tp: 'l' },
        { from: 'B', fp: 'r', to: 'E', tp: 'l', via: 688 },
        { from: 'C', fp: 'r', to: 'E', tp: 'l', via: 688 },
      ],
    },
  };

  // ---------------------------------------------------------------------------
  // Text measuring + wrapping
  // ---------------------------------------------------------------------------
  let ctx = null;
  function textWidth(t, bold, italic, size) {
    if (!ctx) ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${italic ? 'italic ' : ''}${bold ? 700 : 400} ${size || FONT_PX}px Inter, system-ui, sans-serif`;
    return ctx.measureText(t).width;
  }

  function tokenize(str) {
    const tokens = [];
    str.split('\n').forEach((para, pi) => {
      if (pi > 0) tokens.push({ br: true });
      const re = /\*\*(.+?)\*\*|\*(.+?)\*|([^*]+)/g;
      let m;
      while ((m = re.exec(para))) {
        const bold = m[1] !== undefined;
        const italic = m[2] !== undefined;
        const chunk = m[1] || m[2] || m[3];
        chunk.split(/(\s+)/).forEach(w => { if (w.trim()) tokens.push({ t: w, b: bold, i: italic }); });
      }
    });
    return tokens;
  }

  function wrap(str, maxW, forceBold) {
    const lines = [[]];
    let width = 0;
    const space = textWidth(' ', false, false);
    tokenize(str).forEach(tok => {
      if (tok.br) { lines.push([{ gap: true }]); lines.push([]); width = 0; return; }
      const b = tok.b || forceBold;
      const w = textWidth(tok.t, b, tok.i);
      const line = lines[lines.length - 1];
      if (line.length && width + space + w > maxW) { lines.push([]); width = 0; }
      const cur = lines[lines.length - 1];
      cur.push({ t: tok.t, b, i: tok.i });
      width += (cur.length > 1 ? space : 0) + w;
    });
    return lines;
  }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function textBlock(lines, cx, cy, cls, color) {
    const real = lines.filter(l => !(l[0] && l[0].gap));
    const gaps = lines.length - real.length;
    const total = real.length * LINE + gaps * (LINE / 2);
    let y = cy - total / 2 + LINE * 0.72;
    let out = '';
    lines.forEach(line => {
      if (line[0] && line[0].gap) { y += LINE / 2; return; }
      if (!line.length) return;
      const spans = line.map((s, i) => `<tspan${s.b ? ' font-weight="700"' : ''}${s.i ? ' font-style="italic"' : ''}>${i ? ' ' : ''}${esc(s.t)}</tspan>`).join('');
      out += `<text class="${cls}" x="${cx}" y="${y.toFixed(1)}" text-anchor="middle"${color ? ` style="fill:${color}"` : ''}>${spans}</text>`;
      y += LINE;
    });
    return out;
  }

  function lineCount(lines) {
    return lines.reduce((n, l) => n + (l[0] && l[0].gap ? 0.5 : (l.length ? 1 : 0)), 0);
  }

  // ---------------------------------------------------------------------------
  // Layout + drawing
  // ---------------------------------------------------------------------------
  function layoutNode(n) {
    if (n.type === 'start' || n.type === 'next') {
      n.h = n.type === 'start' ? 40 : 34;
    } else {
      const inner = n.type === 'decision' ? n.w - 2 * HEX - 16 : n.w - 2 * PAD_X;
      n.lines = wrap(n.text, inner, n.type === 'decision');
      n.h = Math.max(n.type === 'decision' ? 96 : 56, lineCount(n.lines) * LINE + 2 * PAD_Y + (n.type === 'decision' ? 12 : 0));
    }
    n.y = n.cy - n.h / 2;
    n.cx = n.x + n.w / 2;
    n.l = [n.x, n.cy];
    n.r = [n.x + n.w, n.cy];
    n.t = [n.cx, n.y];
    n.b = [n.cx, n.y + n.h];
  }

  function drawNode(n, tele) {
    const col = TELE[tele];
    if (n.type === 'start') {
      return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.h / 2}" style="fill:${col.c}"/>`
        + `<text class="fx-text" x="${n.cx}" y="${n.cy + 5}" text-anchor="middle" font-size="14" font-weight="800" style="fill:#fff">${esc(n.text)}</text>`;
    }
    if (n.type === 'next') {
      const nc = TELE[n.next].c;
      return `<rect class="fx-next" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.h / 2}" style="stroke:${nc}"/>`
        + `<text class="fx-text" x="${n.cx}" y="${n.cy + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" style="fill:${nc}">${esc(n.text)} →</text>`;
    }
    if (n.type === 'decision') {
      const { x, y, w, h } = n;
      const pts = [[x, n.cy], [x + HEX, y], [x + w - HEX, y], [x + w, n.cy], [x + w - HEX, y + h], [x + HEX, y + h]].map(p => p.join(',')).join(' ');
      return `<polygon class="fx-decision-shape" points="${pts}" style="fill:${col.lt};stroke:${col.c}"/>` + textBlock(n.lines, n.cx, n.cy, 'fx-text');
    }
    const extra = n.emphasis ? ` style="stroke:${col.c};stroke-width:1.6"` : '';
    return `<rect class="fx-action" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9"${extra}/>` + textBlock(n.lines, n.cx, n.cy, 'fx-text');
  }

  function isH(port) { return port === 'l' || port === 'r'; }

  function route(e, nodes) {
    if (e.pts) return e.pts(nodes);
    const a = nodes[e.from][e.fp];
    const b = nodes[e.to][e.tp];
    if (isH(e.fp) && isH(e.tp)) {
      if (Math.abs(a[1] - b[1]) < 1) return [a, b];
      const mx = e.via !== undefined ? e.via : (a[0] + b[0]) / 2;
      return [a, [mx, a[1]], [mx, b[1]], b];
    }
    if (!isH(e.fp) && !isH(e.tp)) {
      if (Math.abs(a[0] - b[0]) < 1) return [a, b];
      const my = e.via !== undefined ? e.via : (a[1] + b[1]) / 2;
      return [a, [a[0], my], [b[0], my], b];
    }
    return isH(e.fp) ? [a, [b[0], a[1]], b] : [a, [a[0], b[1]], b];
  }

  function drawLabel(kind, pts) {
    const seg = pts.length > 2 ? 1 : 0;
    const [p, q] = [pts[seg], pts[seg + 1]];
    const cx = (p[0] + q[0]) / 2;
    const cy = (p[1] + q[1]) / 2;
    const st = kind === 'yes' ? YES : NO;
    const txt = kind === 'yes' ? 'SIM' : 'NÃO';
    const w = kind === 'yes' ? 34 : 38;
    return `<rect class="fx-chip" x="${cx - w / 2}" y="${cy - 9}" width="${w}" height="18" rx="9" style="stroke:${st.s}"/>`
      + `<text class="fx-chip-text" x="${cx}" y="${cy + 3.8}" text-anchor="middle" style="fill:${st.c}">${txt}</text>`;
  }

  let uid = 0;
  function renderFlow(tele) {
    const spec = FLOWS[tele];
    const nodes = {};
    Object.entries(spec.nodes).forEach(([k, n]) => { nodes[k] = Object.assign({}, n); layoutNode(nodes[k]); });
    const H = Math.ceil(Math.max(...Object.values(nodes).map(n => n.y + n.h)) + 4);
    const minY = Math.floor(Math.min(...Object.values(nodes).map(n => n.y)) - 4);
    const id = `fxa${++uid}`;

    let edges = '';
    let labels = '';
    spec.edges.forEach(e => {
      const pts = route(e, nodes);
      const arrow = e.arrow !== false;
      edges += `<polyline class="fx-edge" points="${pts.map(p => p.join(',')).join(' ')}"${arrow ? ` marker-end="url(#${id})"` : ''}/>`;
      if (e.label) labels += drawLabel(e.label, pts);
    });
    const body = Object.values(nodes).map(n => drawNode(n, tele)).join('');

    return `<svg viewBox="-2 ${minY} ${spec.W + 4} ${H - minY}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fluxo da ${tele}ª teleconsulta">
      <defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="fx-arrow" d="M0,0 L10,5 L0,10 z"/></marker></defs>
      ${edges}${body}${labels}</svg>`;
  }

  function legend() {
    return `<div class="fx-legend" aria-hidden="true">
      <span><i class="fx-l-start"></i>Início da teleconsulta</span>
      <span><i></i>Ação da/o nutricionista</span>
      <span><i class="fx-l-decision"></i>Pergunta (decisão)</span>
      <span><b style="color:var(--verde-dk)">SIM</b> / <b style="color:var(--rosa-dk)">NÃO</b> respostas</span>
    </div>`;
  }

  function fill(fig) {
    const which = fig.getAttribute('data-fluxo');
    const teles = which === 'todos' ? [1, 2, 3, 4] : [parseInt(which)];
    fig.innerHTML = teles.map(renderFlow).join('<div class="fx-gap"></div>') + legend();
  }

  window.renderFluxos = function (root) {
    (root || document).querySelectorAll('figure.fluxo[data-fluxo]').forEach(fill);
  };
})();

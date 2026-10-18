// assets/js/app.js

const state = {
  activeSection: 'home',
  darkMode: false,
  fontScale: 1.0,
  activeSteps: {},
};

// Sidebar: two levels only (section → pages). In-page headings live in the "Nesta página" box.
const NAV = [
  { home: 'home', label: 'Início' },
  { num: 1, title: 'Introdução', pages: ['sec1-apresentacao', 'sec1-estudo-predibra', 'sec1-referencial-teorico', 'sec1-objetivo-teleconsultas'] },
  { num: 2, title: 'Orientações operacionais', pages: ['sec2-cuidados-eticos', 'sec2-links-necessarios', 'sec2-preparando-teleconsulta', 'sec2-durante-teleconsulta', 'sec2-pos-consulta', 'sec2-estruturacao-teleconsultas'] },
  { num: 3, title: 'As quatro teleconsultas', pages: ['sec3-fontes-informacao', 'sec3-tele1-anamnese', 'sec3-tele2-obstaculos', 'sec3-tele3-plano', 'sec3-tele4-manutencao'] },
  { num: 4, title: 'Plano alimentar base', pages: ['sec4-plano-alimentar'] },
  { num: null, title: 'Referências', pages: ['referencias'] },
];

const TELE_THEMES = {
  'sec3-tele1-anamnese': 1,
  'sec3-tele2-obstaculos': 2,
  'sec3-tele3-plano': 3,
  'sec3-tele4-manutencao': 4,
};
const TELE_DOT_COLORS = { 1: 'var(--azul)', 2: 'var(--laranja)', 3: 'var(--verde)', 4: 'var(--rosa)' };

function isTelePage(pId) { return pId in TELE_THEMES; }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function svgIcon(id, extraClass) {
  const cls = extraClass ? `icon ${extraClass}` : 'icon';
  return `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
}

function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
}

function isNarrowScreen() { return window.matchMedia('(max-width: 900px)').matches; }

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initPreferences();
  renderSidebarNav();
  handleHashRouting();

  document.getElementById('content-viewport').addEventListener('scroll', updateReadingProgress);
  window.addEventListener('hashchange', handleHashRouting);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closePdfDialog();
    closeReferencePopup();
    if (isNarrowScreen()) toggleSidebar(false);
  });
  window.addEventListener('afterprint', () => { document.getElementById('print-root').innerHTML = ''; });
  // Flowcharts measure text with the web font: redraw once it has loaded.
  if (document.fonts) document.fonts.ready.then(() => renderFluxos(document.getElementById('content-viewport')));

  MANUAL.order.forEach(pId => { state.activeSteps[pId] = 1; });
});

function initPreferences() {
  if (storageGet('theme') === 'dark') state.darkMode = true;
  document.body.classList.toggle('dark-mode', state.darkMode);
  updateThemeToggleUI();

  const savedScale = parseFloat(storageGet('fontScale'));
  if (savedScale) {
    state.fontScale = savedScale;
    document.documentElement.style.setProperty('--font-scale', state.fontScale);
  }
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------
function handleHashRouting() {
  const hash = window.location.hash.replace('#', '');
  selectSection(MANUAL.pages[hash] ? hash : 'home', false);
}

function selectSection(pId, updateHash = true) {
  const page = MANUAL.pages[pId];
  if (!page) return;

  state.activeSection = pId;

  const viewport = document.getElementById('content-viewport');
  viewport.innerHTML = page.html;
  renderFluxos(viewport);
  viewport.scrollTop = 0;

  document.body.classList.remove('tele-theme-1', 'tele-theme-2', 'tele-theme-3', 'tele-theme-4');
  if (isTelePage(pId)) document.body.classList.add(`tele-theme-${TELE_THEMES[pId]}`);

  document.querySelectorAll('#sidebar-nav [data-page]').forEach(el => {
    const active = el.getAttribute('data-page') === pId;
    el.classList.toggle('active', active);
    if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });

  if (isTelePage(pId)) showTeleStep(pId, state.activeSteps[pId] || 1, false);

  updateHeaderHUD(pId);
  renderLocalTOC(pId);

  if (updateHash && window.location.hash !== '#' + pId) {
    history.pushState(null, '', '#' + pId);
  }

  if (isNarrowScreen()) toggleSidebar(false);
  clearSearch();
  setTimeout(updateReadingProgress, 100);
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
function renderSidebarNav() {
  const nav = document.getElementById('sidebar-nav');
  let html = '';

  NAV.forEach(item => {
    if (item.home) {
      html += `<a class="nav-home" href="#${item.home}" data-page="${item.home}">${svgIcon('icon-home')} ${item.label}</a>`;
      return;
    }

    const badge = item.num ? `<span class="nav-sec-num">${item.num}</span>` : `<span class="nav-sec-num">${svgIcon('icon-book')}</span>`;
    const label = item.num ? `Seção ${item.num} · ${item.title}` : item.title;

    // A section with a single page is a link itself (no redundant sub-item).
    if (item.pages.length === 1) {
      html += `<div class="nav-section"><a class="nav-sec-head" href="#${item.pages[0]}" data-page="${item.pages[0]}" aria-label="${label}">${badge}<span class="nav-sec-title">${item.title}</span></a></div>`;
      return;
    }

    html += `<div class="nav-section">
      <div class="nav-sec-head" aria-label="${label}">${badge}<span class="nav-sec-title">${item.title}</span></div>
      <ul class="nav-pages">`;
    item.pages.forEach(pId => {
      const page = MANUAL.pages[pId];
      if (!page) return;
      const dot = isTelePage(pId) ? `<span class="nav-dot" style="background:${TELE_DOT_COLORS[TELE_THEMES[pId]]}"></span>` : '';
      html += `<li><a class="nav-page" href="#${pId}" data-page="${pId}">${dot}<span>${page.title}</span></a></li>`;
    });
    html += `</ul></div>`;
  });

  nav.innerHTML = html;
}

function toggleSidebar(force) {
  if (isNarrowScreen()) {
    const open = typeof force === 'boolean' ? force : !document.body.classList.contains('sidebar-open');
    document.body.classList.toggle('sidebar-open', open);
  } else {
    const hidden = typeof force === 'boolean' ? !force : !document.body.classList.contains('sidebar-hidden');
    document.body.classList.toggle('sidebar-hidden', hidden);
  }
}

// ---------------------------------------------------------------------------
// Local TOC ("Nesta página")
// ---------------------------------------------------------------------------
function renderLocalTOC(pId) {
  const toc = document.getElementById('local-toc');
  if (!toc) return;
  const viewport = document.getElementById('content-viewport');

  let title, links = '';
  if (isTelePage(pId)) {
    const panes = viewport.querySelectorAll('.step-content-pane');
    if (panes.length === 0) { toc.style.display = 'none'; return; }
    title = 'Nesta teleconsulta';
    panes.forEach(pane => {
      const stepNum = parseInt(pane.getAttribute('data-step-content'));
      if (!stepNum) return;
      links += `<a href="#" class="toc-item" onclick="selectStepAndScroll(event, ${stepNum}, null)">Etapa ${stepNum}</a>`;
      pane.querySelectorAll('h3.h3-subsection[id]').forEach(h3 => {
        const text = h3.textContent.trim().replace(/^[a-z]\)\s*/i, '');
        links += `<a href="#" class="toc-item-sub" onclick="selectStepAndScroll(event, ${stepNum}, '${h3.id}')">${text}</a>`;
      });
    });
  } else {
    const headings = viewport.querySelectorAll('h2.h2-section[id], h3.h3-subsection[id]');
    if (headings.length === 0) { toc.style.display = 'none'; return; }
    title = 'Nesta página';
    headings.forEach(h => {
      const cls = h.classList.contains('h3-subsection') ? 'toc-item-sub' : 'toc-item';
      links += `<a href="#" class="${cls}" onclick="scrollToAnchor(event,'${h.id}')">${h.textContent.trim()}</a>`;
    });
  }

  toc.innerHTML = `<div class="local-toc-inner">
    <button class="local-toc-toggle" onclick="toggleLocalTOC()" aria-expanded="true">
      ${svgIcon('icon-checklist')} <span>${title}</span> ${svgIcon('icon-chevron-down', 'toc-chevron')}
    </button>
    <nav class="local-toc-nav" id="local-toc-nav">${links}</nav>
  </div>`;
  toc.style.display = 'block';
}

function toggleLocalTOC() {
  const nav = document.getElementById('local-toc-nav');
  const btn = document.querySelector('.local-toc-toggle');
  if (!nav || !btn) return;
  const isExpanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!isExpanded));
  nav.style.display = isExpanded ? 'none' : 'flex';
  const chevron = btn.querySelector('.toc-chevron');
  if (chevron) chevron.style.transform = isExpanded ? 'rotate(-90deg)' : '';
}

function scrollToAnchor(event, id) {
  event.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectStepAndScroll(event, stepNum, elementId) {
  event.preventDefault();
  showTeleStep(state.activeSection, stepNum);
  const target = elementId
    ? document.getElementById(elementId)
    : document.querySelector(`.step-content-pane[data-step-content="${stepNum}"]`);
  if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

// ---------------------------------------------------------------------------
// Teleconsulta stepper
// ---------------------------------------------------------------------------
const TELE_PAGE_NAV = {
  'sec3-tele1-anamnese': { prevId: 'sec3-fontes-informacao', prevLabel: 'Fontes de Informação', nextId: 'sec3-tele2-obstaculos', nextLabel: '2ª Teleconsulta' },
  'sec3-tele2-obstaculos': { prevId: 'sec3-tele1-anamnese', prevLabel: '1ª Teleconsulta', nextId: 'sec3-tele3-plano', nextLabel: '3ª Teleconsulta' },
  'sec3-tele3-plano': { prevId: 'sec3-tele2-obstaculos', prevLabel: '2ª Teleconsulta', nextId: 'sec3-tele4-manutencao', nextLabel: '4ª Teleconsulta' },
  'sec3-tele4-manutencao': { prevId: 'sec3-tele3-plano', prevLabel: '3ª Teleconsulta', nextId: 'sec4-plano-alimentar', nextLabel: 'Plano Alimentar Base' }
};

function showTeleStep(pId, stepNum, scroll = true) {
  state.activeSteps[pId] = stepNum;
  const viewport = document.getElementById('content-viewport');

  viewport.querySelectorAll('.step-content-pane').forEach(p => p.classList.remove('active'));
  const activePane = viewport.querySelector(`.step-content-pane[data-step-content="${stepNum}"]`);
  if (activePane) activePane.classList.add('active');

  viewport.querySelectorAll('.step-indicator').forEach(ind => {
    ind.classList.toggle('active', parseInt(ind.getAttribute('data-step')) === stepNum);
  });

  const totalSteps = viewport.querySelectorAll('.step-content-pane').length;
  const nav = TELE_PAGE_NAV[pId];
  viewport.querySelectorAll('.step-nav-injected').forEach(el => el.remove());

  if (activePane && nav) {
    const footer = document.createElement('div');
    footer.className = 'step-navigation-footer content-wide step-nav-injected';
    const iconPrev = svgIcon('icon-arrow-right', 'rotate-180');
    const iconNext = svgIcon('icon-arrow-right');
    const leftBtn = stepNum > 1
      ? `<button class="nav-btn prev-btn" onclick="showTeleStep('${pId}', ${stepNum - 1})">${iconPrev} Etapa anterior</button>`
      : `<button class="nav-btn prev-btn" onclick="selectSection('${nav.prevId}')">${iconPrev} ${nav.prevLabel}</button>`;
    const rightBtn = stepNum < totalSteps
      ? `<button class="nav-btn next-btn" onclick="showTeleStep('${pId}', ${stepNum + 1})">Próxima etapa ${iconNext}</button>`
      : `<button class="nav-btn next-btn" onclick="selectSection('${nav.nextId}')">${nav.nextLabel} ${iconNext}</button>`;
    footer.innerHTML = leftBtn + rightBtn;
    activePane.appendChild(footer);
  }

  if (scroll) {
    const stepper = viewport.querySelector('.tele-stepper');
    if (stepper) stepper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  updateHeaderHUD(pId);
  updateReadingProgress();
}

// ---------------------------------------------------------------------------
// Sub-bar (breadcrumbs + reading time)
// ---------------------------------------------------------------------------
function sectionLabel(pId) {
  const item = NAV.find(n => n.pages && n.pages.includes(pId));
  if (!item) return '';
  return item.num ? `Seção ${item.num} · ${item.title}` : item.title;
}

function updateHeaderHUD(pId, subTitleText = null) {
  const page = MANUAL.pages[pId];
  if (!page) return;
  const breadcrumbs = document.getElementById('app-breadcrumbs');
  const readTimeBadge = document.getElementById('header-read-time');
  const chevron = svgIcon('icon-chevron-right');

  if (pId === 'home') {
    breadcrumbs.innerHTML = `<span>Início</span>`;
    readTimeBadge.innerHTML = '';
    return;
  }

  const section = sectionLabel(pId);
  let html = section && section !== page.title ? `<span>${section}</span> ${chevron} <span>${page.title}</span>` : `<span>${page.title}</span>`;
  const subPart = isTelePage(pId) ? `Etapa ${state.activeSteps[pId] || 1}` : subTitleText;
  if (subPart) html += ` ${chevron} <span>${subPart}</span>`;
  breadcrumbs.innerHTML = html;
  readTimeBadge.innerHTML = page.readingTime ? `${svgIcon('icon-clock')} <span>${page.readingTime} min de leitura</span>` : '';
}

function updateActiveSubtopicOnScroll() {
  const pId = state.activeSection;
  if (!MANUAL.pages[pId] || isTelePage(pId)) return;

  const viewport = document.getElementById('content-viewport');
  const top = viewport.getBoundingClientRect().top;
  let activeHeading = null;
  viewport.querySelectorAll('h2.h2-section[id], h3.h3-subsection[id]').forEach(h => {
    if (h.getBoundingClientRect().top - top <= 100) activeHeading = h;
  });
  updateHeaderHUD(pId, activeHeading ? activeHeading.textContent.trim() : null);
}

function updateReadingProgress() {
  const viewport = document.getElementById('content-viewport');
  const bar = document.getElementById('reading-progress-bar');
  const scrollable = viewport.scrollHeight - viewport.clientHeight;
  const pct = scrollable > 0 ? (viewport.scrollTop / scrollable) * 100 : 0;
  bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  updateActiveSubtopicOnScroll();
}

// ---------------------------------------------------------------------------
// Accessibility: theme + font size (always visible in the header)
// ---------------------------------------------------------------------------
function toggleTheme() {
  state.darkMode = !state.darkMode;
  document.body.classList.toggle('dark-mode', state.darkMode);
  storageSet('theme', state.darkMode ? 'dark' : 'light');
  updateThemeToggleUI();
}

function updateThemeToggleUI() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(state.darkMode));
  btn.setAttribute('aria-label', state.darkMode ? 'Desativar modo escuro' : 'Ativar modo escuro');
  btn.title = state.darkMode ? 'Modo claro' : 'Modo escuro';
  btn.innerHTML = svgIcon(state.darkMode ? 'icon-sun' : 'icon-moon');
}

function adjustFontSize(dir) {
  state.fontScale = Math.round(Math.min(1.4, Math.max(0.8, state.fontScale + dir * 0.1)) * 10) / 10;
  document.documentElement.style.setProperty('--font-scale', state.fontScale);
  storageSet('fontScale', state.fontScale);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function performSearch() {
  const input = document.getElementById('manual-search');
  const hud = document.getElementById('search-hud');
  const list = document.getElementById('search-results-list');
  const count = document.getElementById('search-count');
  const clearBtn = document.getElementById('search-clear-btn');

  const query = input.value.trim().toLowerCase();
  if (query.length < 2) {
    hud.style.display = 'none';
    clearBtn.style.display = 'none';
    return;
  }
  clearBtn.style.display = 'block';
  list.innerHTML = '';

  const targets = [];
  MANUAL.order.forEach(pId => {
    const page = MANUAL.pages[pId];
    if (!page) return;
    const context = pId === 'home' ? 'Início' : `${sectionLabel(pId)} › ${page.title}`;
    if (page.title.toLowerCase().includes(query)) {
      targets.push({ text: `Página: ${page.title}`, pageId: pId, context });
    }
    const searchText = page.searchText;
    let idx = searchText.toLowerCase().indexOf(query);
    while (idx !== -1 && targets.length < 50) {
      const s = Math.max(0, idx - 60);
      const e = Math.min(searchText.length, idx + query.length + 80);
      let snippet = searchText.substring(s, e);
      if (s > 0) snippet = '...' + snippet;
      if (e < searchText.length) snippet += '...';
      targets.push({ text: snippet, pageId: pId, context });
      idx = searchText.toLowerCase().indexOf(query, idx + 1 + query.length);
    }
  });

  count.textContent = targets.length;
  hud.style.display = 'flex';

  if (targets.length === 0) {
    list.innerHTML = '<div class="no-results-msg">Nenhum resultado encontrado.</div>';
    return;
  }

  const regex = new RegExp(`(${escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  targets.forEach(target => {
    const card = document.createElement('div');
    card.className = 'search-item-card';
    card.innerHTML = `<div class="search-item-context">${target.context}</div>
      <div class="search-item-snippet">${escapeHtml(target.text).replace(regex, '<mark>$1</mark>')}</div>`;
    card.onclick = () => { clearSearch(); selectSection(target.pageId); };
    list.appendChild(card);
  });
  if (isNarrowScreen()) toggleSidebar(false);
}

function clearSearch() {
  document.getElementById('manual-search').value = '';
  document.getElementById('search-hud').style.display = 'none';
  document.getElementById('search-clear-btn').style.display = 'none';
}

function shareSection() {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => alert('Link copiado para a área de transferência!'));
  } else {
    prompt('Copie o link:', url);
  }
}

// ---------------------------------------------------------------------------
// PDF (browser print → "Salvar como PDF")
// ---------------------------------------------------------------------------
function openPdfDialog() {
  const page = MANUAL.pages[state.activeSection];
  const currentBtn = document.querySelector('.pdf-option[onclick*="current"]');
  const isHome = state.activeSection === 'home';
  currentBtn.disabled = isHome;
  currentBtn.style.display = isHome ? 'none' : '';
  document.getElementById('pdf-current-label').textContent = page ? `“${page.title}”` : '';
  document.getElementById('pdf-overlay').classList.add('open');
  document.querySelector('.pdf-option').focus();
}

function closePdfDialog() {
  document.getElementById('pdf-overlay').classList.remove('open');
}

const PRINT_COVER = {
  kicker: 'Estudo PREDIBRA',
  title: 'Manual para Teleconsultas em Nutrição',
  subtitle: 'Baseado no Guia Alimentar para a População Brasileira',
  meta: [
    '<strong>Universidade de São Paulo</strong>',
    'Faculdade de Saúde Pública',
    'Núcleo de Pesquisas Epidemiológicas em Nutrição e Saúde — NUPENS',
    'Projeto de pesquisa “Eficácia de uma intervenção digital de promoção da dieta brasileira na prevenção de doenças: o ensaio clínico PREDIBRA”',
    'São Paulo, 2026',
  ],
};

function articleNumber(pId) {
  const sec = NAV.find(n => n.pages && n.pages.includes(pId));
  if (!sec || !sec.num) return '';
  return `${sec.num}.${sec.pages.indexOf(pId) + 1}`;
}

function printPageHtml(pId) {
  const page = MANUAL.pages[pId];
  const tmp = document.createElement('div');
  tmp.innerHTML = page.html;
  renderFluxos(tmp);

  const badge = tmp.querySelector('.section-badge');
  if (badge) {
    const num = articleNumber(pId);
    badge.textContent = num ? `${num} · ${sectionLabel(pId)}` : sectionLabel(pId);
  }

  // Show every teleconsulta step, each with its own heading.
  tmp.querySelectorAll('.step-content-pane').forEach(pane => {
    const n = pane.getAttribute('data-step-content');
    const title = document.createElement('div');
    title.className = 'pr-step-title';
    title.innerHTML = `<span>${n}</span> Etapa ${n}`;
    pane.prepend(title);
  });

  keepTitlesWithNext(tmp);
  keepHeaderWithOpening(tmp);

  // Keep ids unique across the whole document.
  tmp.querySelectorAll('[id]').forEach(el => { el.id = `pr-${pId}-${el.id}`; });

  const theme = isTelePage(pId) ? ` tele-theme-${TELE_THEMES[pId]}` : '';
  return `<section class="pr-page${theme}" id="pr-${pId}">${tmp.innerHTML}</section>`;
}

// On paper a title must never end a page alone: group each title (and any title
// right after it) with the first following block when that block is short enough
// to move along with it. Long blocks rely on CSS break-after: avoid instead.
const PRINT_TITLES = '.h2-section, .h3-subsection, .figure-label, .pr-step-title, .card-title';
function keepTitlesWithNext(root) {
  root.querySelectorAll(PRINT_TITLES).forEach(title => {
    if (title.closest('.pr-keep') || !title.parentElement) return;
    const group = [title];
    let next = title.nextElementSibling;
    while (next && next.matches(PRINT_TITLES)) { group.push(next); next = next.nextElementSibling; }
    const small = next && !next.querySelector('img, figure, table') && !next.matches('img, figure, .table-responsive')
      && next.textContent.length < 700;
    if (small) group.push(next);
    if (group.length < 2) return;
    const wrap = document.createElement('div');
    wrap.className = 'pr-keep';
    title.before(wrap);
    group.forEach(el => wrap.appendChild(el));
  });
}

// An article must not start at the foot of a page: its header travels with
// the opening of the text (about the first ten lines).
function keepHeaderWithOpening(root) {
  const hero = root.querySelector('.page-hero');
  if (!hero) return;
  const group = [hero];
  let chars = 0;
  let next = hero.nextElementSibling;
  while (next && chars < 600) {
    if (!next.matches('.local-toc')) {
      if (next.matches('.table-responsive, img, figure, .pre-info-grid') || next.querySelector('img, figure, table')) break;
      group.push(next);
      chars += next.textContent.length;
    }
    next = next.nextElementSibling;
  }
  if (group.length < 2) return;
  const wrap = document.createElement('div');
  wrap.className = 'pr-keep';
  hero.before(wrap);
  group.forEach(el => wrap.appendChild(el));
}

function buildPrintDocument(mode) {
  if (mode === 'current') return printPageHtml(state.activeSection);

  const c = PRINT_COVER;
  let html = `<div class="pr-cover">
    <img class="pr-cover-logo" src="assets/logos/LogoPredibra-curve.svg" alt="PREDIBRA">
    <div class="pr-cover-kicker">${c.kicker}</div>
    <div class="pr-cover-title">${c.title}</div>
    <div class="pr-cover-sub">${c.subtitle}</div>
    <div class="pr-cover-meta">${c.meta.join('<br>')}</div>
    <div class="pr-cover-stripes"><span style="background:var(--azul-dk)"></span><span style="background:var(--laranja)"></span><span style="background:var(--verde)"></span><span style="background:var(--rosa)"></span></div>
  </div>`;

  const sections = NAV.filter(n => n.pages);
  const pageItems = sec => sec.pages.map(p => `<li><a href="#pr-${p}"><span>${articleNumber(p)}</span>${MANUAL.pages[p].title}</a></li>`).join('');

  html += `<div class="pr-toc"><div class="pr-toc-title">Sumário</div>`;
  sections.forEach(sec => {
    html += `<div class="pr-toc-sec">
      <div class="pr-toc-num">${sec.num || ''}</div>
      <div><div class="pr-toc-sec-head"><a href="#pr-sec-${sec.num || 'ref'}">${sec.title}</a></div>
      ${sec.pages.length > 1 ? `<ul class="pr-toc-pages">${pageItems(sec)}</ul>` : ''}</div>
    </div>`;
  });
  html += `</div>`;

  sections.forEach(sec => {
    if (sec.num) {
      html += `<div class="pr-section-opener" id="pr-sec-${sec.num}">
        <div class="pr-section-num">${String(sec.num).padStart(2, '0')}</div>
        <div class="pr-section-kicker">Seção ${sec.num}</div>
        <div class="pr-section-name">${sec.title}</div>
        ${sec.pages.length > 1 ? `<ul class="pr-section-list">${pageItems(sec)}</ul>` : ''}
      </div>`;
    } else {
      html += `<div id="pr-sec-ref"></div>`;
    }
    sec.pages.forEach(p => { html += printPageHtml(p); });
  });
  return html;
}

function printManual(mode) {
  closePdfDialog();
  const root = document.getElementById('print-root');
  root.innerHTML = buildPrintDocument(mode);

  // The serif face is only used on paper, so the browser has not loaded it yet.
  const fonts = document.fonts
    ? ['400 10pt "Source Serif 4"', 'italic 400 10pt "Source Serif 4"', '600 10pt "Source Serif 4"'].map(f => document.fonts.load(f).catch(() => null))
    : [];
  const imgs = Array.from(root.querySelectorAll('img'));
  const loaded = imgs.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; }));
  Promise.all([...fonts, ...loaded]).then(() => setTimeout(() => window.print(), 150));
}

// ---------------------------------------------------------------------------
// References popup (superscript numbers)
// ---------------------------------------------------------------------------
let referencesMap = null;

const SUPERSCRIPT_MAP = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
};

function normalizeSuperscriptText(text) {
  return Array.from(text).map(ch => SUPERSCRIPT_MAP[ch] || ch).join('');
}

function getReferenceText(num) {
  if (!referencesMap) {
    referencesMap = {};
    const refPage = MANUAL.pages['referencias'];
    if (refPage) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = refPage.html;
      tempDiv.querySelectorAll('p.body-text').forEach(p => {
        const match = p.textContent.trim().match(/^(\d+)\s*[-–]\s*(.*)$/);
        if (match) referencesMap[parseInt(match[1])] = match[2].trim();
      });
    }
  }
  return referencesMap[num] || null;
}

function showReferencePopup(text) {
  const nums = normalizeSuperscriptText(text).match(/\d+/g);
  if (!nums) return;

  const refContentHtml = nums.map(numStr => {
    const num = parseInt(numStr);
    const refText = getReferenceText(num);
    return `<div class="ref-popup-item"><strong>[${num}]</strong> ${refText ? escapeHtml(refText) : 'Referência não encontrada no manual.'}</div>`;
  }).join('');

  let modal = document.getElementById('reference-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reference-modal';
    modal.className = 'ref-modal-overlay';
    modal.innerHTML = `
      <div class="ref-modal-container" role="dialog" aria-modal="true" aria-labelledby="ref-modal-title">
        <div class="ref-modal-header">
          <h3 id="ref-modal-title">Referência Bibliográfica</h3>
          <button class="ref-modal-close" onclick="closeReferencePopup()" aria-label="Fechar">
            <svg class="icon"><use href="#icon-x"/></svg>
          </button>
        </div>
        <div class="ref-modal-body" id="ref-modal-body-content"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeReferencePopup(); });
  }

  document.getElementById('ref-modal-body-content').innerHTML = refContentHtml;
  modal.classList.add('active');
}

function closeReferencePopup() {
  const modal = document.getElementById('reference-modal');
  if (modal) modal.classList.remove('active');
}

document.addEventListener('click', (e) => {
  const sup = e.target.closest('#content-viewport sup');
  if (sup) {
    e.preventDefault();
    e.stopPropagation();
    showReferencePopup(sup.textContent);
  }
});

'use strict';

/* ── State ──────────────────────────────────────────────────── */
let insights = [];
let filtered = [];
let oracleIdx = 0;
let activeCategory = 'all';
let searchQuery = '';

/* ── Scroll navigation ──────────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ── Data ───────────────────────────────────────────────────── */
async function loadInsights() {
  const r = await fetch('/data/insights.json');
  insights = await r.json();
  filtered = [...insights];
  setupOracle();
  renderBiblioteca();
  setupReveal();
}

/* ── Oracle ─────────────────────────────────────────────────── */
let oracleOrder = [];

function shuffleOrder() {
  oracleOrder = insights.map((_, i) => i);
  for (let i = oracleOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [oracleOrder[i], oracleOrder[j]] = [oracleOrder[j], oracleOrder[i]];
  }
}

function setupOracle() {
  if (!oracleOrder.length && insights.length) shuffleOrder();
  showOracle(oracleIdx);
}

function showOracle(idx) {
  if (!insights.length) return;
  oracleIdx = ((idx % oracleOrder.length) + oracleOrder.length) % oracleOrder.length;
  const it = insights[oracleOrder[oracleIdx]];

  const els = ['oracle-text', 'oracle-category', 'oracle-rule', 'oracle-source']
    .map(id => document.getElementById(id));

  els.forEach(el => el?.classList.add('fading'));

  setTimeout(() => {
    const textEl = document.getElementById('oracle-text');
    const catEl  = document.getElementById('oracle-category');
    const srcEl  = document.getElementById('oracle-source');
    const ctrEl  = document.getElementById('oracle-counter');

    if (textEl) textEl.textContent = `"${it.text}"`;
    if (catEl)  catEl.textContent  = it.category.replace(/-/g, ' ');
    if (srcEl)  srcEl.textContent  = it.source;
    if (ctrEl)  ctrEl.textContent  = `${oracleIdx + 1} / ${insights.length}`;

    els.forEach(el => el?.classList.remove('fading'));
  }, 420);
}

function oracleNext()   { showOracle(oracleIdx + 1); }
function oraclePrev()   { showOracle(oracleIdx - 1); }
function oracleRandom() { showOracle(Math.floor(Math.random() * oracleOrder.length)); }

/* ── Biblioteca ─────────────────────────────────────────────── */
const CATEGORY_LABELS = {
  all:             'Todos',
  narrativa:       'Narrativa',
  autoridade:      'Autoridade',
  posicionamento:  'Posicionamento',
  autenticidade:   'Autenticidade',
  branding:        'Branding',
  comunicacao:     'Comunicação',
  identidade:      'Identidade',
  comportamento:   'Comportamento',
  negociacao:      'Negociação',
  autoconhecimento:'Autoconhecimento',
  mentoria:        'Mentoria',
  escrita:         'Escrita',
  performance:     'Performance',
  experiencia:     'Experiência',
  integridade:     'Integridade',
  linguagem:       'Linguagem',
};

function getCategories() {
  const cats = ['all', ...new Set(insights.map(i => i.category))];
  return cats;
}

function applyFilters() {
  filtered = insights.filter(i => {
    const matchesCat = activeCategory === 'all' || i.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      i.text.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.source.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });
}

function renderBiblioteca() {
  const container = document.getElementById('bib-cards');
  const countEl   = document.getElementById('bib-count');
  const filterEl  = document.getElementById('bib-filters');

  if (!container) return;

  // Render filter buttons once
  if (filterEl && !filterEl.children.length) {
    getCategories().forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (cat === activeCategory ? ' active' : '');
      btn.textContent = CATEGORY_LABELS[cat] || cat;
      btn.dataset.cat = cat;
      btn.addEventListener('click', () => {
        activeCategory = cat;
        document.querySelectorAll('.filter-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.cat === cat));
        applyFilters();
        renderCards();
      });
      filterEl.appendChild(btn);
    });
  }

  applyFilters();
  renderCards();

  function renderCards() {
    if (countEl) countEl.textContent = `${filtered.length} insight${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      container.innerHTML = '<div class="empty-state">Nenhum insight encontrado</div>';
      return;
    }

    container.innerHTML = '';
    filtered.forEach((it, i) => {
      const card = document.createElement('div');
      card.className = 'insight-card';
      const ytLink = it.youtube_url
        ? `<a class="card-yt-link" href="${it.youtube_url}" target="_blank" rel="noopener" title="Ver no YouTube" onclick="event.stopPropagation()">▶ YouTube</a>`
        : '';
      card.innerHTML = `
        <span class="card-cat">${(CATEGORY_LABELS[it.category] || it.category).toUpperCase()}</span>
        <p class="card-text">"${it.text}"</p>
        <div class="card-footer">
          <span class="card-source">${it.source}</span>
          ${ytLink}
          <span class="card-arrow">→</span>
        </div>
      `;
      card.addEventListener('click', () => openModal(it));
      container.appendChild(card);
    });
  }
}

/* ── Modal ──────────────────────────────────────────────────── */
function openModal(it) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  document.getElementById('modal-cat').textContent    = (CATEGORY_LABELS[it.category] || it.category).toUpperCase();
  document.getElementById('modal-text').textContent   = `"${it.text}"`;
  document.getElementById('modal-source').textContent = it.source;

  // YouTube link in modal
  const existingYt = document.getElementById('modal-yt-link');
  if (existingYt) existingYt.remove();
  if (it.youtube_url) {
    const actions = document.querySelector('.modal-actions');
    if (actions) {
      const ytBtn = document.createElement('a');
      ytBtn.id        = 'modal-yt-link';
      ytBtn.className = 'modal-btn modal-btn--yt';
      ytBtn.href      = it.youtube_url;
      ytBtn.target    = '_blank';
      ytBtn.rel       = 'noopener';
      ytBtn.textContent = '▶ Ver no YouTube';
      actions.appendChild(ytBtn);
    }
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Oracle action: send to oracle and scroll
  const oracleBtn = document.getElementById('modal-oracle-btn');
  if (oracleBtn) {
    oracleBtn.onclick = () => {
      const realIdx = insights.findIndex(x => x.id === it.id);
      if (realIdx !== -1) {
        oracleIdx = oracleOrder.indexOf(realIdx);
        showOracle(oracleIdx);
      }
      closeModal();
      scrollToSection('section-oracle');
    };
  }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Clipboard ──────────────────────────────────────────────── */
function copyText(text) {
  navigator.clipboard?.writeText(text).then(() => {
    const btn = document.getElementById('modal-copy-btn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'Copiado';
      setTimeout(() => { btn.textContent = orig; }, 1400);
    }
  });
}

/* ── Scroll reveal ──────────────────────────────────────────── */
function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── Active nav on scroll ───────────────────────────────────── */
function setupNavObserver() {
  const sections = ['oracle', 'biblioteca', 'sobre', 'aviso'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('section-', '');
        document.querySelectorAll('[data-section]').forEach(a =>
          a.classList.toggle('active', a.dataset.section === id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(`section-${id}`);
    if (el) observer.observe(el);
  });
}

/* ── Event bindings ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Nav brand
  document.querySelector('.nav-brand')?.addEventListener('click', e => {
    e.preventDefault();
    scrollToSection('section-hero');
  });

  // Nav section links
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      scrollToSection(`section-${el.dataset.section}`);
    });
  });

  // Oracle controls
  document.getElementById('btn-next')?.addEventListener('click', oracleNext);
  document.getElementById('btn-prev')?.addEventListener('click', oraclePrev);
  document.getElementById('btn-random')?.addEventListener('click', oracleRandom);

  // Keyboard — always active, no route check needed
  document.addEventListener('keydown', e => {
    if (document.getElementById('modal-overlay')?.classList.contains('open')) {
      if (e.key === 'Escape') closeModal();
      return;
    }
    if (e.key === 'ArrowRight') oracleNext();
    if (e.key === 'ArrowLeft')  oraclePrev();
    if (e.key === ' ') { e.preventDefault(); oracleRandom(); }
  });

  // Search
  document.getElementById('bib-search')?.addEventListener('input', e => {
    searchQuery = e.target.value;
    renderBiblioteca();
  });

  // Modal
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('modal-copy-btn')?.addEventListener('click', () => {
    const text = document.getElementById('modal-text')?.textContent || '';
    copyText(text);
  });

  // Touch swipe for oracle navigation
  let _touchX = 0, _touchY = 0;
  const oracleEl = document.getElementById('section-oracle');
  if (oracleEl) {
    oracleEl.addEventListener('touchstart', e => {
      _touchX = e.touches[0].clientX;
      _touchY = e.touches[0].clientY;
    }, { passive: true });
    oracleEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - _touchX;
      const dy = e.changedTouches[0].clientY - _touchY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        dx < 0 ? oracleNext() : oraclePrev();
      }
    }, { passive: true });
  }

  setupNavObserver();
  loadInsights();
});

import { createHeader } from '../components/header.js';
import { createSidebar } from '../components/sidebar.js';
import { storage } from '../storage.js';
import { icons } from '../icons.js';
import { $, $$, debounce, escapeHtml } from '../utils.js';

// Carrega automaticamente TODO o conteúdo teórico da pasta data/content/ (escalável).
const aulaFiles = import.meta.glob('../../data/content/*.json', { eager: true });

export function loadAulas() {
  return Object.entries(aulaFiles)
    .map(([path, data]) => ({
      ...data,
      id: path.split('/').pop().replace(/\.json$/, '')
    }))
    .sort((a, b) => String(a.titulo).localeCompare(String(b.titulo), 'pt-BR', { numeric: true }));
}

export function getAula(id) {
  return loadAulas().find((aula) => aula.id === id) || null;
}

/** Extrai o número do módulo para ordenação ("Módulo 10" > "Módulo 2"). */
function moduleNumber(name) {
  const match = String(name).match(/\d+/);
  const number = match ? Number(match[0]) : NaN;
  return Number.isNaN(number) ? Infinity : number;
}

/** Agrupa aulas por módulo, ordenando módulos e aulas internamente. */
function groupByModule(aulas) {
  const groups = new Map();

  for (const aula of aulas) {
    const name = aula.modulo || 'Módulo';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(aula);
  }

  return Array.from(groups.entries())
    .map(([name, items]) => ({
      name,
      aulas: items.sort((a, b) =>
        String(a.titulo).localeCompare(String(b.titulo), 'pt-BR', { numeric: true })
      )
    }))
    .sort((a, b) => moduleNumber(a.name) - moduleNumber(b.name));
}

/** Material teórico (aulas) organizado por módulos (cards expansíveis). */
export function aulasPage() {
  const aulas = loadAulas();
  const modules = groupByModule(aulas);
  const app = document.createElement('div');
  app.className = 'app-shell';

  app.appendChild(createHeader());
  app.appendChild(createSidebar({ active: 'aulas' }));

  const main = document.createElement('main');
  main.className = 'main-content aulas';
  main.innerHTML = `
    <header class="page-head animate-fade-in">
      <div>
        <h1 class="page-title">Aulas</h1>
        <p class="page-subtitle">Bem-vindo(a), ${escapeHtml(storage.get('name') || 'aluno')}. Leia o material teórico de cada aula antes de fazer os exercícios.</p>
      </div>
    </header>

    <div class="toolbar">
      <div class="search">
        ${icons.search}
        <input class="input" type="search" data-search placeholder="Buscar aula..." aria-label="Buscar por aula" />
      </div>
      <span class="badge badge--neutral" data-count>${aulas.length} aulas</span>
    </div>

    <div class="modules" data-modules></div>
  `;
  app.appendChild(main);

  const matchesFilter = (aula, query) =>
    !query ||
    String(aula.titulo).toLowerCase().includes(query) ||
    String(aula.subtitulo || '').toLowerCase().includes(query);

  const renderModules = (query = '') => {
    const hasFilter = Boolean(query);

    const withMatches = modules.map((module) => ({
      ...module,
      matched: module.aulas.filter((aula) => matchesFilter(aula, query))
    }));

    // Com filtro ativo, módulos sem correspondência ficam ocultos.
    const visible = hasFilter ? withMatches.filter((module) => module.matched.length > 0) : withMatches;
    const matchedTotal = withMatches.reduce((sum, module) => sum + module.matched.length, 0);

    $('[data-count]', main).textContent = `${matchedTotal} ${matchedTotal === 1 ? 'aula' : 'aulas'}`;

    if (!visible.length) {
      $('[data-modules]', main).innerHTML =
        `<div class="lessons-empty">Nenhuma aula encontrada para “${escapeHtml(query)}”.</div>`;
      return;
    }

    // Sem filtro, apenas o primeiro módulo abre. Com filtro, todos os que têm resultado abrem.
    $('[data-modules]', main).innerHTML = visible
      .map((module, index) => moduleCard(module, index, hasFilter || index === 0))
      .join('');
  };

  // Acordeão: abre o módulo clicado e fecha os demais.
  $('[data-modules]', main).addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-module-toggle]');
    if (!toggle) return;

    const card = toggle.closest('[data-module]');
    const wasOpen = card.classList.contains('is-open');

    $$('[data-module]', main).forEach((item) => {
      item.classList.remove('is-open');
      $('[data-module-toggle]', item).setAttribute('aria-expanded', 'false');
      $('[data-module-body]', item).hidden = true;
    });

    if (!wasOpen) {
      card.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      $('[data-module-body]', card).hidden = false;
    }
  });

  const onSearch = debounce((value) => {
    renderModules(value.trim().toLowerCase());
  }, 200);

  $('[data-search]', main).addEventListener('input', (event) => onSearch(event.target.value));

  renderModules();
  return app;
}

function moduleCard(module, index, open) {
  const count = module.matched.length;
  const bodyId = `module-body-${index}`;
  return `
    <section class="module-card ${open ? 'is-open' : ''}" data-module>
      <button class="module-card__header" type="button" data-module-toggle
        aria-expanded="${open}" aria-controls="${bodyId}">
        <span class="module-card__icon">${icons.folder}</span>
        <span class="module-card__title">${escapeHtml(module.name)}</span>
        <span class="badge badge--neutral module-card__count">
          ${count} ${count === 1 ? 'aula' : 'aulas'}
        </span>
        <span class="module-card__chevron">${icons.chevron}</span>
      </button>
      <div class="module-card__body" id="${bodyId}" data-module-body ${open ? '' : 'hidden'}>
        <div class="lessons-grid">
          ${module.matched.map(aulaCard).join('')}
        </div>
      </div>
    </section>
  `;
}

function aulaCard(aula) {
  const sections = aula.secoes?.length ?? 0;
  return `
    <article class="lesson-card card animate-up">
      <div class="lesson-card__header">
        <span class="lesson-card__icon">${icons.book}</span>
        <span class="badge badge--neutral">Teoria</span>
      </div>
      <h2 class="lesson-card__title">${escapeHtml(aula.titulo)}</h2>
      <p class="lesson-card__desc">${escapeHtml(aula.subtitulo)}</p>
      <div class="lesson-card__meta">
        <span class="lesson-card__meta-item">${icons.list} ${sections} ${sections === 1 ? 'seção' : 'seções'}</span>
        <span class="lesson-card__meta-item">${icons.clock} ${aula.tempo} min</span>
      </div>
      <a class="btn btn--primary btn--block" href="#/aula/${encodeURIComponent(aula.id)}">
        Ler aula ${icons.arrowRight}
      </a>
    </article>
  `;
}
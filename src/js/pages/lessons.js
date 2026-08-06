import { createHeader } from '../components/header.js';
import { createSidebar } from '../components/sidebar.js';
import { storage } from '../storage.js';
import { icons } from '../icons.js';
import { $, $$, debounce, escapeHtml } from '../utils.js';

// Carrega automaticamente TODOS os arquivos .json da pasta data/ (escalável).
const lessonFiles = import.meta.glob('../../data/*.json', { eager: true });

const DIFFICULTIES = ['Fácil', 'Média', 'Difícil'];

const DIFFICULTY_CLASS = {
  'Fácil': 'badge--success',
  'Média': 'badge--warning',
  'Difícil': 'badge--danger'
};

/** Retorna a lista de aulas ordenada por título. */
export function loadLessons() {
  return Object.entries(lessonFiles)
    .map(([path, data]) => ({
      ...data,
      id: path.split('/').pop().replace(/\.json$/, '')
    }))
    .sort((a, b) => String(a.titulo).localeCompare(String(b.titulo), 'pt-BR', { numeric: true }));
}

export function getLesson(id) {
  return loadLessons().find((lesson) => lesson.id === id) || null;
}

/** Extrai o número do módulo para ordenação ("Módulo 10" > "Módulo 2"). */
function moduleNumber(name) {
  const match = String(name).match(/\d+/);
  const number = match ? Number(match[0]) : NaN;
  return Number.isNaN(number) ? Infinity : number;
}

/** Agrupa aulas por módulo, ordenando módulos e aulas internamente. */
function groupByModule(lessons) {
  const groups = new Map();

  for (const lesson of lessons) {
    const name = lesson.modulo || 'Módulo';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(lesson);
  }

  return Array.from(groups.entries())
    .map(([name, items]) => ({
      name,
      lessons: items.sort((a, b) =>
        String(a.titulo).localeCompare(String(b.titulo), 'pt-BR', { numeric: true })
      )
    }))
    .sort((a, b) => moduleNumber(a.name) - moduleNumber(b.name));
}

/** Listagem de aulas organizada por módulos (cards expansíveis). */
export function lessonsPage() {
  const lessons = loadLessons();
  const modules = groupByModule(lessons);
  const app = document.createElement('div');
  app.className = 'app-shell';

  app.appendChild(createHeader());
  app.appendChild(createSidebar({ active: 'lessons' }));

  const main = document.createElement('main');
  main.className = 'main-content lessons';
  main.innerHTML = `
    <header class="page-head animate-fade-in">
      <div>
        <h1 class="page-title">Minhas aulas</h1>
        <p class="page-subtitle">Bem-vindo(a), ${escapeHtml(storage.get('name') || 'aluno')}. Escolha um módulo e uma aula para começar.</p>
      </div>
    </header>

    <div class="toolbar">
      <div class="search">
        ${icons.search}
        <input class="input" type="search" data-search placeholder="Buscar aula..." aria-label="Buscar por aula" />
      </div>
      <label class="field field--select">
        <span class="visually-hidden">Filtrar por dificuldade</span>
        <select class="select" data-difficulty aria-label="Filtrar por dificuldade">
          <option value="">Todas as dificuldades</option>
          ${DIFFICULTIES.map((level) => `<option value="${level}">${level}</option>`).join('')}
        </select>
      </label>
      <span class="badge badge--neutral" data-count>${lessons.length} aulas</span>
    </div>

    <div class="modules" data-modules></div>
  `;
  app.appendChild(main);

  const matchesFilter = (lesson, query, difficulty) =>
    (!query ||
      String(lesson.titulo).toLowerCase().includes(query) ||
      String(lesson.descricao || '').toLowerCase().includes(query)) &&
    (!difficulty || lesson.dificuldade === difficulty);

  const renderModules = (query = '', difficulty = '') => {
    const hasFilter = Boolean(query || difficulty);

    const withMatches = modules.map((module) => ({
      ...module,
      matched: module.lessons.filter((lesson) => matchesFilter(lesson, query, difficulty))
    }));

    // Com filtro ativo, módulos sem correspondência ficam ocultos.
    const visible = hasFilter ? withMatches.filter((module) => module.matched.length > 0) : withMatches;
    const matchedTotal = withMatches.reduce((sum, module) => sum + module.matched.length, 0);

    $('[data-count]', main).textContent =
      `${matchedTotal} ${matchedTotal === 1 ? 'aula' : 'aulas'}`;

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
    renderModules(value.trim().toLowerCase(), $('[data-difficulty]', main).value);
  }, 200);

  $('[data-search]', main).addEventListener('input', (event) => onSearch(event.target.value));
  $('[data-difficulty]', main).addEventListener('change', (event) => {
    renderModules($('[data-search]', main).value.trim().toLowerCase(), event.target.value);
  });

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
          ${module.matched.map(lessonCard).join('')}
        </div>
      </div>
    </section>
  `;
}

function lessonCard(lesson) {
  const total = lesson.perguntas?.length ?? 0;
  const difficulty = DIFFICULTIES.includes(lesson.dificuldade) ? lesson.dificuldade : 'Média';
  return `
    <article class="lesson-card card animate-up">
      <div class="lesson-card__header">
        <span class="lesson-card__icon">${icons.book}</span>
        <span class="badge ${DIFFICULTY_CLASS[difficulty]}">${escapeHtml(difficulty)}</span>
      </div>
      <h2 class="lesson-card__title">${escapeHtml(lesson.titulo)}</h2>
      <p class="lesson-card__desc">${escapeHtml(lesson.descricao)}</p>
      <div class="lesson-card__meta">
        <span class="lesson-card__meta-item">${icons.list} ${total} ${total === 1 ? 'questão' : 'questões'}</span>
        <span class="lesson-card__meta-item">${icons.clock} ${lesson.tempo} min</span>
      </div>
      <a class="btn btn--primary btn--block" href="#/quiz/${encodeURIComponent(lesson.id)}">
        Iniciar ${icons.arrowRight}
      </a>
    </article>
  `;
}
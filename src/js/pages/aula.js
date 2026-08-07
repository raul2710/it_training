import { createHeader } from '../components/header.js';
import { createSidebar } from '../components/sidebar.js';
import { icons } from '../icons.js';
import { $, escapeHtml } from '../utils.js';
import { getAula } from './aulas.js';

/** Renderiza um bloco de conteúdo teórico conforme o tipo. */
function renderBlock(block) {
  switch (block.tipo) {
    case 'texto':
      return `<p class="aula__text">${escapeHtml(block.texto)}</p>`;
    case 'destacado':
      return `<blockquote class="aula__quote">${escapeHtml(block.texto)}</blockquote>`;
    case 'lista':
      return `
        <ul class="aula__list">
          ${block.itens.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>`;
    case 'passos':
      return `
        <ol class="aula__steps">
          ${block.itens.map((item, index) => `
            <li class="aula__step">
              <span class="aula__step-num" aria-hidden="true">${index + 1}</span>
              <div class="aula__step-body">
                <strong>${escapeHtml(item.titulo)}</strong>
                <p>${escapeHtml(item.descricao)}</p>
              </div>
            </li>`).join('')}
        </ol>`;
    case 'cards':
      return `
        <div class="aula__cards">
          ${block.itens.map((item) => `
            <div class="aula__card">
              <strong class="aula__card-title">${escapeHtml(item.titulo)}</strong>
              <p class="aula__card-desc">${escapeHtml(item.descricao)}</p>
            </div>`).join('')}
        </div>`;
    default:
      return '';
  }
}

/** Tela de leitura de uma aula: exibe o material teórico em seções. */
export function aulaPage(params) {
  const aula = getAula(params.aulaId);

  const app = document.createElement('div');
  app.className = 'app-shell';

  app.appendChild(createHeader());
  app.appendChild(createSidebar({ active: 'aulas' }));

  if (!aula) {
    const main = document.createElement('main');
    main.className = 'main-content';
    main.innerHTML = `
      <div class="lessons-empty">
        <p>Aula não encontrada.</p>
        <a class="btn btn--primary" href="#/aulas">Voltar para as aulas</a>
      </div>`;
    app.appendChild(main);
    return app;
  }

  const main = document.createElement('main');
  main.className = 'main-content aula';
  main.innerHTML = `
    <header class="page-head animate-fade-in">
      <div>
        <a class="aula__back" href="#/aulas">${icons.arrowLeft} Voltar para as aulas</a>
        <p class="aula__module">${escapeHtml(aula.modulo)}</p>
        <h1 class="page-title">${escapeHtml(aula.titulo)}</h1>
        <p class="page-subtitle">${escapeHtml(aula.subtitulo)}</p>
        <div class="lesson-card__meta">
          <span class="lesson-card__meta-item">${icons.list} ${aula.secoes.length} ${aula.secoes.length === 1 ? 'seção' : 'seções'}</span>
          <span class="lesson-card__meta-item">${icons.clock} ${aula.tempo} min</span>
        </div>
      </div>
    </header>

    <div class="aula__content">
      ${aula.secoes.map((secao, index) => `
        <section class="aula__section card animate-up" id="secao-${index + 1}">
          <h2 class="aula__section-title">
            <span class="aula__section-num" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
            ${escapeHtml(secao.titulo)}
          </h2>
          <div class="aula__blocks">
            ${secao.blocos.map(renderBlock).join('')}
          </div>
        </section>`).join('')}
    </div>

    <div class="aula__actions">
      <button class="btn btn--secondary" type="button" data-scroll-top>${icons.arrowLeft} Início da página</button>
      <a class="btn btn--primary" href="#/lessons">${icons.list} Ir para os exercícios</a>
    </div>
  `;

  app.appendChild(main);

  $('[data-scroll-top]', main).addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    app.scrollTop = 0;
  });

  return app;
}
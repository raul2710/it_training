import { createHeader } from '../components/header.js';
import { createSidebar } from '../components/sidebar.js';
import { storage } from '../storage.js';
import { router } from '../router.js';
import { icons } from '../icons.js';
import { LETTERS, escapeHtml, formatTime } from '../utils.js';

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Tela de resultado: resumo do desempenho e revisão das questões. */
export function resultPage() {
  const result = storage.getJSON('result');

  if (!result) {
    router.navigate('#/lessons');
    return document.createElement('div');
  }

  const app = document.createElement('div');
  app.className = 'app-shell';

  app.appendChild(createHeader());
  app.appendChild(createSidebar({ active: 'lessons' }));

  const main = document.createElement('main');
  main.className = 'main-content result';
  main.innerHTML = `
    <header class="page-head animate-fade-in">
      <div>
        <h1 class="page-title">Resultado</h1>
        <p class="page-subtitle">${escapeHtml(result.lessonTitle)} • ${escapeHtml(result.student)}</p>
      </div>
    </header>

    <section class="result-summary card animate-up">
      <div class="result__ring" style="--percent: ${result.percent}" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle class="ring-bg" cx="60" cy="60" r="${RING_RADIUS}" />
          <circle class="ring-fg" cx="60" cy="60" r="${RING_RADIUS}"
            style="stroke-dashoffset: ${RING_CIRCUMFERENCE * (1 - result.percent / 100)}" />
        </svg>
        <div class="result__ring-value">
          <strong>${result.percent}%</strong>
          <span>acertos</span>
        </div>
      </div>
      <div class="result__stats">
        <div class="result__stat result__stat--grade">
          <span class="result__stat-label">Nota</span>
          <strong>${formatGrade(result.grade)}</strong>
        </div>
        <div class="result__stat result__stat--correct">
          <span class="result__stat-label">Acertos</span>
          <strong>${result.correct} <small>de ${result.total}</small></strong>
        </div>
        <div class="result__stat result__stat--wrong">
          <span class="result__stat-label">Erros</span>
          <strong>${result.wrong}</strong>
        </div>
        <div class="result__stat result__stat--time">
          <span class="result__stat-label">Tempo gasto</span>
          <strong>${formatTime(result.timeSpent)}</strong>
        </div>
      </div>
    </section>

    <section class="review">
      <h2 class="section-title">Revisão das questões</h2>
      ${result.review.map((item, index) => reviewCard(item, index)).join('')}
    </section>

    <div class="result__actions">
      <a class="btn btn--primary" href="#/quiz/${encodeURIComponent(result.lessonId)}">
        ${icons.refresh} Refazer questionário
      </a>
      <a class="btn btn--secondary" href="#/lessons">
        ${icons.book} Voltar ao menu
      </a>
    </div>
  `;

  app.appendChild(main);
  return app;
}

function formatGrade(value) {
  const fixed = Number(value).toFixed(1);
  return fixed.replace('.', ',');
}

function reviewCard(item, index) {
  const options = item.alternativas
    .map((alt, i) => {
      const isCorrect = i === item.correta;
      const isStudentChoice = i === item.resposta;

      let className = 'option option--readonly';
      if (isCorrect) className += ' option--correct';
      else if (isStudentChoice) className += ' option--wrong';

      const tag = isCorrect
        ? `${icons.check} Resposta correta`
        : isStudentChoice
          ? `${icons.x} Sua resposta`
          : '';

      return `
        <div class="${className}">
          <span class="option__letter">${LETTERS[i]}</span>
          <span class="option__text">${escapeHtml(alt)}</span>
          ${tag ? `<span class="option__tag">${tag}</span>` : ''}
        </div>`;
    })
    .join('');

  const note = item.explicacao
    ? `<div class="review__note"><strong>Explicação</strong><p>${escapeHtml(item.explicacao)}</p></div>`
    : '';

  return `
    <article class="review__item card animate-up">
      <header class="review__header">
        <span class="badge badge--primary">Questão ${index + 1}</span>
        <span class="badge ${item.acertou ? 'badge--success' : 'badge--danger'}">
          ${item.acertou ? icons.check : icons.x} ${item.acertou ? 'Correta' : 'Incorreta'}
        </span>
      </header>
      <p class="review__question">${escapeHtml(item.pergunta)}</p>
      <div class="review__options">${options}</div>
      ${note}
    </article>`;
}
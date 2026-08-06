import { createHeader } from '../components/header.js';
import { createSidebar } from '../components/sidebar.js';
import { createProgressBar, updateProgressBar } from '../components/progress.js';
import { openModal } from '../components/modal.js';
import { getLesson } from './lessons.js';
import { QuizEngine } from '../quiz/quizEngine.js';
import { createTimer } from '../quiz/timer.js';
import { computeScore } from '../quiz/score.js';
import { storage } from '../storage.js';
import { router } from '../router.js';
import { icons } from '../icons.js';
import { $, LETTERS, escapeHtml, formatTime } from '../utils.js';

const KEY_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Questionário de uma aula. Retorna { el, onLeave } para limpeza ao sair. */
export function quizPage(params) {
  const lesson = getLesson(params.lessonId);
  const app = document.createElement('div');

  if (!lesson) {
    app.className = 'container';
    app.innerHTML = '<p class="empty-state">Aula não encontrada.</p>';
    return app;
  }

  const engine = new QuizEngine(lesson);
  const timer = createTimer();
  const studentName = storage.get('name') || 'Aluno';

  app.className = 'app-shell';
  app.appendChild(createHeader());
  app.appendChild(createSidebar({ active: 'lessons' }));

  const main = document.createElement('main');
  main.className = 'main-content quiz';
  app.appendChild(main);

  main.innerHTML = `
    <div class="quiz__topbar animate-fade-in">
      <div>
        <h1 class="quiz__title">${escapeHtml(lesson.titulo)} — ${escapeHtml(lesson.descricao)}</h1>
        <p class="quiz__student">${icons.user} ${escapeHtml(studentName)}</p>
      </div>
      <div class="quiz__timer" aria-label="Tempo decorrido">
        ${icons.clock}<span data-timer>00:00</span>
      </div>
    </div>

    <div class="quiz__progress" data-progress></div>

    <div class="quiz__meta">
      <span class="quiz__counter" data-counter></span>
      <span class="quiz__answered" data-answered></span>
    </div>

    <div class="quiz__body" data-body></div>

    <div class="quiz__nav">
      <button class="btn btn--secondary" type="button" data-prev>${icons.arrowLeft}<span>Anterior</span></button>
      <button class="btn btn--ghost" type="button" data-finish>Finalizar</button>
      <button class="btn btn--primary" type="button" data-next><span>Próxima</span>${icons.arrowRight}</button>
    </div>
  `;

  $('[data-progress]', main).appendChild(
    createProgressBar({ current: 1, total: engine.total })
  );

  const timerEl = $('[data-timer]', main);
  timer.onTick = (seconds) => {
    timerEl.textContent = formatTime(seconds);
  };
  timer.start();

  const renderQuestion = () => {
    const entry = engine.current;
    const selected = engine.answers[entry.id];

    $('[data-counter]', main).textContent = `Questão ${engine.currentIndex + 1} de ${engine.total}`;
    $('[data-answered]', main).textContent = `${engine.answeredCount} de ${engine.total} respondidas`;
    updateProgressBar($('[data-progress] .progress', main), engine.currentIndex + 1, engine.total);

    $('[data-body]', main).innerHTML = `
      <article class="question animate-fade-in">
        <p class="question__text">${escapeHtml(entry.pergunta)}</p>
      </article>
      <div class="options animate-up" role="radiogroup" aria-label="Alternativas">
        ${entry.alternativas
          .map(
            (alt, index) => `
            <button class="option ${selected === index ? 'option--selected' : ''}" type="button"
              role="radio" aria-checked="${selected === index}" data-option="${index}">
              <span class="option__letter">${LETTERS[index]}</span>
              <span class="option__text">${escapeHtml(alt)}</span>
              <span class="option__check">${selected === index ? icons.check : ''}</span>
            </button>`
          )
          .join('')}
      </div>
    `;

    const prevBtn = $('[data-prev]', main);
    prevBtn.disabled = engine.currentIndex === 0;

    const nextBtn = $('[data-next]', main);
    nextBtn.disabled = !engine.isAnswered;
    nextBtn.innerHTML = engine.isLast
      ? `${icons.check}<span>Finalizar</span>`
      : `<span>Próxima</span>${icons.arrowRight}`;

    $('[data-finish]', main).classList.toggle('is-hidden', engine.isLast);
  };

  const selectAnswer = (index) => {
    if (index < 0 || index >= engine.current.alternativas.length) return;
    engine.select(index);
    renderQuestion();
  };

  const finalize = () => {
    timer.stop();
    const score = computeScore(engine);
    storage.setJSON('result', {
      student: studentName,
      lessonId: lesson.id,
      lessonTitle: lesson.titulo,
      lessonDescricao: lesson.descricao,
      timeSpent: timer.elapsed,
      ...score
    });
    router.navigate('#/result');
  };

  const openFinishModal = () => {
    const missing = engine.total - engine.answeredCount;
    const message =
      missing > 0
        ? `<p>Você ainda não respondeu <strong>${missing}</strong> ${missing === 1 ? 'questão' : 'questões'} de <strong>${engine.total}</strong>.</p>
           <p>As questões não respondidas serão contadas como erros. Deseja continuar?</p>`
        : `<p>Todas as <strong>${engine.total}</strong> questões foram respondidas. Deseja finalizar?</p>`;

    const modal = openModal({
      title: 'Finalizar questionário?',
      body: message,
      actions: `
        <button class="btn btn--secondary" type="button" data-modal-close>Cancelar</button>
        <button class="btn btn--primary" type="button" data-confirm-finish>Finalizar ${icons.check}</button>
      `
    });

    $('[data-confirm-finish]', modal.overlay).addEventListener('click', () => {
      modal.close();
      finalize();
    });
  };

  const handleNext = () => {
    if (!engine.isAnswered) return;
    if (engine.isLast) {
      openFinishModal();
      return;
    }
    engine.next();
    renderQuestion();
  };

  const onKeydown = (event) => {
    if (document.querySelector('.modal-overlay')) return;

    const optionIndex = KEY_OPTIONS.indexOf(event.key);
    if (optionIndex >= 0) {
      event.preventDefault();
      selectAnswer(optionIndex);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleNext();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (engine.currentIndex > 0) {
        engine.prev();
        renderQuestion();
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  };

  main.addEventListener('click', (event) => {
    const optionBtn = event.target.closest('[data-option]');
    if (optionBtn) {
      selectAnswer(Number(optionBtn.dataset.option));
      return;
    }
    if (event.target.closest('[data-prev]')) {
      engine.prev();
      renderQuestion();
      return;
    }
    if (event.target.closest('[data-next]')) {
      handleNext();
      return;
    }
    if (event.target.closest('[data-finish]')) {
      openFinishModal();
    }
  });

  document.addEventListener('keydown', onKeydown);

  renderQuestion();
  $('[data-body] .option', main)?.focus();

  return {
    el: app,
    onLeave() {
      timer.stop();
      document.removeEventListener('keydown', onKeydown);
    }
  };
}
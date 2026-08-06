import { storage } from '../storage.js';
import { router } from '../router.js';
import { icons } from '../icons.js';
import { $, escapeHtml } from '../utils.js';
import { BRANDING } from '../branding.js';

/** Tela inicial: solicita o nome do aluno para iniciar a sessão. */
export function homePage() {
  const app = document.createElement('div');
  app.className = 'home';
  app.innerHTML = `
    <div class="auth-card card animate-pop">
      <img class="auth-card__logo" src="${BRANDING.logo}" alt="${escapeHtml(BRANDING.name)}" />
      <h1 class="auth-card__title">${escapeHtml(BRANDING.name)}</h1>
      <p class="auth-card__tagline">Responda os questionários das aulas, confira seu desempenho e evolua.</p>

      <form class="auth-card__form" data-form novalidate>
        <label class="field">
          <span class="field__label" for="student-name">Qual é o seu nome?</span>
          <input class="input input--lg" id="student-name" type="text" name="name"
            placeholder="Digite seu nome" autocomplete="name" maxlength="40" required />
          <span class="field__hint">Seu nome fica salvo apenas nesta sessão — fechar a aba apaga tudo.</span>
        </label>
        <button class="btn btn--primary btn--lg btn--block" type="submit">Entrar ${icons.arrowRight}</button>
      </form>
    </div>
  `;

  const input = $('#student-name', app);

  $('[data-form]', app).addEventListener('submit', (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) {
      input.classList.add('input--error');
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    storage.set('name', name);
    router.navigate('#/lessons');
  });

  input.addEventListener('input', () => {
    input.classList.remove('input--error');
    input.removeAttribute('aria-invalid');
  });

  // Foco automático após a montagem da página.
  setTimeout(() => input.focus(), 0);

  return app;
}
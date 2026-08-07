import { storage } from '../storage.js';
import { icons } from '../icons.js';
import { $, escapeHtml, getInitial, getTheme, toggleTheme } from '../utils.js';
import { BRANDING } from '../branding.js';

/** Cabeçalho fixo com alternar tema, menu lateral e nome do aluno. */
export function createHeader() {
  const name = storage.get('name') || 'Aluno';
  const header = document.createElement('header');
  header.className = 'app-header';

  header.innerHTML = `
    <div class="app-header__left">
      <button class="icon-btn" type="button" data-toggle-sidebar
        aria-label="Alternar menu lateral" aria-expanded="true">${icons.menu}</button>
      <a class="app-header__brand" href="#/lessons" aria-label="${escapeHtml(BRANDING.name)} - Exercícios">
        <img class="app-header__logo" src="${BRANDING.logo}" alt="${escapeHtml(BRANDING.name)}" />
        <span class="app-header__title">${escapeHtml(BRANDING.name)}</span>
      </a>
    </div>
    <div class="app-header__right">
      <button class="icon-btn" type="button" data-toggle-theme aria-label="Alternar tema">${themeIcon()}</button>
      <div class="app-header__user" title="Aluno: ${escapeHtml(name)}">
        <span class="app-header__avatar" aria-hidden="true">${getInitial(name)}</span>
        <span class="app-header__username">${escapeHtml(name)}</span>
      </div>
    </div>
  `;

  $('[data-toggle-sidebar]', header).addEventListener('click', () => {
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    document.body.classList.toggle(isMobile ? 'sidebar-open' : 'sidebar-collapsed');
  });

  const themeBtn = $('[data-toggle-theme]', header);
  themeBtn.addEventListener('click', () => {
    const theme = toggleTheme();
    themeBtn.innerHTML = themeIcon(theme);
    themeBtn.setAttribute('aria-label', themeLabel(theme));
  });

  return header;
}

function themeIcon(theme = getTheme()) {
  return theme === 'dark' ? icons.sun : icons.moon;
}

function themeLabel(theme) {
  return theme === 'dark' ? 'Alternar para o tema claro' : 'Alternar para o tema escuro';
}
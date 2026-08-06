import { icons } from '../icons.js';
import { BRANDING } from '../branding.js';

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
}

/** Barra lateral recolhível com navegação e rodapé informativo. */
export function createSidebar({ active = '' } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sidebar-wrapper';

  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.addEventListener('click', closeSidebar);

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.setAttribute('aria-label', 'Menu lateral');
  sidebar.innerHTML = `
    <nav class="sidebar__nav" aria-label="Navegação principal">
      <a class="sidebar__link ${active === 'lessons' ? 'is-active' : ''}" href="#/lessons" aria-current="${active === 'lessons' ? 'page' : 'false'}">
        ${icons.book}<span>Minhas aulas</span>
      </a>
    </nav>
    <div class="sidebar__footer">
      <span class="sidebar__hint"><img class="sidebar__logo" src="${BRANDING.logo}" alt="" /><span>${BRANDING.name}</span></span>
      <p class="sidebar__caption">Dados salvos apenas nesta sessão.</p>
    </div>
  `;

  wrapper.append(overlay, sidebar);
  return wrapper;
}
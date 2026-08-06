import { icons } from '../icons.js';
import { $ } from '../utils.js';

/**
 * Abre um modal com foco gerenciado.
 * Retorna { overlay, close } para o chamador fechar e/ou ligar eventos.
 */
export function openModal({ title, body = '', actions = '', size = 'md' } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal modal--${size}" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-body">
      <div class="modal__header">
        <h2 class="modal__title" id="modal-title">${title}</h2>
        <button class="icon-btn modal__close" type="button" data-modal-close aria-label="Fechar">${icons.x}</button>
      </div>
      <div class="modal__body" id="modal-body">${body}</div>
      ${actions ? `<div class="modal__footer">${actions}</div>` : ''}
    </div>
  `;

  const previousFocus = document.activeElement;

  const close = () => {
    document.removeEventListener('keydown', onKeydown);
    overlay.remove();
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  };

  const onKeydown = (event) => {
    if (event.key === 'Escape') close();
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
    if (event.target.closest('[data-modal-close]')) close();
  });

  document.addEventListener('keydown', onKeydown);
  document.body.appendChild(overlay);
  $('.modal__close', overlay)?.focus();

  return { overlay, close };
}
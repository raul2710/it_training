/** Barra de progresso acessível. */
export function createProgressBar({ current = 0, total = 0 } = {}) {
  const bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(total));

  const fill = document.createElement('div');
  fill.className = 'progress__fill';
  bar.appendChild(fill);

  updateProgressBar(bar, current, total);
  return bar;
}

export function updateProgressBar(bar, current, total) {
  const safeTotal = total || 0;
  const safeCurrent = Math.max(0, Math.min(current, safeTotal));
  const percent = safeTotal ? Math.round((safeCurrent / safeTotal) * 100) : 0;
  const fill = bar.querySelector('.progress__fill');

  if (fill) fill.style.width = `${percent}%`;
  bar.setAttribute('aria-valuenow', String(safeCurrent));
  bar.setAttribute('aria-label', `Progresso: ${safeCurrent} de ${safeTotal} questões`);
}
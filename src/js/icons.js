// Ícones SVG inline. Usam currentColor para herdar a cor do contexto (tema).

const outline = (paths) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true" focusable="false">
    ${paths}
  </svg>`;

const filled = (paths) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
    aria-hidden="true" focusable="false">
    ${paths}
  </svg>`;

export const icons = {
  // ~ capelo de formatura (logo)
  logo: filled(
    '<path d="M12 3.5 2 8.4l10 5 8.5-4.2V15h1.5V8.4L12 3.5z"/>' +
    '<path d="M7.5 11.2v3.2c0 .82 2.01 1.5 4.5 1.5s4.5-.68 4.5-1.5v-3.2l-4.5 2.5-4.5-2.5z"/>' +
    '<path d="M7.5 16.6V19l4.5 2.2L16.5 19v-2.4"/>'
  ),

  menu: outline('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'),

  sun: outline('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>'),

  moon: outline('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),

  search: outline('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),

  clock: outline('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),

  book: outline('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),

  list: outline('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".8"/><circle cx="3.5" cy="12" r=".8"/><circle cx="3.5" cy="18" r=".8"/>'),

  user: outline('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),

  arrowLeft: outline('<path d="M19 12H5M12 19l-7-7 7-7"/>'),

  arrowRight: outline('<path d="M5 12h14M12 5l7 7-7 7"/>'),

  check: outline('<path d="M20 6 9 17l-5-5"/>'),

  x: outline('<path d="M18 6 6 18M6 6l12 12"/>'),

  refresh: outline('<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>'),

  award: outline('<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>'),

  folder: outline('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>'),

  chevron: outline('<path d="M6 9l6 6 6-6"/>')
};

export const iconList = Object.keys(icons);
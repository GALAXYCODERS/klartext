// Linien-Icons „Klartext“: 24er-Raster, Strich 1,5 px, eckige Enden, Gehrung – technisch statt freundlich.
// Farbe über currentColor, Größe über font-size (Icons sind 1em groß).
const svg = (body) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${body}</svg>`;

export const icons = {
  bestellung: svg('<path d="M2.5 4h3l2.4 11h10.4L21 7.5H7"/><rect x="8.2" y="17.8" width="2.6" height="2.6"/><rect x="15.6" y="17.8" width="2.6" height="2.6"/>'),
  zahlung: svg('<circle cx="12" cy="12" r="8.75"/><path d="M15.2 8.6a4.4 4.4 0 1 0 0 6.8M7.6 10.6h5.6M7.6 13.4h5.6"/>'),
  versand: svg('<path d="M12 2.8l8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4z"/><path d="M3.8 7.4L12 12l8.2-4.6M12 12v9.2M7.9 5.1l8.2 4.6"/>'),
  monolith: svg('<path d="M4 3.5h16v17H4z"/><path d="M4 9.2h16M4 14.8h16"/>'),
  datenbank: svg('<path d="M12 3l8 3.6-8 3.6-8-3.6z"/><path d="M4 11.2l8 3.6 8-3.6M4 15.8l8 3.6 8-3.6"/>'),
  person: svg('<path d="M8.5 4.5h7v7h-7z"/><path d="M4.5 20.5v-4.5h15v4.5"/>'),
  team: svg('<path d="M5 5h5.5v5.5H5zM13.5 6.5h5v5h-5z"/><path d="M2.5 20v-5.5h10.5V20M15.5 14.5H21V20"/>'),
  uhr: svg('<circle cx="12" cy="12" r="8.75"/><path d="M12 7v5l3.2 2.2"/>'),
  warnung: svg('<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 16.8v1"/>'),
  schloss: svg('<path d="M5 10.5h14v10H5z"/><path d="M8.2 10.5V7.2h7.6v3.3M12 14.2v2.6"/>'),
  pfeil: svg('<path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  minus: svg('<path d="M5 12h14"/>'),
  aus: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  haken: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  sanduhr: svg('<path d="M6.5 3.5h11M6.5 20.5h11M8 3.5v3l4 5.5-4 5.5v3M16 3.5v3L12 12l4 5.5v3"/>'),
  blitz: svg('<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>'),
  browser: svg('<path d="M3 4.5h18v15H3z"/><path d="M3 9h18M6 6.8h1.5M9 6.8h1.5"/>'),
  app: svg('<path d="M7 2.5h10v19H7z"/><path d="M11 18.5h2"/>'),
  gateway: svg('<path d="M4 20.5V9.5L12 4l8 5.5v11"/><path d="M9.5 20.5v-6h5v6M2.5 20.5h19"/>'),
  registry: svg('<path d="M4.5 3h15v18h-15z"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  zahnrad: svg('<path d="M9 9h6v6H9z"/><path d="M12 2.8v3.4M12 17.8v3.4M21.2 12h-3.4M6.2 12H2.8M18.5 5.5l-2.4 2.4M7.9 16.1l-2.4 2.4M18.5 18.5l-2.4-2.4M7.9 7.9L5.5 5.5"/>'),
  waage: svg('<path d="M12 3.5v17M7 20.5h10M4 7.5h16"/><path d="M4 7.5L1.5 14h5zM20 7.5L17.5 14h5z"/>'),
  pizza: svg('<path d="M12 3c3.6 0 6.9 1.4 9.3 3.7L12 21 2.7 6.7C5.1 4.4 8.4 3 12 3z"/><path d="M9.5 8.5h1.5v1.5H9.5zM13.5 12h1.5v1.5h-1.5zM11.5 15.5h1.2v1.2h-1.2z"/>'),
};

export const services = [
  { key: 'bestellung', name: 'Bestellung', team: 'A' },
  { key: 'zahlung', name: 'Zahlung', team: 'B' },
  { key: 'versand', name: 'Versand', team: 'C' },
];

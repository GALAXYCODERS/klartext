import './tabelle.css';
import { table, statement, esc } from '../lib/ds.js';
import { appear, swap, hideInitially } from '../lib/motion.js';

// Tabellen-Folie: links ein Raster aus Begriffen, rechts die Tabelle.
// Mit jeder Zeile leuchtet im Raster der Begriff aus der ersten Spalte auf.
export default {
  render(s) {
    const raster = s.raster
      .map(
        (k) => `<div class="z-cat"><span class="label-mono">${esc(k.kategorie)}</span><div class="z-chips">${k.attribute
          .map((a) => `<span class="z-chip" data-attr="${esc(a)}">${esc(a)}</span>`)
          .join('')}</div></div>`
      )
      .join('');
    return `
      <div class="z-grid">
        <aside class="z-raster"><p class="z-raster-head">${esc(s.rasterTitel || '')}</p>${raster}</aside>
        <div class="z-table">${table({ head: s.kopf, rows: s.zeilen })}</div>
      </div>
      ${statement(s.schluss, 'z-lead')}`;
  },

  build({ tl, q, q1, step, s }) {
    const rows = q('.z-table tbody tr');
    hideInitially(rows, q1('.z-lead'));
    appear(tl, [q1('.z-raster'), q1('.z-table thead')], { y: 12, stagger: 0.1, pos: 0.25 });
    step(); // Schritt 0: Raster + Tabellenkopf

    rows.forEach((r, i) => {
      const chip = q1(`.z-chip[data-attr="${s.zeilen[i][0]}"]`);
      appear(tl, r, { y: 12 });
      if (chip) swap(tl, chip, { attr: { class: 'z-chip is-on' } }, '<0.02');
      step(); // Schritte 1–5: je ein Ziel
    });

    appear(tl, q1('.z-lead'), { y: 12, duration: 0.8 });
    step(); // Schritt 6: Schlusssatz
  },
};

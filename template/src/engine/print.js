import { slides } from '../../content/slides.js';
import { createInstance } from './instance.js';

/**
 * Druckmodus (?print=1): alle Folien untereinander, je 1920×1080, Endzustand.
 * Folien mit `druck: [2, 3]` werden mehrfach gedruckt (je Schritt eine Seite).
 * Playwright wartet auf window.__PRINT_READY.
 */
export async function renderPrint(root) {
  document.body.classList.add('mode-print');
  let page = 0;
  slides.forEach((s, i) => {
    const probe = createInstance(s, i, { reduced: true });
    const states = s.druck?.length ? s.druck : [probe.steps - 1];
    states.forEach((step, k) => {
      const inst = k === 0 ? probe : createInstance(s, i, { reduced: true });
      inst.el.querySelectorAll('[data-flip]').forEach((e) => e.removeAttribute('data-flip'));
      const wrap = document.createElement('div');
      wrap.className = 'print-page';
      wrap.dataset.slide = String(i + 1);
      wrap.dataset.step = String(step);
      wrap.appendChild(inst.el);
      root.appendChild(wrap);
      // erst im Dokument springen: DrawSVG misst Leitungslängen beim ersten Rendern (losgelöst = 0 → unsichtbar)
      inst.tl.seek(inst.labelTime(step), false); // false: onUpdate läuft (z. B. Zähler zeigen den Endwert)
      page += 1;
    });
  });
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__PRINT_PAGES = page;
  window.__PRINT_READY = true;
}

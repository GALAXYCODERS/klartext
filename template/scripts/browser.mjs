// Gemeinsamer Start von Chromium (Playwright) für PDF-Export und QA.
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const DIST_HTML = resolve('dist/presentation.html');
export const fileUrl = (query = '') => `${pathToFileURL(DIST_HTML).href}${query}`;

export async function launch() {
  if (!existsSync(DIST_HTML)) {
    console.error('✗ dist/presentation.html fehlt – zuerst „npm run build“ ausführen.');
    process.exit(1);
  }
  try {
    return await chromium.launch();
  } catch (e) {
    // Rückfall: installiertes Google Chrome (z. B. wenn der Playwright-Download blockiert ist)
    try {
      return await chromium.launch({ channel: 'chrome' });
    } catch {
      /* weiter zur Meldung unten */
    }
    console.error('✗ Chromium für Playwright fehlt. Einmalig installieren mit:\n    npx playwright install chromium\n');
    console.error(String(e).split('\n')[0]);
    process.exit(1);
  }
}

/**
 * Prüft im Druckmodus jede Seite: Elemente, die über den Folienrand ragen, und Texte, die in ihrem
 * Kasten abgeschnitten werden. Liefert eine Liste von Befunden (leer = alles in Ordnung).
 */
export async function layoutFindings(page) {
  return page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.print-page').forEach((pg) => {
      const base = pg.getBoundingClientRect();
      const where = `Folie ${pg.dataset.slide}${pg.dataset.step ? ` (Schritt ${+pg.dataset.step + 1})` : ''}`;
      pg.querySelectorAll('.slide *').forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || +cs.opacity === 0 || cs.display === 'none') return;
        if (el.closest('svg') && el.tagName !== 'svg') return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const name = (el.className?.baseVal ?? el.className ?? el.tagName).toString().split(' ')[0] || el.tagName;
        if (!el.matches('svg.wires') && (r.left < base.left - 2 || r.right > base.right + 2 || r.top < base.top - 2 || r.bottom > base.bottom + 2)) {
          out.push(`${where}: „${name}“ ragt über den Folienrand`);
        }
        const textBox = el.matches('.node, .badge, .card, .card__title, .card__text, .ds-table td, .quelle, .statement, .stat__value, .e-box, .w-chip, .i-benefit');
        if (textBox && (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 6)) {
          out.push(`${where}: Text passt nicht in „${name}“`);
        }
      });
    });
    return [...new Set(out)];
  });
}

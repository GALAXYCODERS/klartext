import { regie } from '../../content/regie.js';

// Regie-Notizen (content/regie.js) als HTML – für Referentenansicht und Notizen-PDF.
const esc = (t = '') => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
/** Text mit **fett** → HTML. */
export const md = (t = '') => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

export const regieFor = (id) => regie[id] || null;
export const stepLabel = (k) => (k === 0 ? 'Folie erscheint' : `Klick ${k}`);

/** Ein Schritt: was passiert · Stichworte · Tipp. */
export function stepHTML(st, k, { active = false, done = false } = {}) {
  if (!st) return '';
  return `<div class="rg-step ${active ? 'is-now' : ''} ${done ? 'is-done' : ''}" data-k="${k}">
    <div class="rg-key">${k === 0 ? '◇' : '▶'} ${esc(stepLabel(k))}</div>
    <div class="rg-body">
      <p class="rg-zeigt">${md(st.zeigt)}</p>
      ${st.sagen?.length ? `<ul class="rg-sagen">${st.sagen.map((x) => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
      ${st.tipp ? `<p class="rg-tipp">${md(st.tipp)}</p>` : ''}
    </div>
  </div>`;
}

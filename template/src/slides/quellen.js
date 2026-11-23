import './quellen.css';
import { esc } from '../lib/ds.js';

// Quellenverzeichnis (statisch, gut lesbar – wichtig fürs PDF) + optionaler Hinweis.
export default {
  render(s) {
    return `
      <dl class="q-list">${s.eintraege.map(([a, t]) => `<dt>${esc(a)}</dt><dd>${esc(t)}</dd>`).join('')}</dl>
      ${s.hinweis ? `<p class="q-ki">${esc(s.hinweis)}</p>` : ''}`;
  },
};

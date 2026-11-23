import './zitat.css';
import { quote, card, badge, statement } from '../lib/ds.js';
import { appear, underline, drawWire, hideInitially } from '../lib/motion.js';

// Zitat-Folie: großes Zitat, Schlüsselbegriffe ([[so markiert]]) werden nacheinander unterstrichen;
// zwei Karten mit gemeinsamem Kern (Verbindungslinie); unten der Leitsatz.
export default {
  render(s) {
    const [w, st] = s.karten;
    return `
      ${quote({ text: s.zitat.text, src: s.zitat.quelle, cls: 'd-quote' })}
      <div class="d-row">
        ${card({ label: w.label, title: w.titel, text: w.text, cls: 'd-card' })}
        <div class="d-core">
          <svg viewBox="0 0 340 12" aria-hidden="true"><path class="wire d-line" d="M0 6H340"/></svg>
          ${badge(s.kern, { icon: 'haken', cls: 'd-badge' })}
        </div>
        ${card({ label: st.label, title: st.titel, text: st.text, cls: 'd-card' })}
      </div>
      ${statement(s.leitsatz, 'd-lead')}`;
  },

  build({ tl, q, q1, step }) {
    hideInitially(q1('.d-line'), q1('.d-badge'));

    // Schritt 0: Zitat erscheint ruhig
    appear(tl, q1('.d-quote'), { y: 12, duration: 0.9, pos: 0.25 });
    step();

    // Schritt 1: kleine Services · eigener Prozess · leichtgewichtig
    underline(tl, q('.d-quote .mark'), { duration: 0.6, stagger: 0.55 });
    step();

    // Schritt 2: Wolff und Starke – gemeinsamer Kern „einzeln deploybar“
    appear(tl, q('.d-card'), { y: 32, stagger: 0.12 });
    drawWire(tl, q1('.d-line'), { duration: 0.5, pos: '-=0.2' });
    appear(tl, q1('.d-badge'), { y: 6, pos: '-=0.15' });
    step();

    // Schritt 3: roter Faden
    appear(tl, q1('.d-lead'), { y: 16, duration: 0.8 });
    step();
  },
};

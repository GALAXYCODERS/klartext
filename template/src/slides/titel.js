import './titel.css';
import { node, monolithFrame, db, wires, wire, packet, nodeAnchor, g, esc } from '../lib/ds.js';
import { appear, vanish, colorize, drawWire, travel, hideInitially, type, EASE } from '../lib/motion.js';

// Titelfolie mit Leitmotiv. Das Feld spart groß „</>“ aus (content/slides.js: maske).
// Beim Weiterklicken löst sich die Glyphe auf, der graue Block reißt und zerfällt in drei Module (Akzente A · B · C).
const KEYS = ['bestellung', 'zahlung', 'versand'];
const MONO = { x: g(56), y: [g(10), g(15), g(20)] };
const SPLIT = { bestellung: [g(50), g(8)], zahlung: [g(62), g(15)], versand: [g(50), g(22)] };
const C = Object.fromEntries(KEYS.map((k) => [k, nodeAnchor(...SPLIT[k])]));
const FRAME = { x: g(54), y: g(7), w: g(17), h: g(23) };
// Risse laufen zwischen den Modulen durch den Block (leicht unregelmäßig)
const crack = (y) => [
  [FRAME.x, y],
  [FRAME.x + 90, y - 5],
  [FRAME.x + 170, y + 4],
  [FRAME.x + 260, y - 3],
  [FRAME.x + 330, y + 5],
  [FRAME.x + FRAME.w, y],
];

export default {
  render(s, { meta }) {
    return `
      <div class="scene">
        <div class="hero-meta hero-meta--top" data-ruhe><span>${esc(meta.kopfzeile)}</span><span>${esc(meta.anlass || '')}</span></div>
        <h1 class="hero-title">${esc(meta.titel)}</h1>
        <p class="hero-sub">${esc(meta.untertitel)}</p>
        <div class="hero-meta hero-meta--bottom" data-ruhe><span>${esc(meta.autor || '')}</span><span>${esc(meta.datum || '')}</span></div>
        ${wires(
          wire([C.bestellung, C.zahlung], { cls: 'w-bz' }) +
            wire([C.bestellung, C.versand], { kind: 'async', cls: 'w-bv' }) +
            wire([C.zahlung, C.versand], { kind: 'async', cls: 'w-zv' })
        )}
        ${monolithFrame({ ...FRAME, label: 'Monolith · ein Deployment' })}
        ${db({ x: FRAME.x + FRAME.w / 2 - 60, y: g(25) - 4, kind: 'tabelle', label: 'eine Datenbank', cls: 'mono-db' })}
        ${KEYS.map((k, i) => node(k, { x: MONO.x, y: MONO.y[i], mono: true })).join('')}
        ${wires(wire(crack(g(14) + 16), { cls: 'crack' }) + wire(crack(g(19) + 16), { cls: 'crack' }), 'cracks')}
        ${packet({ svc: 'bestellung', kind: 'event', cls: 'p1' })}
      </div>`;
  },

  build({ tl, q, q1, step, feldState }) {
    const nodes = KEYS.map((k) => q1(`[data-node="${k}"]`));
    hideInitially(q('.wire'));

    // Schritt 0: Feld baut sich auf (Maske „</>“), der Titel wird getippt, der Monolith steht
    appear(tl, q('.hero-meta'), { duration: 0.9, stagger: 0.1, pos: 0.1 });
    type(tl, q1('.hero-title'), { pos: 0.5, per: 0.04, max: 0.6 });
    appear(tl, q1('.hero-sub'), { duration: 0.9, pos: 0.9 });
    appear(tl, [q1('.monolith'), q1('.mono-db'), ...nodes], { duration: 0.9, stagger: 0.07, pos: 0.4 });
    step();

    // Schritt 1: „</>“ löst sich auf, Risse laufen durch den Block – er zerfällt in drei Services
    tl.fromTo(feldState, { mask: 1 }, { mask: 0, duration: 0.9, ease: 'power2.in' });
    drawWire(tl, q('.crack'), { duration: 0.55, stagger: 0.15, pos: '<0.2' });
    vanish(tl, [q1('.monolith'), ...q('.crack')], { duration: 0.45, pos: '+=0.1' });
    tl.to(q1('.mono-db'), { autoAlpha: 0, y: 24, duration: 0.5, ease: EASE.aus }, '<');
    nodes.forEach((n, i) => {
      const k = KEYS[i];
      tl.to(n, { x: SPLIT[k][0] - MONO.x, y: SPLIT[k][1] - MONO.y[i], duration: 0.9, ease: EASE.weg }, '<0.12');
    });
    colorize(tl, nodes, { duration: 0.9, pos: '<0.1' });
    drawWire(tl, [q1('.w-bz'), q1('.w-bv'), q1('.w-zv')], { pos: '-=0.35' });
    travel(tl, q1('.p1'), [nodeAnchor(...SPLIT.bestellung, 'md', 'b'), nodeAnchor(...SPLIT.versand, 'md', 't')], { duration: 0.9, pos: '-=0.2' });
    step();
  },
};

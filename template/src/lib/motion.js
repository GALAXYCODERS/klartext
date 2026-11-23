// ─────────────────────────────────────────────────────────────────────────────
//  Bewegungs-Vokabular „Klartext“ (DESIGN_KLARTEXT.md, Abschnitt 7). Jede Funktion hängt Tweens an
//  eine Folien-Timeline (tl) und ist umkehrbar (Rückwärts-Navigation) und druckfest (Endzustand = progress(1)).
//  Regel: Jede Bewegung erklärt einen Mechanismus – Nachricht unterwegs, Warten, Ausfall, Wachstum.
//  Signatur-Bewegungen: type (Tippen) · decode (Entschlüsseln) · construct (Konstruieren) ·
//  select (Markieren) · travel (Senden, Ankunft = Feld-Puls) · fail (Ausfall). Höchstens zwei pro Klick.
// ─────────────────────────────────────────────────────────────────────────────
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { feldPuls } from '../engine/feld.js';

gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin);

/**
 * Ein Kurvenpaar: ein = expo.out (alles, was erscheint) · weg = power3.inOut (alles, was sich bewegt) ·
 * aus = power2.in (alles, was geht). Alte Namen (in, travel, morph, leave) zeigen auf dieselben Kurven.
 */
export const EASE = { ein: 'expo.out', weg: 'power3.inOut', aus: 'power2.in', in: 'expo.out', travel: 'power3.inOut', morph: 'power3.inOut', leave: 'power2.in' };
/** Fünf Dauern: Zustand · UI · Erscheinen · Reisen · Zählen (d1…d5). */
export const DUR = { d1: 0.18, d2: 0.36, d3: 0.6, d4: 0.9, d5: 1.4, fast: 0.36, base: 0.6, slow: 0.9, travel: 0.9 };

const list = (t) => (Array.isArray(t) ? t.filter(Boolean) : t ? [t] : []);
const uid = (p) => `${p}${Math.random().toString(36).slice(2, 7)}`;
const escHtml = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Mittelpunkt eines Elements in Bühnenkoordinaten (für Feld-Pulse). */
function stagePoint(el) {
  const stage = el?.closest('.stage');
  if (!stage) return null;
  const b = stage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const k = b.width / 1920 || 1;
  return [(r.left + r.width / 2 - b.left) / k, (r.top + r.height / 2 - b.top) / k];
}

/** Feld-Puls an einer Stelle der Folie (Bühnenkoordinaten oder Element). Nur beim Abspielen, nie beim Springen. */
export function puls(tl, at, { strength = 1, radius = 80, pos, el } = {}) {
  return tl.call(() => {
    const p = Array.isArray(at) ? at : stagePoint(at);
    if (p) feldPuls(p[0], p[1], strength, radius, el || (Array.isArray(at) ? null : at));
  }, null, pos);
}

/** Ausgangszustand setzen (außerhalb der Timeline, damit Rückwärtslaufen sauber bleibt). */
export function hideInitially(...targets) {
  const t = targets.flat().filter(Boolean);
  if (t.length) gsap.set(t, { autoAlpha: 0 });
}

/**
 * Einblenden: 8 px nach oben gleiten und ruhig landen. Konstruierte Rahmen (.fr) bauen sich dabei auf:
 * erst die Eckquadrate, dann ziehen sich die Haarlinien, dann die Fläche.
 */
export function appear(tl, targets, { y = 8, x = 0, stagger = 0.06, duration = DUR.base, pos } = {}) {
  const t = list(targets);
  if (!t.length) return tl;
  const label = uid('appear');
  tl.addLabel(label, pos);
  t.forEach((el, i) => {
    if (el.classList?.contains('fr')) tl.fromTo(el, { '--k': 0 }, { '--k': 1, duration: 0.55, ease: 'power2.out' }, `${label}+=${i * stagger}`);
  });
  // zuletzt: damit „<“ in den Folien weiterhin den Beginn des Einblendens meint
  tl.fromTo(t, { autoAlpha: 0, x, y }, { autoAlpha: 1, x: 0, y: 0, duration, stagger, ease: EASE.ein }, label);
  return tl;
}

/** Konstruieren: Rahmen erscheinen als Linienzeichnung (Ecken → Linien → Fläche), Inhalt gleitet 8 px hoch. */
export function construct(tl, frames, { stagger = 0.06, pos } = {}) {
  const t = list(frames);
  if (!t.length) return tl;
  const label = uid('construct');
  tl.addLabel(label, pos);
  tl.fromTo(t, { autoAlpha: 1, '--k': 0 }, { '--k': 1, duration: DUR.d3, stagger, ease: 'power2.out' }, label);
  const kids = t.flatMap((el) => [...el.children]);
  if (kids.length) tl.fromTo(kids, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: DUR.d3, stagger: stagger / 2, ease: EASE.ein }, `${label}+=0.3`);
  return tl;
}

/**
 * Tippen: Text erscheint Zeichen für Zeichen mit Block-Cursor (22 ms/Zeichen, höchstens 0,55 s),
 * der Cursor blinkt zweimal und erlischt. Rückwärts: schnelles Löschen. Layout bleibt stabil
 * (ungetippte Zeichen sind nur unsichtbar).
 */
export function type(tl, el, { pos, per = 0.022, max = 0.55 } = {}) {
  if (!el) return tl;
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  // Wörter zusammenhalten, damit der Umbruch beim Tippen nicht springt
  el.innerHTML = text
    .split(/(\s+)/)
    .filter(Boolean)
    .map((w) =>
      /^\s+$/.test(w)
        ? '<span class="ch" aria-hidden="true"> </span>'
        : `<span class="w" style="white-space:nowrap">${[...w].map((c) => `<span class="ch" aria-hidden="true">${escHtml(c)}</span>`).join('')}</span>`
    )
    .join('');
  const chars = [...el.querySelectorAll('.ch')];
  const n = chars.length;
  const o = { n: 0, b: 0 };
  let last = -1;
  const render = () => {
    const k = Math.round(o.n);
    const caretOn = k > 0 && o.b < 4 && Math.floor(o.b) % 2 === 0;
    const key = k * 10 + (caretOn ? 1 : 0);
    if (key === last) return;
    last = key;
    chars.forEach((c, i) => {
      c.style.visibility = i < k ? '' : 'hidden';
      c.classList.toggle('is-caret', caretOn && i === k - 1);
    });
  };
  render();
  const label = uid('type');
  tl.addLabel(label, pos);
  tl.to(o, { n, duration: Math.min(max, n * per), ease: 'none', onUpdate: render }, label);
  tl.to(o, { b: 4, duration: 0.5, ease: 'steps(4)', onUpdate: render });
  return tl;
}

const GLYPH = '░▒▓01/<>#';
/**
 * Entschlüsseln: Mono-Werte laufen durch ░▒▓01/<> und rasten von links ein. Deterministisch
 * (rückwärts und im Druck sauber). from: Ausgangstext (Standard: nur Zeichensalat).
 */
export function decode(tl, el, { to, from = '', duration = DUR.d3, pos } = {}) {
  if (!el) return tl;
  const target = to ?? el.textContent;
  const o = { p: 0 };
  const render = () => {
    const p = o.p;
    const len = Math.round(from.length + (target.length - from.length) * Math.min(1, p * 1.6));
    const done = Math.floor(p * target.length + 0.0001);
    let s = '';
    for (let i = 0; i < len; i++) {
      if (p >= 1 || i < done) s += target[i] ?? '';
      else if (p <= 0) s += from[i] ?? '';
      else s += target[i] === ' ' ? ' ' : GLYPH[(i * 7 + Math.floor(p * 24)) % GLYPH.length];
    }
    el.textContent = p <= 0 && from ? from : s;
  };
  render();
  return tl.to(o, { p: 1, duration, ease: 'none', onUpdate: render }, pos);
}

/** Markieren: Editor-Auswahl läuft hinter Schlüsselbegriffen entlang (.mark mit --u 0…1). */
export function select(tl, marks, { duration = 0.5, stagger = 0.35, pos } = {}) {
  const t = list(marks);
  if (!t.length) return tl;
  return tl.fromTo(t, { '--u': 0 }, { '--u': 1, duration, stagger, ease: EASE.weg }, pos);
}

/** Terminal-Zeilen werden nacheinander getippt (Zeilen mit data-ln). */
export function typeLines(tl, lines, { pos, per = 0.012, max = 0.35, gap = 0.08 } = {}) {
  const t = list(lines);
  const label = uid('lines');
  tl.addLabel(label, pos);
  t.forEach((ln, i) => {
    tl.set(ln, { autoAlpha: 1 }, i ? `>${gap}` : label);
    type(tl, ln, { per, max });
  });
  return tl;
}

/** Ausblenden. */
export function vanish(tl, targets, { duration = DUR.fast, pos } = {}) {
  const t = list(targets);
  if (!t.length) return tl;
  return tl.to(t, { autoAlpha: 0, duration, ease: EASE.leave }, pos);
}

/**
 * Leitung erscheint. Synchron (durchgezogen): zeichnet sich vom Start zum Ziel (DrawSVG).
 * Asynchron (gestrichelt): blendet ein, die Striche fließen in Nachrichtenrichtung
 * (DrawSVG würde das Strichmuster zerstören).
 */
export function drawWire(tl, paths, { duration = 0.7, stagger = 0.12, pos } = {}) {
  const t = list(paths);
  if (!t.length) return tl;
  const label = `wire${Math.random().toString(36).slice(2, 7)}`;
  tl.addLabel(label, pos);
  t.forEach((el, i) => {
    const at = `${label}+=${i * stagger}`;
    if (el.classList.contains('wire--async')) {
      tl.fromTo(el, { autoAlpha: 0, strokeDashoffset: 40 }, { autoAlpha: 1, strokeDashoffset: 0, duration: duration * 1.2, ease: 'power1.out' }, at);
    } else {
      tl.fromTo(el, { drawSVG: '0% 0%', autoAlpha: 1 }, { drawSVG: '0% 100%', duration, ease: 'power2.inOut' }, at);
    }
  });
  return tl;
}

/**
 * Paket reist entlang einer Strecke.
 * route: SVG-Pfad (Element) oder Punkte [[x,y], …]. Paket-Elemente sind auf left:0/top:0 und werden per x/y bewegt.
 * followers: Elemente, die mitreisen (z. B. packetLabel).
 */
export function travel(tl, packetEl, route, { duration = DUR.travel, pos, followers = [], fadeOut = true, ease = EASE.travel } = {}) {
  const els = [packetEl, ...list(followers)];
  const path = Array.isArray(route) ? route.map(([x, y]) => ({ x, y })) : route;
  const start = Array.isArray(route) ? { x: route[0][0], y: route[0][1] } : null;
  const label = `travel${Math.random().toString(36).slice(2, 7)}`;
  gsap.set(els, { autoAlpha: 0 }); // Pakete sind unsichtbar, bis sie losreisen
  tl.addLabel(label, pos);
  if (start) tl.set(els, start, label);
  tl.fromTo(els, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'none', immediateRender: false }, label);
  tl.to(
    els,
    {
      motionPath: Array.isArray(route) ? { path, curviness: 0 } : { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false },
      duration,
      ease,
    },
    label
  );
  // Ankunft: das Feld pulst am Ziel
  tl.call(() => {
    let end = null;
    if (Array.isArray(route)) end = route[route.length - 1];
    else if (route?.getTotalLength) {
      const pt = route.getPointAtLength(route.getTotalLength());
      end = [pt.x, pt.y];
    }
    if (end) feldPuls(end[0], end[1], 0.8, 70, packetEl);
  }, null, `${label}+=${duration}`);
  if (fadeOut) tl.to(els, { autoAlpha: 0, scale: 0.5, duration: 0.2, ease: 'power1.in' }, `${label}+=${duration}`);
  return tl;
}

/**
 * Knoten „wartet“ / „arbeitet“: Statuslampe blinkt im Takt (kein Hüpfen) – endlich oft,
 * damit die Timeline endlich bleibt. Ohne Lampe (z. B. Kreis) blinkt die Deckkraft leicht.
 */
export function pulse(tl, el, { times = 3, duration = 0.42, pos } = {}) {
  const t = list(el);
  if (!t.length) return tl;
  return tl.fromTo(t, { '--blink': 1 }, { '--blink': 0.15, duration, yoyo: true, repeat: times * 2 - 1, ease: 'steps(1)' }, pos);
}

/**
 * Ausfall: Lampe → rot, Rahmen gestrichelt, zwei Frames Zittern (±3 px), Feld-Puls.
 * Im Monolith breitet sich Rot über die Rasterpunkte aus (Ursprung: from = ['80%', '70%']).
 * Rückwärts wieder gesund.
 */
export function fail(tl, nodeEls, { duration = 0.35, pos, from, jitter = true } = {}) {
  const t = list(nodeEls);
  if (!t.length) return tl;
  const label = uid('fail');
  tl.addLabel(label, pos);
  if (from) tl.set(t, { '--fx': from[0], '--fy': from[1] }, label);
  tl.fromTo(t, { '--down': 0 }, { '--down': 1, duration, ease: 'power2.out' }, label);
  t.forEach((el) => {
    const isBlock = el.classList.contains('monolith');
    if (jitter && !isBlock) {
      // zwei Frames Zittern, relativ zur aktuellen Lage (Knoten können schon verschoben sein)
      tl.to(el, { keyframes: [{ x: '+=3' }, { x: '-=6' }, { x: '+=5' }, { x: '-=2' }], duration: DUR.d1, ease: 'steps(1)' }, label);
    }
    tl.call(() => {
      const p = stagePoint(el);
      if (p) feldPuls(p[0], p[1], isBlock ? 1.2 : 1, isBlock ? 160 : 110, el);
    }, null, label);
  });
  return tl;
}

/** Service-Farbe → Monolith-Grau (Knoten fügen sich wieder zum Block). */
export function decolorize(tl, nodeEls, { duration = 0.9, pos, stagger = 0 } = {}) {
  return tl.fromTo(list(nodeEls), { '--mono': 0 }, { '--mono': 1, duration, stagger, ease: 'power2.inOut' }, pos);
}

/** Monolith-Grau → Service-Farbe. */
export function colorize(tl, nodeEls, { duration = 0.9, pos, stagger = 0 } = {}) {
  return tl.fromTo(list(nodeEls), { '--mono': 1 }, { '--mono': 0, duration, stagger, ease: 'power2.inOut' }, pos);
}

/** Fortschrittsbalken (ds.meter) füllt sich – z. B. ein Release, das durch den ganzen Block läuft. */
export function fill(tl, meterEls, { to = 1, duration = 1.2, pos, ease = 'power1.inOut' } = {}) {
  return tl.fromTo(list(meterEls), { '--f': 0 }, { '--f': to, duration, ease }, pos);
}

/** Zahl zählt hoch (Element mit data-count). Im Druck steht der Endwert. */
export function countUp(tl, el, { from = 0, duration = 1.2, pos } = {}) {
  const to = Number(el.dataset.count);
  const obj = { v: from };
  const fmt = (v) => Math.round(v).toLocaleString('de-DE');
  el.textContent = fmt(from); // vor dem Hochzählen steht der Startwert (Druck: progress(1) → Endwert)
  return tl.fromTo(obj, { v: from }, { v: to, duration, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(obj.v)) }, pos);
}

/** Alter Name für select(): Markierungen im Zitat nacheinander setzen. */
export const underline = (tl, marks, opts) => select(tl, marks, opts);

/**
 * Sofort-Wechsel (Klasse, Attribut) – umkehrbar. Liegt bewusst minimal NACH der Position,
 * damit er nicht schon zum Endzustand des vorherigen Schritts zählt (Sprungmarke = gleiche Zeit).
 */
export function swap(tl, targets, vars, pos = '<0.02') {
  const t = list(targets);
  return t.length ? tl.set(t, vars, pos) : tl;
}

/** Umschalter-Zustand (aria-pressed) an einen Schritt binden – umkehrbar. */
export function pressToggle(tl, toggleEl, index, { pos = '<0.02' } = {}) {
  const label = `toggle${Math.random().toString(36).slice(2, 7)}`;
  tl.addLabel(label, pos);
  [...toggleEl.querySelectorAll('button')].forEach((b, i) => tl.set(b, { attr: { 'aria-pressed': String(i === index) } }, label));
  return tl;
}

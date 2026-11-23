// ─────────────────────────────────────────────────────────────────────────────
//  KLARTEXT · Bausteine als HTML-String-Funktionen (ohne Framework, ohne Abhängigkeiten).
//  Gehört zu klartext.css. Jede Funktion liefert einen HTML-String.
//  Akzente: ak 'a' = Hellblau · 'b' = invertiert · 'c' = Grün. Fehler über tone 'error' / Zustand --down.
//  Positionen x/y sind optional (nur für absolut positionierte Diagramme, z. B. auf einem 24-px-Raster).
// ─────────────────────────────────────────────────────────────────────────────
import { icons } from './icons.js';

export const GRID = 24;
/** n Rasterschritte in px – Diagramme liegen auf den Zellen des Felds. */
export const g = (n) => n * GRID;

export const esc = (t = '') =>
  String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pos = (x, y) => (x === undefined ? '' : `position:absolute;left:${x}px;top:${y}px;`);
const ak = (a) => (a ? `ak-${a}` : '');
const cls = (...c) => c.filter(Boolean).join(' ');
const st = (s) => (s ? ` style="${s}"` : '');

/** Knotengrößen [Breite, Höhe] – für Ankerpunkte von Leitungen. */
export const NODE = { sm: [228, 80], md: [300, 104], lg: [384, 128] };
/** Ankerpunkt an einem Kasten: side = 'c' | 'l' | 'r' | 't' | 'b'. */
export function anchor({ x, y, w, h }, side = 'c') {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return { c: [cx, cy], l: [x, cy], r: [x + w, cy], t: [cx, y], b: [cx, y + h] }[side];
}
export const nodeAnchor = (x, y, size = 'md', side = 'c') => anchor({ x, y, w: NODE[size][0], h: NODE[size][1] }, side);

/**
 * Knoten (Prozess, Service, Modul): Rahmen mit Eckquadraten, Kennung auf der oberen Linie, Statuslampe.
 * Zustände: style="--down:1" (ausgefallen) · "--mono:1" (grau, noch ungeteilt) · motion.pulse lässt die Lampe blinken.
 */
export function node(name, { ak: a, icon, tag, sub = '', size = 'md', x, y, extra = '' } = {}) {
  return `<div class="${cls('node fr', `node--${size}`, ak(a), extra)}"${st(pos(x, y))}>
    ${tag ? `<span class="node__tag" aria-hidden="true">${esc(tag)}</span>` : ''}
    ${icon ? `<span class="node__chip">${icons[icon] || ''}</span>` : ''}
    <span>${esc(name)}${sub ? `<span class="node__sub">${esc(sub)}</span>` : ''}</span>
  </div>`;
}

/** Block (ungeteiltes Ganzes, z. B. Monolith): Halbton-Raster, Beschriftung auf der Rahmenlinie. --down färbt ihn rot. */
export function block({ label = '', x, y, w, h, extra = '' } = {}) {
  return `<div class="${cls('monolith fr', extra)}" style="${pos(x, y)}${w ? `width:${w}px;` : ''}${h ? `height:${h}px;` : ''}">${
    label ? `<span class="monolith__label label-mono">${esc(label)}</span>` : ''
  }</div>`;
}

/** Spec-Rahmen (statt Karte). num nur, wo die Reihenfolge zählt. tone: 'akzent' (mit ak) | 'error' | 'quiet'. */
export function card({ num, label = '', icon, title = '', text = '', tone, ak: a, extra = '' } = {}) {
  return `<div class="${cls('card fr', tone && `card--${tone}`, ak(a), extra)}">
    ${num ? `<span class="card__num">${esc(num)}</span>` : ''}
    ${label ? `<span class="card__label">${icon ? icons[icon] : ''}${esc(label)}</span>` : ''}
    ${title ? `<h3 class="card__title">${esc(title)}</h3>` : ''}
    ${text ? `<p class="card__text">${esc(text)}</p>` : ''}
  </div>`;
}

/** Freier konstruierter Rahmen mit beliebigem Inhalt (inner = HTML). */
export function frame({ inner = '', x, y, w, h, tone, ak: a, extra = '' } = {}) {
  return `<div class="${cls('frame fr', tone && `fr--${tone}`, ak(a), extra)}" style="${pos(x, y)}${w ? `width:${w}px;` : ''}${h ? `height:${h}px;` : ''}">${inner}</div>`;
}

/** Tag / Plakette: Mono-Versalien im 1-px-Rahmen. tone: 'error' | 'akzent' (Lampe davor, mit ak). */
export function badge(text, { tone, icon, ak: a, extra = '' } = {}) {
  return `<span class="${cls('badge', tone && `badge--${tone}`, ak(a), extra)}">${icon ? icons[icon] : ''}${esc(text)}</span>`;
}

/** Terminal: lines = HTML-Zeilen (aus eigenem Code), Auszeichnung mit <span class="pr|ok|er|bl">. */
export function terminal({ title = 'Terminal', lines = [], extra = '' } = {}) {
  return frame({
    extra: `terminal ${extra}`,
    inner: `<div class="terminal__head"><span>${esc(title)}</span></div>${lines.map((l, i) => `<span class="terminal__ln" data-ln="${i}">${l}</span>`).join('')}`,
  });
}

/** Tick-Lineal (Fortschritt): Füllung über style="--f:0.4" bzw. motion.fill(). */
export function ticks({ label = '', w = 480, ak: a, f = 0, extra = '' } = {}) {
  return `<div class="${cls('meter', ak(a), extra)}" style="width:${w}px;--f:${f}">${
    label ? `<span class="label-mono">${esc(label)}</span>` : ''
  }<span class="meter__track"><i></i></span></div>`;
}

/** Kennzahl: Mono dünn. start → value zeigt eine Entwicklung. */
export function stat({ start, value, suffix = '', label = '', extra = '' } = {}) {
  const num = (v) => Number(v).toLocaleString('de-DE');
  return `<div class="${cls('stat', extra)}">
    <div class="stat__value">${start !== undefined ? `<span>${esc(num(start))}</span>${icons.pfeil}` : ''}<span><span data-count="${value}">${num(value)}</span>${esc(suffix)}</span></div>
    ${label ? `<div class="stat__label">${esc(label)}</div>` : ''}
  </div>`;
}

/** Zitat: Schlüsselbegriffe in [[…]] werden wie im Editor markiert (motion.select). */
export function quote({ text, src = '', extra = '' } = {}) {
  const html = esc(text).replace(/\[\[(.+?)\]\]/g, '<span class="mark">$1</span>');
  return `<blockquote class="${cls('quote', extra)}"><span class="quote__text">${html}</span>${src ? `<cite class="quote__src">${esc(src)}</cite>` : ''}</blockquote>`;
}

/** Leitsatz: html darf <em> enthalten (gedämpfter Teil). */
export const statement = (html, extra = '') => `<p class="${cls('statement', extra)}">${html}</p>`;

/** Tabelle: Kopf in Meta-Schrift, Zeilen durch Haarlinien getrennt. */
export function table({ head = [], rows = [], extra = '' } = {}) {
  return `<table class="${cls('ds-table', extra)}">
    ${head.length ? `<thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : ''}
    <tbody>${rows.map((r, i) => `<tr data-row="${i}">${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

/** Umschalter: Segmente in Mono, aktives Segment invertiert. */
export function toggle(options = [], { active = 0, label = 'Ansicht wählen', extra = '' } = {}) {
  return `<div class="${cls('toggle', extra)}" role="group" aria-label="${esc(label)}">${options
    .map((o, i) => `<button type="button" aria-pressed="${i === active}">${esc(o)}</button>`)
    .join('')}</div>`;
}

/** Team / Gruppe: Kästchen A1 A2 A3 mit Lampe in Akzentfarbe. */
export function team({ letter = 'A', n = 3, label = '', ak: a, extra = '' } = {}) {
  return `<div class="${cls('team', ak(a), extra)}"><span class="team__people">${Array.from({ length: n }, (_, i) => `<b class="team__member">${esc(letter + (i + 1))}</b>`).join('')}</span>${
    label ? `<span class="team__label">${esc(label)}</span>` : ''
  }</div>`;
}

// ── Diagramm-Teile ──────────────────────────────────────────────────────────
const DB_GLYPH = {
  tabelle: '<path class="db-glyph" d="M48.6 8.7L23.4 21.3M60.6 14.7L35.4 27.3M29.4 11.7L54.6 24.3"/>',
  dokument: '<path class="db-glyph" d="M38.4 9L60 19.8M31.2 12.6L52.8 23.4M24 16.2L38.4 23.4"/>',
  schluessel: '<path class="db-glyph" d="M34.8 10.8L42 14.4L34.8 18L27.6 14.4ZM40.2 17.1L54.6 24.3"/>',
  leer: '',
};
const plate = (o) =>
  `<path class="db-body" d="M42 ${o} L78 ${18 + o} L42 ${36 + o} L6 ${18 + o} Z M6 ${18 + o} V${26 + o} L42 ${44 + o} L78 ${26 + o} V${18 + o} M42 ${36 + o} V${44 + o}"/>`;
/** Speicher (isometrisch, drei Platten). kind: 'tabelle' | 'dokument' | 'schluessel' | 'leer'. */
export function db({ kind = 'leer', label = '', ak: a, x, y, extra = '' } = {}) {
  return `<div class="${cls('db', `db--${kind}`, ak(a), extra)}"${st(pos(x, y))}><svg viewBox="0 0 84 74" aria-hidden="true">${plate(28)}${plate(14)}${plate(0)}${DB_GLYPH[kind] || ''}</svg>${
    label ? `<span class="db__label">${esc(label)}</span>` : ''
  }</div>`;
}

/** Paket (Nachricht): 'request' = Quadrat, 'event' = Raute. Position per transform (motion.travel). */
export const packet = ({ kind = 'request', ak: a, extra = '' } = {}) =>
  `<div class="${cls('packet', kind === 'event' && 'packet--event', ak(a), extra)}" style="position:absolute;left:0;top:0"></div>`;

/** Queue: Fächerreihe, filled = belegte Fächer. */
export function queue({ slots = 4, filled = 0, ak: a, label = 'Queue', extra = '' } = {}) {
  const s = Array.from({ length: slots }, (_, i) => `<span class="queue__slot ${i < filled ? 'is-filled' : ''}"></span>`).join('');
  return `<div class="${cls('queue', ak(a), extra)}"><div class="queue__box">${s}</div>${label ? `<span class="label-mono">${esc(label)}</span>` : ''}</div>`;
}

/** SVG-Ebene für Leitungen (w × h in px, Standard 1920 × 1080). */
export const wires = (inner, { w = 1920, h = 1080, extra = '' } = {}) =>
  `<svg class="${cls('wires', extra)}" viewBox="0 0 ${w} ${h}" style="position:absolute;inset:0;width:${w}px;height:${h}px;overflow:visible;pointer-events:none" aria-hidden="true">${inner}</svg>`;

/** Leitung: kind 'sync' (durchgezogen) | 'async' (gestrichelt, fließt). live = aktiv in Akzentfarbe, error = rot. */
export function wire(points, { kind = 'sync', live = false, ak: a, error = false, head = false, curve = false, extra = '' } = {}) {
  let d;
  let tangent;
  if (curve && points.length === 2) {
    const [[x1, y1], [x2, y2]] = points;
    const mx = (x1 + x2) / 2;
    d = `M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    tangent = [[mx, y2], [x2, y2]];
  } else {
    d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
    tangent = points.slice(-2);
  }
  let h = '';
  if (head) {
    const [[ax, ay], [bx, by]] = tangent;
    const an = Math.atan2(by - ay, bx - ax);
    const p1 = [bx - 16 * Math.cos(an) + 8 * Math.sin(an), by - 16 * Math.sin(an) - 8 * Math.cos(an)];
    const p2 = [bx - 16 * Math.cos(an) - 8 * Math.sin(an), by - 16 * Math.sin(an) + 8 * Math.cos(an)];
    h = `<path class="${cls('wire-head', live && 'wire-head--live', ak(a))}" d="M${bx} ${by} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)} Z"/>`;
  }
  return `<path class="${cls('wire', kind === 'async' && 'wire--async', live && 'wire--live', error && 'wire--error', ak(a), extra)}" d="${d}"/>${h}`;
}

export { icons };

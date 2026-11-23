// ─────────────────────────────────────────────────────────────────────────────
//  Design-System „Klartext“ – HTML-Bausteine. Jede Funktion liefert einen HTML-String.
//  Positionen (x, y) sind Bühnenkoordinaten in px (Szene 1920×1080); Diagramme liegen
//  auf dem 24-px-Raster (= Zellen des Felds) → g(n) = n Rasterschritte.
//  Rahmen sind „konstruiert“ (Klasse .fr: Eckquadrate + Haarlinien, motion.construct baut sie auf).
//  Doku: DESIGN_KLARTEXT.md, Abschnitt 6.
// ─────────────────────────────────────────────────────────────────────────────
import qrcode from 'qrcode-generator';
import { icons, services } from './icons.js';

export const GRID = 24;
/** n Rasterschritte in px (Diagramme liegen auf den Punkten des Hintergrunds). */
export const g = (n) => n * GRID;

export const esc = (t = '') =>
  String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const pos = (x, y) => (x === undefined ? '' : `left:${x}px;top:${y}px;`);
const attrs = (o = {}) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
    .join(' ');

/** Knotengrößen [Breite, Höhe] – für Ankerpunkte von Leitungen. */
export const NODE = { sm: [228, 80], md: [300, 104], lg: [384, 128] };

/** Ankerpunkt an einem Kasten: side = 'c' | 'l' | 'r' | 't' | 'b'. */
export function anchor({ x, y, w, h }, side = 'c') {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return { c: [cx, cy], l: [x, cy], r: [x + w, cy], t: [cx, y], b: [cx, y + h] }[side];
}
/** Ankerpunkt eines Knotens. */
export const nodeAnchor = (x, y, size = 'md', side = 'c') => anchor({ x, y, w: NODE[size][0], h: NODE[size][1] }, side);

// ── Service-Knoten ───────────────────────────────────────────────────────────
/**
 * @param {'bestellung'|'zahlung'|'versand'|'monolith'} key
 * @param {{x?:number,y?:number,size?:'sm'|'md'|'lg',sub?:string,badge?:string,badgeTone?:'error'|'svc',
 *          mono?:boolean,flip?:boolean,label?:string,cls?:string,step?:number}} o
 */
export function node(key, o = {}) {
  const { x, y, size = 'md', sub = '', badge: b = '', badgeTone, mono = false, flip = true, cls = '', step } = o;
  const s = services.find((v) => v.key === key);
  const name = o.label ?? s?.name ?? 'Monolith';
  const svc = s ? `svc-${key}` : '';
  return `<div ${attrs({
    class: `node fr node--${size} ${svc} ${mono ? 'node--mono' : ''} ${cls}`.replace(/\s+/g, ' ').trim(),
    style: `${pos(x, y)}${mono ? '--mono:1;' : ''}`,
    'data-node': key,
    'data-flip': flip && s ? `svc-${key}` : undefined,
    'data-step': step,
  })}>
    <span class="node__tag" aria-hidden="true">${s ? `svc/${s.team}` : 'modul'}</span>
    <span class="node__chip">${icons[key] || icons.monolith}</span>
    <span>${esc(name)}${sub ? `<span class="node__sub">${esc(sub)}</span>` : ''}</span>
    ${b ? badge(b, { tone: badgeTone }) : ''}
  </div>`;
}

/** Grauer Rahmen „Onlineshop · ein Deployment“. */
export function monolithFrame({ x, y, w, h, label = 'Onlineshop · ein Deployment', cls = '' } = {}) {
  return `<div class="monolith fr ${cls}" style="${pos(x, y)}width:${w}px;height:${h}px"><span class="monolith__label label-mono">${esc(label)}</span></div>`;
}

/** Tick-Lineal (Release läuft, Kopie synchronisiert …). Füllung über --f 0…1 → motion.fill(). */
export function meter({ x, y, w = 480, label = '', svc, cls = '' } = {}) {
  return `<div class="meter ${svc ? `svc-${svc}` : ''} ${cls}" style="${pos(x, y)}width:${w}px">${
    label ? `<span class="meter__label label-mono">${esc(label)}</span>` : ''
  }<span class="meter__track"><i></i></span></div>`;
}

// ── Plakette ────────────────────────────────────────────────────────────────
/** Plakette. center: x ist die Mitte statt der linken Kante. */
export function badge(text, { tone, icon, svc, x, y, center = false, cls = '' } = {}) {
  const t = tone ? `badge--${tone}` : '';
  const st = `${pos(x, y)}${center ? 'translate:-50% 0;' : ''}`;
  return `<span class="badge ${t} ${svc ? `svc-${svc}` : ''} ${cls}" ${st ? `style="${st}"` : ''}>${
    icon ? icons[icon] : ''
  }${esc(text)}</span>`;
}

// ── Datenbank ───────────────────────────────────────────────────────────────
// Isometrische Speicherplatten; die oberste trägt das Speichermodell:
// Tabelle = Raster · Dokument = Zeilen · Schlüssel-Wert = Schlüssel mit Bart · leer = gestrichelt
const DB_GLYPH = {
  tabelle: '<path class="db-glyph" d="M48.6 8.7L23.4 21.3M60.6 14.7L35.4 27.3M29.4 11.7L54.6 24.3"/>',
  dokument: '<path class="db-glyph" d="M38.4 9L60 19.8M31.2 12.6L52.8 23.4M24 16.2L38.4 23.4"/>',
  schluessel: '<path class="db-glyph" d="M34.8 10.8L42 14.4L34.8 18L27.6 14.4ZM40.2 17.1L54.6 24.3"/>',
  leer: '',
};
const plate = (o) =>
  `<path class="db-body" d="M42 ${o} L78 ${18 + o} L42 ${36 + o} L6 ${18 + o} Z M6 ${18 + o} V${26 + o} L42 ${44 + o} L78 ${26 + o} V${18 + o} M42 ${36 + o} V${44 + o}"/>`;
export function db({ x, y, svc, kind = 'leer', label = '', cls = '', flip } = {}) {
  return `<div ${attrs({
    class: `db db--${kind} ${svc ? `svc-${svc}` : ''} ${cls}`.trim(),
    style: pos(x, y) || undefined,
    'data-flip': flip,
  })}>
    <svg viewBox="0 0 84 74" aria-hidden="true">${plate(28)}${plate(14)}${plate(0)}${DB_GLYPH[kind] || ''}</svg>
    ${label ? `<span class="db__label">${esc(label)}</span>` : ''}
  </div>`;
}

// ── Paket, Queue ────────────────────────────────────────────────────────────
/** Paket (Nachricht). Position über GSAP x/y (Mittelpunkt). kind: 'request' (Quadrat) | 'event' (Raute). */
export function packet({ svc, kind = 'request', cls = '' } = {}) {
  return `<div class="packet ${kind === 'event' ? 'packet--event' : ''} ${svc ? `svc-${svc}` : ''} ${cls}" style="left:0;top:0"></div>`;
}
/** Beschriftung, die einem Paket folgt (gleiche x/y-Animation wie das Paket). */
export const packetLabel = (text, cls = '') => `<div class="packet-label ${cls}" style="left:0;top:0">${esc(text)}</div>`;

export function queue({ x, y, slots = 4, filled = 0, svc, label = 'Queue', cls = '' } = {}) {
  const s = Array.from({ length: slots }, (_, i) => `<span class="queue__slot ${i < filled ? 'is-filled' : ''}"></span>`).join('');
  return `<div class="queue ${svc ? `svc-${svc}` : ''} ${cls}" style="${pos(x, y)}"><div class="queue__box">${s}</div>${
    label ? `<span class="label-mono" style="font-size:15px">${esc(label)}</span>` : ''
  }</div>`;
}

// ── Leitungen (SVG) ─────────────────────────────────────────────────────────
/** SVG-Ebene für Leitungen in Bühnenkoordinaten. */
export const wires = (inner, cls = '') => `<svg class="wires ${cls}" viewBox="0 0 1920 1080" aria-hidden="true">${inner}</svg>`;

/**
 * Leitung als SVG-Pfad.
 * points: [[x,y], …] (Gerade/Polylinie) oder mit curve:true zwei Punkte als weiche S-Kurve.
 * kind: 'sync' (durchgezogen) | 'async' (gestrichelt) · live: in Service-Farbe leuchtend · head: Pfeilspitze am Ende
 */
export function wire(points, { kind = 'sync', live = false, svc, error = false, head = false, curve = false, cls = '' } = {}) {
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
  const c = ['wire', kind === 'async' && 'wire--async', live && 'wire--live', error && 'wire--error', svc && `svc-${svc}`, cls]
    .filter(Boolean)
    .join(' ');
  let h = '';
  if (head) {
    const [[ax, ay], [bx, by]] = tangent;
    const a = Math.atan2(by - ay, bx - ax);
    const L = 16;
    const W = 8;
    const p1 = [bx - L * Math.cos(a) + W * Math.sin(a), by - L * Math.sin(a) - W * Math.cos(a)];
    const p2 = [bx - L * Math.cos(a) - W * Math.sin(a), by - L * Math.sin(a) + W * Math.cos(a)];
    h = `<path class="wire-head ${live ? 'wire-head--live' : ''} ${svc ? `svc-${svc}` : ''} ${cls ? `${cls}-head` : ''}" d="M${bx} ${by} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)} Z"/>`;
  }
  return `<path class="${c}" d="${d}"/>${h}`;
}

/** Legende: durchgezogen = synchron, gestrichelt = asynchron, rot = Ausfall. */
export function legend({ error = true, cls = '' } = {}) {
  const sample = (k, e) => `<svg viewBox="0 0 64 12"><path class="wire ${k === 'async' ? 'wire--async' : ''} ${e ? 'wire--error' : ''}" d="M2 6H62"/></svg>`;
  return `<div class="legend ${cls}">
    <span>${sample('sync')}synchron</span>
    <span>${sample('async')}asynchron</span>
    ${error ? `<span>${sample('sync', true)}Ausfall</span>` : ''}
  </div>`;
}

// ── Team ────────────────────────────────────────────────────────────────────
export function team({ svc, n = 3, label = '', x, y, center = false, cls = '' } = {}) {
  const st = `${pos(x, y)}${center ? 'translate:-50% 0;' : ''}`;
  return `<div class="team ${svc ? `svc-${svc}` : ''} ${cls}" ${st ? `style="${st}"` : ''}>
    <span class="team__people">${Array.from({ length: n }, (_, i) => `<b class="team__member">${esc((services.find((v) => v.key === svc)?.team || '') + (i + 1))}</b>`).join('')}</span>${label ? `<span class="team__label">${esc(label)}</span>` : ''}
  </div>`;
}

// ── Inhalte ─────────────────────────────────────────────────────────────────
/** Karte. tone: 'svc' (mit svc) | 'error' | 'quiet' | undefined */
export function card({ num, label = '', icon, title = '', text = '', tone, svc, cls = '', step } = {}) {
  const t = [tone && `card--${tone}`, svc && `svc-${svc}`, cls].filter(Boolean).join(' ');
  return `<div ${attrs({ class: `card fr ${t}`.trim(), 'data-step': step })}>
    ${num ? `<span class="card__num">${esc(num)}</span>` : ''}
    ${label ? `<span class="card__label">${icon ? icons[icon] : ''}${esc(label)}</span>` : ''}
    ${title ? `<h3 class="card__title">${esc(title)}</h3>` : ''}
    ${text ? `<p class="card__text">${esc(text)}</p>` : ''}
  </div>`;
}

/** Tabelle. rows: Array von Zeilen (Array von Zellen). Zeilen bekommen data-row="i" für den schrittweisen Aufbau. */
export function table({ head = [], rows = [], cls = '', rowStep } = {}) {
  return `<table class="ds-table ${cls}">
    ${head.length ? `<thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : ''}
    <tbody>${rows
      .map(
        (r, i) =>
          `<tr ${attrs({ 'data-row': i, 'data-step': rowStep ? rowStep(i) : undefined })}>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`
      )
      .join('')}</tbody>
  </table>`;
}

/** Zitat. Schlüsselbegriffe im Text mit [[…]] – sie werden nacheinander markiert wie im Editor (motion.select). */
export function quote({ text, src = '', svc, cls = '' } = {}) {
  const html = esc(text).replace(/\[\[(.+?)\]\]/g, '<span class="mark">$1</span>');
  return `<blockquote class="quote ${svc ? `svc-${svc}` : ''} ${cls}"><span class="quote__text">${html}</span>${
    src ? `<cite class="quote__src">${esc(src)}</cite>` : ''
  }</blockquote>`;
}

/** Kennzahl: optional Startwert → Zielwert (Zielwert zählt hoch). */
export function stat({ start, value, suffix = '', label = '', cls = '', step } = {}) {
  const num = (v) => Number(v).toLocaleString('de-DE');
  return `<div ${attrs({ class: `stat ${cls}`.trim(), 'data-step': step })}>
    <div class="stat__value">${start !== undefined ? `<span>${esc(num(start))}</span>${icons.pfeil}` : ''}<span><span data-count="${value}">${num(
      value
    )}</span>${esc(suffix)}</span></div>
    ${label ? `<div class="stat__label">${esc(label)}</div>` : ''}
  </div>`;
}

/** Leitsatz (roter Faden). html darf <em> enthalten (gedämpfter Teil). */
export const statement = (html, cls = '') => `<p class="statement ${cls}">${html}</p>`;

/** Umschalter: Klick springt zum angegebenen Schritt der Folie (data-goto-step). */
export function toggle(options = [], { cls = '', label = 'Ansicht wählen' } = {}) {
  return `<div class="toggle ${cls}" role="group" aria-label="${esc(label)}">${options
    .map((o, i) => `<button type="button" data-goto-step="${o.step}" data-toggle-index="${i}" aria-pressed="${i === 0}">${esc(o.label)}</button>`)
    .join('')}</div>`;
}

/**
 * QR-Code als SVG (offline erzeugt). Ohne url erscheint ein gestrichelter Platzhalter.
 * Immer dunkle Module auf weißer Fläche – in beiden Themes scanbar. Darunter „scan_“ mit Cursor.
 */
export function qr(url, { size = 320, cls = '' } = {}) {
  if (!url) {
    return `<div class="qr fr qr--empty ${cls}" style="width:${size}px;height:${size}px"><span class="label-mono">QR-Code folgt</span></div>`;
  }
  const q = qrcode(0, 'M');
  q.addData(url);
  q.make();
  const n = q.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return `<div class="qr fr ${cls}" style="width:${size}px;height:${size}px" role="img" aria-label="QR-Code: ${esc(url)}">
    <svg viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges"><path d="${d}" fill="#0c0c0d"/></svg><span class="qr__scan">scan</span>
  </div>`;
}

// ── Neue Bausteine „Klartext“ ───────────────────────────────────────────────
/** Konstruierter Rahmen in Bühnenkoordinaten. inner: HTML. tone: 'svc' | 'error' | 'quiet'. */
export function frame({ x, y, w, h, inner = '', tone, svc, cls = '', step } = {}) {
  const t = [tone && `fr--${tone}`, svc && `svc-${svc}`, cls].filter(Boolean).join(' ');
  return `<div ${attrs({ class: `frame fr ${t}`.trim(), style: `${pos(x, y)}${w ? `width:${w}px;` : ''}${h ? `height:${h}px;` : ''}` || undefined, 'data-step': step })}>${inner}</div>`;
}

/**
 * Terminal: Kopfzeile + Zeilen. lines: Array aus HTML-Zeilen (aus dem Code, nicht aus Inhalten),
 * Auszeichnung mit <span class="pr|ok|er|bl">. Zeilen tragen data-ln="i" (motion.typeLines).
 */
export function terminal({ x, y, w, h, title = 'Terminal', lines = [], cls = '' } = {}) {
  return frame({
    x, y, w, h,
    cls: `terminal ${cls}`,
    inner: `<div class="terminal__head"><span>${esc(title)}</span></div>${lines.map((l, i) => `<span class="terminal__ln" data-ln="${i}">${l}</span>`).join('')}`,
  });
}

/** Tick-Lineal: n Striche, gefüllt bis --f (0…1); Wert rechts in Mono. */
export function ticks({ x, y, w = 480, label = '', svc, cls = '' } = {}) {
  return meter({ x, y, w, label, svc, cls });
}

export const vlTag = (t) => `<span class="vl-tag">${esc(t)}</span>`;
export { icons, services };

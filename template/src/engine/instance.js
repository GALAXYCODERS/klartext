import { gsap } from 'gsap';
import { meta, slides as allSlides } from '../../content/slides.js';
import { modules } from '../slides/index.js';
import { appear, type } from '../lib/motion.js';

const esc = (t = '') => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const pad2 = (n) => String(n).padStart(2, '0');

/** Minuten-Lineal: 45 Striche = 45 Minuten; abgelaufen = geplante Zeit bis zum Ende dieser Folie. */
function ticksHTML(s, index) {
  if (!s.teil) return '';
  const total = meta.dauerMinuten;
  const done = Math.min(total, Math.round(allSlides.slice(0, index + 1).reduce((a, x) => a + (x.minuten || 0), 0)));
  const cuts = new Set();
  meta.teile.reduce((a, t) => (cuts.add(a + t.minuten), a + t.minuten), 0);
  const teil = meta.teile.find((t) => t.id === s.teil);
  const ticks = Array.from({ length: total }, (_, i) => {
    const c = [i < done && 'is-done', cuts.has(i + 1) && i + 1 < total && 'is-cut'].filter(Boolean).join(' ');
    return `<i${c ? ` class="${c}"` : ''}></i>`;
  });
  return `<div class="ticks" data-flip="progress" role="img" aria-label="${esc(`${teil?.label}: Minute ${done} von ${total}`)}">${ticks.join('')}</div>`;
}

function chromeHTML(s, index) {
  if (s.chrome === false) return '<div class="slide-body"></div>';
  const vl = (s.vl || []).map((t) => `<span class="vl-tag">${esc(t)}</span>`).join('');
  const teil = meta.teile.find((t) => t.id === s.teil);
  // Lange Titel laufen in schmalerer Breite statt kleiner (Martian Mono 87,5 %)
  const schmal = (s.titel || '').length > 30 ? ' slide-title--schmal' : '';
  return `
    <header class="slide-head">
      <span class="meta-brand">${esc(meta.titel)}</span>
      <span class="meta-chapter">${esc(s.kicker || '')}</span>
      <span class="meta-pos">${teil ? `Teil ${teil.nummer} · ` : ''}<b>${pad2(index + 1)}</b>/${pad2(allSlides.length)}</span>
    </header>
    <div class="slide-header">
      ${s.titel ? `<h1 class="slide-title${schmal}">${esc(s.titel)}</h1>` : ''}
    </div>
    <div class="slide-body"></div>
    <footer class="slide-footer">
      <div class="foot-src">
        ${vl ? `<div class="vl-tags" aria-label="Bezüge">${vl}</div>` : ''}
        ${s.quelle ? `<div class="quelle"><span class="quelle-label">Quelle</span>${esc(s.quelle)}</div>` : ''}
      </div>
      ${ticksHTML(s, index)}
    </footer>`;
}

/** Standard-Aufbau: Elemente mit data-step="n" erscheinen im Schritt n. */
function defaultBuild(ctx) {
  const nums = [...ctx.el.querySelectorAll('[data-step]')].map((e) => +e.dataset.step);
  const max = nums.length ? Math.max(...nums) : 0;
  for (let n = 0; n <= max; n++) {
    ctx.fragments(n);
    ctx.step();
  }
}

/**
 * Baut eine Folie: DOM + pausierte Timeline mit Sprungmarken s0, s1, … (eine pro Schritt).
 * Schritt 0 = Einstieg (läuft automatisch beim Betreten), jeder Klick spielt bis zur nächsten Marke.
 */
export function createInstance(s, index, { reduced = false } = {}) {
  const el = document.createElement('section');
  el.className = `slide slide--${s.id}${s.chrome === false ? ' slide--nochrome' : ''}${s.invert ? ' theme-invert' : ''}${s.feld === 'aus' ? ' feld-aus' : ''}`;
  el.dataset.index = String(index);
  el.setAttribute('aria-roledescription', 'Folie');
  el.setAttribute('aria-label', `Folie ${index + 1}${s.titel ? `: ${s.titel}` : ''}`);
  el.innerHTML = chromeHTML(s, index);

  const body = el.querySelector('.slide-body');
  const mod = modules[s.modul] || {};
  if (mod.render) body.innerHTML = mod.render(s, { meta, esc });
  else if (s.html) body.innerHTML = s.html;
  else if (s.tasten) {
    body.innerHTML = `<div class="keys">${s.tasten
      .map(([k, v], i) => `<div data-step="${i < 4 ? 0 : i < 7 ? 1 : 2}"><kbd>${esc(k)}</kbd><span>${esc(v)}</span></div>`)
      .join('')}</div>`;
  }

  // Szenen (Diagramme) liegen in Bühnenkoordinaten direkt auf der Folie – unabhängig von der Titelhöhe.
  body.querySelectorAll(':scope > .scene').forEach((sc) => el.insertBefore(sc, el.firstChild));

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', duration: 0.6 } });
  let n = 0;
  const q = (sel) => [...el.querySelectorAll(sel)];
  // Zustand, den die Folie über ihre Timeline an das Feld gibt (z. B. Maske 1 → 0)
  const feldState = { mask: 1 };
  const ctx = {
    feldState,
    el,
    body,
    s,
    tl,
    meta,
    reduced,
    q,
    q1: (sel) => el.querySelector(sel),
    /** Schritt abschließen: setzt Sprungmarke s<n> ans aktuelle Ende der Timeline. */
    step() {
      tl.addLabel(`s${n}`);
      n += 1;
    },
    /** Elemente einblenden (8 px von unten, Rahmen konstruieren sich). */
    reveal(targets, vars = {}, pos) {
      const t = typeof targets === 'string' ? q(targets) : targets;
      if (!t || (Array.isArray(t) && !t.length)) return tl;
      return appear(tl, t, { ...vars, pos });
    },
    fragments(k, pos) {
      return ctx.reveal(q(`[data-step="${k}"]`), {}, pos);
    },
  };

  // Beim Betreten der Folie wird der Titel getippt (Teil von Schritt 0): „Hier beginnt ein neuer Befehl.“
  if (s.chrome !== false && s.introHeader !== false) {
    const title = el.querySelector('.slide-title');
    if (title) type(tl, title, { pos: 0.1 });
  }

  (mod.build || defaultBuild)(ctx);
  if (n === 0) ctx.step();

  return {
    el,
    tl,
    s,
    index,
    steps: n,
    feldState,
    labelTime: (k) => tl.labels[`s${Math.max(0, Math.min(n - 1, k))}`] ?? 0,
  };
}

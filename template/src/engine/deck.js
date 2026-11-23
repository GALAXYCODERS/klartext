import { gsap } from 'gsap';
import { slides } from '../../content/slides.js';
import { createInstance } from './instance.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Das Deck hält alle Folien einer Bühne und kennt die Position (Folie + Schritt).
 * mode 'main'   = Vortrag mit Animationen
 * mode 'viewer' = stille Vorschau (Referentenansicht): springt ohne Animation
 */
export class Deck {
  constructor(stage, { mode = 'main', reduced = false, onChange, feld = null } = {}) {
    this.feld = feld;
    this.stage = stage;
    this.mode = mode;
    this.reduced = reduced;
    this.onChange = onChange;
    this.index = 0;
    this.step = 0;
    this.running = [];
    this.instances = slides.map((s, i) => {
      const inst = createInstance(s, i, { reduced });
      inst.el.classList.add('is-hidden');
      inst.el.setAttribute('aria-hidden', 'true');
      stage.appendChild(inst.el);
      return inst;
    });
    this.flipLayer = document.createElement('div');
    this.flipLayer.className = 'flip-layer';
    stage.appendChild(this.flipLayer);
  }

  get total() {
    return this.instances.length;
  }
  get current() {
    return this.instances[this.index];
  }

  /** Laufende Animationen sofort ans Ziel bringen (bei schnellem Weiterklicken). */
  finish() {
    if (this.feld) this.feld.allow = false; // Vorspulen erzeugt keine Feld-Pulse
    const r = this.running;
    this.running = [];
    r.forEach((t) => t.progress(1));
  }

  emit() {
    this.onChange?.({ index: this.index, step: this.step, steps: this.current.steps, total: this.total });
  }

  show(inst) {
    inst.el.classList.remove('is-hidden');
    inst.el.removeAttribute('aria-hidden');
  }
  hide(inst) {
    inst.el.classList.add('is-hidden');
    inst.el.setAttribute('aria-hidden', 'true');
    gsap.set(inst.el, { clearProps: 'opacity,visibility,transform' });
  }

  /** Ohne Animation an eine Position springen (Hash, Übersicht, Zifferneingabe, Vorschau). */
  goto(index, step = 0) {
    this.finish();
    index = clamp(index, 0, this.total - 1);
    const inst = this.instances[index];
    step = clamp(step, 0, inst.steps - 1);
    this.instances.forEach((x) => x !== inst && !x.el.classList.contains('is-hidden') && this.hide(x));
    this.flipLayer.replaceChildren();
    this.show(inst);
    gsap.set(inst.el, { autoAlpha: 1 });
    inst.tl.seek(inst.labelTime(step), false);
    this.feld?.show(inst, 0);
    this.index = index;
    this.step = step;
    this.emit();
  }

  next() {
    this.finish();
    const inst = this.current;
    if (this.step < inst.steps - 1) return this.playStep(this.step + 1);
    if (this.index < this.total - 1) return this.transition(this.index + 1, +1);
  }

  prev() {
    this.finish();
    if (this.step > 0) return this.playStep(this.step - 1);
    if (this.index > 0) return this.transition(this.index - 1, -1);
  }

  /** Innerhalb der Folie zu einem Schritt animieren (rückwärts schneller). */
  playStep(step) {
    const inst = this.current;
    const from = inst.tl.time();
    const to = inst.labelTime(step);
    const back = to < from;
    let dur = Math.abs(to - from);
    if (back) dur = Math.min(dur * 0.45, 0.7);
    this.step = step;
    if (this.feld) this.feld.allow = !back;
    if (this.reduced || dur === 0) inst.tl.seek(to, false);
    else this.running.push(gsap.to(inst.tl, { time: to, duration: dur, ease: 'none' }));
    this.emit();
  }

  /** Folienwechsel: Überblendung + gemeinsame Elemente fliegen an ihre neue Position. */
  transition(toIndex, dir) {
    const out = this.current;
    const inn = this.instances[toIndex];
    const targetStep = dir > 0 ? 0 : inn.steps - 1;
    const targetTime = inn.labelTime(targetStep);

    this.index = toIndex;
    this.step = targetStep;

    if (this.reduced) {
      this.hide(out);
      this.show(inn);
      inn.tl.seek(targetTime, false);
      this.feld?.show(inn, dir);
      this.emit();
      return;
    }

    // Vorwärts: Folie startet am Anfang und spielt ihren Einstieg; rückwärts: Endzustand.
    inn.tl.seek(dir > 0 ? 0 : targetTime, false);
    this.show(inn);
    this.feld?.show(inn, dir);
    if (this.feld) this.feld.allow = dir > 0;
    gsap.set(inn.el, { autoAlpha: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        this.hide(out);
        this.flipLayer.replaceChildren();
      },
    });
    const flights = this.addFlights(tl, out, inn, targetTime);
    // alter Inhalt geht in 0,25 s (4 px hoch), das Feld baut sich als Front neu auf, der neue Titel wird getippt
    tl.to(out.el, { autoAlpha: 0, y: -4, duration: 0.25, ease: 'power2.in' }, 0);
    tl.to(inn.el, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, flights ? 0.1 : 0.18);
    if (dir > 0 && targetTime > 0) {
      tl.to(inn.tl, { time: targetTime, duration: targetTime, ease: 'none' }, flights ? 0.35 : 0.25);
    }
    this.running.push(tl);
    this.emit();
  }

  /**
   * Shared-Element-Übergang (FLIP): Elemente mit gleichem data-flip-Schlüssel auf alter und neuer
   * Folie werden als „Geist“ von der alten zur neuen Position geflogen.
   */
  addFlights(tl, out, inn, innTime) {
    const outEls = new Map([...out.el.querySelectorAll('[data-flip]')].map((e) => [e.dataset.flip, e]));
    const innEls = [...inn.el.querySelectorAll('[data-flip]')].filter((e) => outEls.has(e.dataset.flip));
    if (!innEls.length) return 0;

    const scale = this.stage.getBoundingClientRect().width / 1920 || 1;
    const base = this.stage.getBoundingClientRect();
    const rect = (e) => {
      const r = e.getBoundingClientRect();
      return { x: (r.left - base.left) / scale, y: (r.top - base.top) / scale, w: r.width / scale, h: r.height / scale };
    };

    // Zielposition messen: neue Folie kurz in ihren Zielzustand setzen.
    const startTime = inn.tl.time();
    inn.tl.seek(innTime, false);
    const targets = innEls.map((e) => [e, rect(e)]);
    inn.tl.seek(startTime, false);

    // Geister behalten die folienspezifischen Stile der alten Folie (z. B. .slide--ablauf .agenda-track)
    const scope = document.createElement('div');
    scope.className = `flip-scope slide--${out.s.id}`;
    this.flipLayer.appendChild(scope);

    const dur = 0.85;
    let count = 0;
    for (const [innEl, b] of targets) {
      const outEl = outEls.get(innEl.dataset.flip);
      const a = rect(outEl);
      if (!a.w || !b.w) continue;
      const ghost = outEl.cloneNode(true);
      ghost.removeAttribute('data-flip');
      ghost.classList.add('flip-ghost');
      Object.assign(ghost.style, {
        left: `${a.x}px`,
        top: `${a.y}px`,
        width: `${a.w}px`,
        height: `${a.h}px`,
        transform: 'none',
        opacity: getComputedStyle(outEl).opacity,
      });
      scope.appendChild(ghost);
      outEl.setAttribute('data-flying', '');
      innEl.setAttribute('data-flying', '');
      tl.fromTo(
        ghost,
        { x: 0, y: 0, scaleX: 1, scaleY: 1 },
        { x: b.x - a.x, y: b.y - a.y, scaleX: b.w / a.w, scaleY: b.h / a.h, opacity: 1, duration: dur, ease: 'power3.inOut' },
        0
      );
      tl.call(() => {
        outEl.removeAttribute('data-flying');
        innEl.removeAttribute('data-flying');
        ghost.remove();
      }, null, dur);
      count += 1;
    }
    return count;
  }
}

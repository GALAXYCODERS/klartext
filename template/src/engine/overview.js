import { slides } from '../../content/slides.js';
import { createInstance } from './instance.js';

/** Übersicht aller Folien (Taste O). Vorschaubilder werden erst beim ersten Öffnen gebaut. */
export function createOverview({ onPick }) {
  const root = document.createElement('div');
  root.className = 'overview';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Folienübersicht');
  root.innerHTML = `<div class="overview-head"><h2>Übersicht</h2><span>Pfeiltasten wählen · Enter öffnet · O / Esc schließt</span></div><div class="overview-grid"></div>`;
  document.body.appendChild(root);
  const grid = root.querySelector('.overview-grid');
  let built = false;
  let selected = 0;
  let current = 0;
  const thumbs = [];

  const layout = () => {
    thumbs.forEach(({ frame, stage }) => stage.style.setProperty('--thumb-scale', String(frame.clientWidth / 1920)));
  };
  new ResizeObserver(layout).observe(grid);

  function build() {
    slides.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'thumb';
      btn.type = 'button';
      btn.innerHTML = `<div class="thumb-frame"><div class="thumb-stage"></div></div><div class="thumb-caption"><b>${String(i + 1).padStart(2, '0')}</b><span></span></div>`;
      btn.querySelector('.thumb-caption span').textContent = s.titel || s.id;
      const stage = btn.querySelector('.thumb-stage');
      const inst = createInstance(s, i, { reduced: true });
      inst.el.querySelectorAll('[data-flip]').forEach((e) => e.removeAttribute('data-flip'));
      stage.appendChild(inst.el);
      btn.addEventListener('click', () => onPick(i));
      grid.appendChild(btn);
      inst.tl.progress(1, false); // erst im Dokument: DrawSVG misst Leitungslängen beim ersten Rendern
      thumbs.push({ btn, frame: btn.querySelector('.thumb-frame'), stage });
    });
    built = true;
    requestAnimationFrame(layout);
  }

  const mark = () =>
    thumbs.forEach(({ btn }, i) => {
      btn.classList.toggle('is-selected', i === selected);
      btn.classList.toggle('is-current', i === current);
    });

  return {
    get isOpen() {
      return root.classList.contains('is-open');
    },
    open(index) {
      if (!built) build();
      current = selected = index;
      mark();
      root.classList.add('is-open');
      requestAnimationFrame(() => {
        layout();
        thumbs[index]?.btn.scrollIntoView({ block: 'center' });
      });
    },
    close() {
      root.classList.remove('is-open');
    },
    /** Tastatur in der Übersicht. true = Taste verbraucht. */
    key(e) {
      const cols = Math.max(1, Math.round(grid.clientWidth / (thumbs[0]?.btn.offsetWidth + 24 || 300)));
      const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
      if (move) {
        selected = Math.max(0, Math.min(thumbs.length - 1, selected + move));
        mark();
        thumbs[selected].btn.scrollIntoView({ block: 'nearest' });
        return true;
      }
      if (e.key === 'Enter') {
        onPick(selected);
        return true;
      }
      return false;
    },
  };
}

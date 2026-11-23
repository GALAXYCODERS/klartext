import { Deck } from './deck.js';
import { fitStage } from './stage.js';
import { createOverview } from './overview.js';
import { createSync } from './sync.js';
import { getTheme, toggleTheme } from './theme.js';
import { navKey } from './keys.js';
import { store } from './store.js';
import { createFeld, MODI } from './feld.js';
import { meta } from '../../content/slides.js';

const HELP = [
  ['→ · Leertaste · Bild ↓', 'weiter'],
  ['← · Bild ↑', 'zurück'],
  ['Pos1 · Ende', 'erste / letzte Folie'],
  ['Ziffern + Enter', 'zu Folie springen'],
  ['O', 'Übersicht'],
  ['P', 'Referentenansicht'],
  ['T', 'Hell / Dunkel'],
  ['R', 'Hintergrund: ruhig / still / aus'],
  ['F', 'Vollbild'],
  ['B · .', 'Bildschirm schwarz'],
  ['? · H', 'diese Hilfe'],
];

/** Hash #/7/2 = Folie 7, Schritt 2 (beides ab 1 gezählt) – Neuladen ohne Positionsverlust. */
function parseHash() {
  const m = location.hash.match(/^#\/(\d+)(?:\/(\d+))?/);
  return m ? { index: +m[1] - 1, step: m[2] ? +m[2] - 1 : 0 } : null;
}

export function renderMain(app) {
  document.body.classList.add('mode-main');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  app.innerHTML = `<div class="viewport"><div class="stage" role="region" aria-live="polite"></div></div>`;
  const viewport = app.querySelector('.viewport');
  const stage = app.querySelector('.stage');
  // Das Feld (lebender Hintergrund) liegt als Leinwand hinter allen Folien; ohne WebGL2 bleibt das Punktraster.
  const feld = createFeld(stage, { reduced });
  feld?.setModus(store.get('feld-modus', 'ruhig'));
  fitStage(stage, viewport, (s) => feld?.resize(s));

  // UI-Elemente
  const ui = document.createElement('div');
  ui.className = 'ui-layer';
  ui.innerHTML = `<div class="toast"></div><div class="goto-indicator"></div>`;
  document.body.appendChild(ui);
  const toastEl = ui.querySelector('.toast');
  const gotoEl = ui.querySelector('.goto-indicator');
  const blackout = document.createElement('div');
  blackout.className = 'blackout';
  document.body.appendChild(blackout);
  const help = document.createElement('div');
  help.className = 'help';
  help.innerHTML = `<div class="help-panel" role="dialog" aria-label="Tastenkürzel"><h2>Tastenkürzel</h2><dl>${HELP.map(
    ([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`
  ).join('')}</dl></div>`;
  document.body.appendChild(help);
  help.addEventListener('click', () => help.classList.remove('is-open'));

  let toastTimer;
  const toast = (text, ms = 2200) => {
    toastEl.textContent = text;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), ms);
  };

  // Sync mit der Referentenansicht
  let presenterWin = null;
  const sync = createSync((msg) => {
    if (msg.type === 'hello') broadcast();
    if (msg.type === 'cmd') command(msg.cmd, msg);
  });
  const broadcast = () =>
    sync.send({ type: 'state', index: deck.index, step: deck.step, steps: deck.current.steps, total: deck.total, theme: getTheme() });

  const deck = new Deck(stage, {
    reduced,
    feld,
    onChange: ({ index, step }) => {
      const hash = `#/${index + 1}${step ? `/${step + 1}` : ''}`;
      if (location.hash !== hash) history.replaceState(null, '', hash);
      document.title = `${index + 1} · ${meta.titel}`;
      broadcast();
    },
  });

  const overview = createOverview({
    onPick: (i) => {
      overview.close();
      deck.goto(i, 0);
    },
  });

  function command(c, msg = {}) {
    if (c === 'next') deck.next();
    else if (c === 'prev') deck.prev();
    else if (c === 'first') deck.goto(0, 0);
    else if (c === 'last') deck.goto(deck.total - 1, deck.instances[deck.total - 1].steps - 1);
    else if (c === 'goto') deck.goto(msg.index ?? 0, msg.step ?? 0);
  }

  function openPresenter() {
    const url = `${location.href.split(/[?#]/)[0]}?presenter=1`;
    presenterWin = window.open(url, 'klartext-presenter', 'width=1440,height=860');
    if (!presenterWin) return toast('Pop-up blockiert – bitte Pop-ups für diese Datei erlauben.', 4000);
    sync.addPeer(presenterWin);
    setTimeout(broadcast, 600);
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => toast('Vollbild nicht möglich'));
  };

  // Zifferneingabe: „1“ „2“ Enter → Folie 12
  let digits = '';
  let digitTimer;
  const showDigits = () => {
    gotoEl.textContent = `Gehe zu Folie ${digits}`;
    gotoEl.classList.toggle('is-visible', !!digits);
  };

  window.addEventListener('keydown', (e) => {
    if (e.defaultPrevented) return;
    if (help.classList.contains('is-open') && e.key !== 'Escape' && e.key !== '?' && e.key !== 'h') {
      help.classList.remove('is-open');
    }
    if (overview.isOpen) {
      if (e.key === 'Escape' || e.key === 'o' || e.key === 'O') overview.close();
      else if (overview.key(e)) e.preventDefault();
      return;
    }
    if (/^[0-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
      digits = (digits + e.key).slice(-3);
      showDigits();
      clearTimeout(digitTimer);
      digitTimer = setTimeout(() => ((digits = ''), showDigits()), 3000);
      return;
    }
    if (e.key === 'Enter' && digits) {
      deck.goto(+digits - 1, 0);
      digits = '';
      showDigits();
      return;
    }
    if (e.key === 'Escape') {
      digits = '';
      showDigits();
      help.classList.remove('is-open');
      blackout.classList.remove('is-on');
      return;
    }
    if (blackout.classList.contains('is-on') && navKey(e)) {
      blackout.classList.remove('is-on');
      e.preventDefault();
      return;
    }
    const nav = navKey(e);
    if (nav) {
      e.preventDefault();
      return command(nav);
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key.toLowerCase()) {
      case 'o':
        overview.open(deck.index);
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 't':
        toast(toggleTheme() === 'light' ? 'Theme Papier (hell)' : 'Theme Nacht (dunkel)');
        broadcast();
        break;
      case 'r': {
        if (!feld) {
          toast('Hintergrund ist hier statisch (kein WebGL)');
          break;
        }
        const m = MODI[(MODI.indexOf(feld.modus) + 1) % MODI.length];
        feld.setModus(m);
        store.set('feld-modus', m);
        toast({ ruhig: 'Hintergrund ruhig', still: 'Hintergrund still (ohne Bewegung)', aus: 'Hintergrund aus' }[m]);
        break;
      }
      case 'p':
        openPresenter();
        break;
      case 'b':
      case '.':
        blackout.classList.toggle('is-on');
        break;
      case '?':
      case 'h':
        help.classList.toggle('is-open');
        break;
      default:
    }
  });

  // Klickbare Elemente auf Folien (z. B. Umschalter) springen zu einem Schritt: data-goto-step="n"
  stage.addEventListener('click', (e) => {
    const t = e.target.closest('[data-goto-step]');
    if (!t) return;
    deck.finish();
    deck.playStep(Math.min(+t.dataset.gotoStep, deck.current.steps - 1));
  });

  window.addEventListener('hashchange', () => {
    const h = parseHash();
    if (h && (h.index !== deck.index || h.step !== deck.step)) deck.goto(h.index, h.step);
  });

  // Mauszeiger nach 2 s Ruhe ausblenden
  let idle;
  window.addEventListener('mousemove', () => {
    document.body.classList.remove('cursor-hidden');
    clearTimeout(idle);
    idle = setTimeout(() => document.body.classList.add('cursor-hidden'), 2000);
  });

  // Wischgesten (Tablet)
  let touchX = null;
  window.addEventListener('touchstart', (e) => (touchX = e.touches[0].clientX), { passive: true });
  window.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) command(dx < 0 ? 'next' : 'prev');
    touchX = null;
  });

  // Start: Position aus dem Hash, sonst Folie 1 mit Einstiegsanimation
  const start = parseHash();
  if (start) deck.goto(start.index, start.step);
  else {
    deck.goto(0, 0);
    const first = deck.current;
    feld?.show(first, 'intro');
    if (!reduced && first.labelTime(0) > 0) {
      first.tl.seek(0, false);
      deck.running.push(first.tl.tweenTo(first.labelTime(0)));
    }
  }

  if (!store.get('hintShown', false)) {
    setTimeout(() => toast('? = Tastenkürzel · P = Referentenansicht · O = Übersicht', 4500), 900);
    store.set('hintShown', true);
  }

  window.__deck = deck; // für Tests (Playwright) und Fehlersuche
}

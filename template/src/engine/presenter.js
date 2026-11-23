import { slides, meta } from '../../content/slides.js';
import { Deck } from './deck.js';
import { fitStage } from './stage.js';
import { createSync } from './sync.js';
import { setTheme } from './theme.js';
import { store } from './store.js';
import { navKey } from './keys.js';
import { regieFor, stepHTML, stepLabel, md } from './regie.js';

const fmt = (sec) => {
  const neg = sec < 0;
  sec = Math.abs(Math.round(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${neg ? '−' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/** Referentenansicht: läuft im zweiten Fenster und steuert das Vortragsfenster fern. */
export function renderPresenter(app) {
  document.body.classList.add('mode-presenter');
  document.title = `Referentenansicht – ${meta.titel}`;
  app.innerHTML = `
    <div class="presenter">
      <div class="presenter-bar">
        <div class="stat"><small>Uhrzeit</small><span class="big" data-clock>--:--</span></div>
        <div class="stat"><small>Vortragszeit</small><span class="big" data-elapsed>00:00</span></div>
        <div class="stat"><small>Plan (Folienbeginn)</small><span class="big" data-plan>00:00</span></div>
        <div class="stat"><small>Abweichung</small><span class="big" data-delta>±00:00</span></div>
        <div class="stat"><small>Folie · Schritt</small><span class="big" data-pos>– · –</span></div>
        <span class="spacer"></span>
        <button data-act="timer">Start</button>
        <button data-act="reset">Timer zurücksetzen</button>
        <button data-act="prev">◀ Zurück</button>
        <button data-act="next">Weiter ▶</button>
        <span data-conn class="presenter-disconnected">Warte auf Vortragsfenster …</span>
      </div>
      <div class="presenter-main">
        <div class="preview-label"><span>Jetzt</span><span data-title></span></div>
        <div class="preview" data-cur><div class="stage"></div></div>
        <div class="cue" data-cue></div>
      </div>
      <div class="presenter-side">
        <div class="preview-label"><span data-next-label>Als Nächstes</span><span></span></div>
        <div class="preview" data-next><div class="stage"></div></div>
        <div class="notes-head">
          <span class="preview-label">Ablauf dieser Folie</span>
          <span><span class="speaker" data-speaker>–</span> <button data-act="smaller">A−</button> <button data-act="bigger">A+</button></span>
        </div>
        <div class="notes" data-notes></div>
      </div>
    </div>`;

  const $ = (sel) => app.querySelector(sel);
  const curStage = $('[data-cur] .stage');
  const nextStage = $('[data-next] .stage');
  fitStage(curStage, $('[data-cur]'));
  fitStage(nextStage, $('[data-next]'));
  const cur = new Deck(curStage, { mode: 'viewer', reduced: true });
  const nxt = new Deck(nextStage, { mode: 'viewer', reduced: true });

  // geplante Startzeit jeder Folie (Summe der Minuten davor)
  const planStart = [];
  slides.reduce((acc, s, i) => ((planStart[i] = acc), acc + (s.minuten || 0) * 60), 0);

  let notesSize = store.get('notesSize', 22);
  const applyNotes = () => app.style.setProperty('--notes-size', `${notesSize}px`);
  applyNotes();

  // Timer (überlebt ein Neuladen des Fensters)
  let timer = store.get('timer', { startedAt: null, acc: 0 });
  const elapsed = () => timer.acc + (timer.startedAt ? (Date.now() - timer.startedAt) / 1000 : 0);
  const saveTimer = () => store.set('timer', timer);
  const startTimer = () => {
    if (!timer.startedAt) timer.startedAt = Date.now();
    saveTimer();
  };
  const pauseTimer = () => {
    timer = { startedAt: null, acc: elapsed() };
    saveTimer();
  };

  let state = { index: 0, step: 0, steps: 1, total: slides.length };
  let lastSeen = 0;

  function render() {
    const { index, step } = state;
    cur.goto(index, step);
    const inst = cur.instances[index];
    if (step < inst.steps - 1) {
      nxt.goto(index, step + 1);
      $('[data-next-label]').textContent = `Nächster Schritt (${step + 2}/${inst.steps})`;
    } else if (index < slides.length - 1) {
      nxt.goto(index + 1, 0);
      $('[data-next-label]').textContent = `Nächste Folie (${index + 2})`;
    } else {
      $('[data-next-label]').textContent = 'Ende der Präsentation';
    }
    const s = slides[index];
    $('[data-title]').textContent = s.titel || meta.titel;
    const rg = regieFor(s.id);
    if (rg) {
      const st = rg.schritte[step];
      const nextSt = rg.schritte[step + 1];
      $('[data-cue]').innerHTML = `
        <div class="cue-head"><span>Jetzt · ${stepLabel(step)}</span><span class="cue-kern">${md(rg.kern)}</span></div>
        ${stepHTML(st, step, { active: true })}
        <div class="cue-next">${
          nextSt ? `<b>Nächster Klick:</b> ${md(nextSt.zeigt)}` : `<b>Weiter zur nächsten Folie:</b> ${md(rg.weiter || '')}`
        }</div>`;
      $('[data-notes]').innerHTML = `${rg.schritte.map((x, k) => stepHTML(x, k, { active: k === step, done: k < step })).join('')}
        <div class="rg-weiter"><b>→ Überleitung:</b> ${md(rg.weiter || '')}</div>
        ${rg.beleg ? `<div class="rg-beleg">Belege: ${md(rg.beleg)}</div>` : ''}`;
      $('[data-notes] .is-now')?.scrollIntoView({ block: 'nearest' });
    } else {
      $('[data-cue]').innerHTML = '';
      $('[data-notes]').textContent = s.notizen || '—';
    }
    $('[data-speaker]').textContent = `Sprecher:in: ${s.sprecher || '[offen]'}`;
    $('[data-pos]').textContent = `${index + 1}/${slides.length} · ${step + 1}/${inst.steps}`;
    $('[data-plan]').textContent = fmt(planStart[index]);
  }

  function tick() {
    const e = elapsed();
    $('[data-clock]').textContent = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    $('[data-elapsed]').textContent = fmt(e);
    const delta = e - planStart[state.index];
    const d = $('[data-delta]');
    d.textContent = `${delta >= 0 ? '+' : '−'}${fmt(Math.abs(delta))}`;
    d.classList.toggle('is-late', delta > 60);
    d.classList.toggle('is-early', delta < -60);
    $('[data-act="timer"]').textContent = timer.startedAt ? 'Pause' : elapsed() > 0 ? 'Weiter' : 'Start';
    const connected = Date.now() - lastSeen < 6000;
    const conn = $('[data-conn]');
    conn.textContent = connected ? 'verbunden' : 'Warte auf Vortragsfenster …';
    conn.classList.toggle('presenter-disconnected', !connected);
  }

  const sync = createSync((msg) => {
    if (msg.type === 'state') {
      lastSeen = Date.now();
      if (msg.theme) setTheme(msg.theme, { persist: false });
      const moved = msg.index !== state.index || msg.step !== state.step;
      state = msg;
      if (moved && (msg.index > 0 || msg.step > 0)) startTimer();
      render();
    }
  });
  sync.addPeer(window.opener);
  const hello = () => sync.send({ type: 'hello' });
  hello();
  setInterval(() => {
    if (Date.now() - lastSeen > 3000) hello();
    tick();
  }, 1000);

  const cmd = (c, extra = {}) => sync.send({ type: 'cmd', cmd: c, ...extra });

  app.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'next' || act === 'prev') cmd(act);
    if (act === 'timer') timer.startedAt ? pauseTimer() : startTimer();
    if (act === 'reset') {
      timer = { startedAt: null, acc: 0 };
      saveTimer();
    }
    if (act === 'bigger' || act === 'smaller') {
      notesSize = Math.max(14, Math.min(40, notesSize + (act === 'bigger' ? 2 : -2)));
      store.set('notesSize', notesSize);
      applyNotes();
    }
    tick();
  });

  window.addEventListener('keydown', (e) => {
    const k = navKey(e);
    if (k) {
      e.preventDefault();
      cmd(k);
    }
  });

  render();
  tick();
}

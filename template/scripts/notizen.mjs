// Notizen-PDF fürs iPad (npm run notizen): pro Folie eine Seite (bei vielen Klicks zwei) mit einem Mini-Bild
// für jeden Klick, daneben was passiert, Stichworte zum freien Sprechen, Tipp – und am Ende die Überleitung.
// Format 3:4 (iPad hochkant), dunkel wie die Referentenansicht. Prüft vorher, dass die Regie zu den Klicks passt.
//   → dist/presentation-notes.pdf
import { readFileSync } from 'node:fs';
import { launch, fileUrl } from './browser.mjs';
import { slides, meta } from '../content/slides.js';
import { regie } from '../content/regie.js';

const OUT = 'dist/presentation-notes.pdf';
const esc = (t = '') => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const md = (t = '') => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const font = (p) => `data:font/woff2;base64,${readFileSync(p).toString('base64')}`;
const mmss = (min) => `${Math.floor(min)}:${String(Math.round((min % 1) * 60)).padStart(2, '0')}`;

const browser = await launch();

// 1. Klickzahlen der echten Präsentation und Mini-Bilder jedes Schritts (so, wie das Publikum sie sieht)
const shot = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.5 });
const errors = [];
shot.on('pageerror', (e) => errors.push(String(e)));
await shot.goto(fileUrl());
await shot.waitForFunction(() => window.__deck);
await shot.addStyleTag({ content: '.ui-layer,.help{display:none!important}' });
const steps = await shot.evaluate(() => window.__deck.instances.map((i) => i.steps));

const mismatch = slides
  .map((s, i) => [s, i, regie[s.id]?.schritte?.length ?? 0])
  .filter(([, i, n]) => n !== steps[i])
  .map(([s, i, n]) => `Folie ${i + 1} (${s.id}): ${n} Regie-Schritte, die Folie hat ${steps[i]}`);
if (mismatch.length) {
  console.error('✗ Regie passt nicht zu den Klicks – bitte content/regie.js anpassen:');
  mismatch.forEach((m) => console.error(`  – ${m}`));
  await browser.close();
  process.exit(1);
}

const thumbs = [];
for (let i = 0; i < slides.length; i++) {
  thumbs[i] = [];
  for (let k = 0; k < steps[i]; k++) {
    await shot.evaluate(([i, k]) => window.__deck.goto(i, k), [i, k]);
    await shot.waitForTimeout(60);
    thumbs[i][k] = `data:image/jpeg;base64,${(await shot.screenshot({ type: 'jpeg', quality: 78 })).toString('base64')}`;
  }
}
await shot.close();

// 2. Notizen-Dokument
let plan = 0;
const overview = [];
const pages = slides.map((s, i) => {
  const rg = regie[s.id];
  const start = plan;
  plan += s.minuten || 0;
  const title = s.titel || (s.id === 'titel' ? meta.titel : rg.kern);
  overview.push(`<tr><td>${String(i + 1).padStart(2, '0')}</td><td>${esc(title)}</td><td>${steps[i] - 1}</td><td>${mmss(s.minuten || 0)}</td><td>${mmss(start)}</td></tr>`);
  const rows = rg.schritte
    .map(
      (st, k) => `<div class="row">
        <img src="${thumbs[i][k]}" alt="">
        <div class="txt">
          <div class="key ${k ? '' : 'key--auto'}">${k ? `▶ Klick ${k}` : '◇ Folie erscheint'}</div>
          <p class="zeigt">${md(st.zeigt)}</p>
          <ul>${(st.sagen || []).map((x) => `<li>${md(x)}</li>`).join('')}</ul>
          ${st.tipp ? `<p class="tipp"><b>Tipp:</b> ${md(st.tipp)}</p>` : ''}
        </div>
      </div>`
    )
    .join('');
  return `<section class="page">
    <header>
      <span class="nr">${String(i + 1).padStart(2, '0')}<small>/${slides.length}</small></span>
      <div><h2>${esc(title)}</h2>
      <p class="meta">${steps[i] - 1} Klick${steps[i] === 2 ? '' : 's'} · ca. ${mmss(s.minuten || 0)} Min · Plan ab ${mmss(start)} · Sprecher:in: ${esc(s.sprecher || '[offen]')}</p></div>
    </header>
    <p class="kern">${md(rg.kern)}</p>
    ${rows}
    <div class="weiter"><b>→ Überleitung</b> ${md(rg.weiter || '')}</div>
    ${rg.beleg ? `<p class="beleg">Belege für Rückfragen: ${md(rg.beleg)}</p>` : ''}
  </section>`;
});

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
@font-face{font-family:Archivo;src:url(${font('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2')}) format('woff2');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:Archivo;src:url(${font('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-italic.woff2')}) format('woff2');font-weight:100 900;font-style:italic}
@font-face{font-family:Mono;src:url(${font('node_modules/@fontsource-variable/martian-mono/files/martian-mono-latin-wdth-normal.woff2')}) format('woff2');font-weight:100 800;font-stretch:75% 112.5%}
@page{size:768px 1024px;margin:0}
*{box-sizing:border-box}
html,body{margin:0;background:#0b1020;color:#e9edf6;font-family:Archivo,-apple-system,Helvetica,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{padding:34px 34px 30px;break-after:page}
.page:last-child{break-after:auto}
header{display:flex;gap:18px;align-items:flex-start;margin-bottom:12px}
.nr{font-family:Mono,monospace;font-stretch:75%;font-size:38px;line-height:1;color:#7fe0b4}
.nr small{font-size:15px;color:#7d88a3}
h2{margin:0;font-size:24px;font-weight:650;font-stretch:108%;line-height:1.15}
.meta{margin:5px 0 0;font-family:Mono,monospace;font-stretch:75%;font-size:11.5px;letter-spacing:.03em;color:#a3adc4}
.kern{margin:0 0 14px;padding:10px 14px;border-left:4px solid #7fe0b4;background:#121a30;border-radius:0 8px 8px 0;font-size:16px;line-height:1.35;font-weight:600}
.row{display:grid;grid-template-columns:232px 1fr;gap:16px;padding:11px 0;border-top:1px solid rgba(160,178,220,.18);break-inside:avoid}
.row img{width:232px;border-radius:6px;box-shadow:0 0 0 1px rgba(160,178,220,.25)}
.key{font-family:Mono,monospace;font-stretch:75%;font-size:13px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#0b1020;background:#7fe0b4;display:inline-block;padding:2px 8px;border-radius:4px;margin-bottom:6px}
.key--auto{background:none;color:#7fe0b4;padding:0;border:0}
.zeigt{margin:0 0 6px;font-size:12.5px;line-height:1.35;font-style:italic;color:#a3adc4}
ul{margin:0;padding-left:1.05em;font-size:15.5px;line-height:1.38}
li b{color:#fff}
.tipp{margin:6px 0 0;font-size:12.5px;line-height:1.35;color:#f2c46d}
.weiter{margin-top:10px;padding:10px 14px;border-radius:8px;background:#15203b;border:1px solid #7fe0b4;font-size:15px;line-height:1.35;break-inside:avoid}
.weiter b{color:#7fe0b4;margin-right:6px}
.beleg{margin:10px 0 0;font-size:11px;color:#7d88a3;line-height:1.35}
.cover h1{font-size:38px;font-weight:700;font-stretch:108%;margin:40px 0 6px;line-height:1.05}
.cover .sub{color:#a3adc4;font-size:15px;margin:0 0 26px}
.legend{display:grid;grid-template-columns:150px 1fr;gap:10px 16px;font-size:14.5px;line-height:1.35;margin-bottom:26px}
.legend dt{margin:0}
table{width:100%;border-collapse:collapse;font-size:13px}
th{font-family:Mono,monospace;font-stretch:75%;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#a3adc4;text-align:left;padding:0 6px 6px;border-bottom:1px solid rgba(160,178,220,.4)}
td{padding:5px 6px;border-bottom:1px solid rgba(160,178,220,.14)}
td:first-child,td:nth-child(n+3){font-family:Mono,monospace;font-stretch:75%;font-size:12px;color:#a3adc4;white-space:nowrap}
</style></head><body>
<section class="page cover">
  <h1>Regie-Notizen<br>${esc(meta.titel)}</h1>
  <p class="sub">${esc(meta.kopfzeile)} · ${esc(meta.autor || '')}</p>
  <dl class="legend">
    <dt><span class="key key--auto">◇ Folie erscheint</span></dt><dd style="margin:0">Das ist zu sehen, sobald die Folie da ist – noch kein Klick.</dd>
    <dt><span class="key">▶ Klick 2</span></dt><dd style="margin:0">Der 2. Klick auf dieser Folie. Das Mini-Bild zeigt den Zustand <i>nach</i> dem Klick.</dd>
    <dt><i style="color:#a3adc4">kursiv</i></dt><dd style="margin:0">Was die Animation zeigt – darauf kann man zeigen, während man spricht.</dd>
    <dt>• Stichworte</dt><dd style="margin:0">Zum freien Sprechen, <b>fett</b> = das Schlüsselwort.</dd>
    <dt><span style="color:#f2c46d">Tipp</span></dt><dd style="margin:0">Regie: zeigen, Pause, Publikum fragen.</dd>
    <dt><span style="color:#7fe0b4">→ Überleitung</span></dt><dd style="margin:0">Der letzte Satz – danach zur nächsten Folie klicken.</dd>
  </dl>
  <table><thead><tr><th>#</th><th>Folie</th><th>Klicks</th><th>Min</th><th>Plan ab</th></tr></thead><tbody>${overview.join('')}</tbody></table>
</section>
${pages.join('')}
</body></html>`;

const doc = await browser.newPage();
await doc.setContent(html, { waitUntil: 'load' });
await doc.evaluate(() => document.fonts.ready);
await doc.pdf({ path: OUT, width: '768px', height: '1024px', printBackground: true, preferCSSPageSize: true });
const pdfPages = (readFileSync(OUT, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
await browser.close();

console.log(`Notizen: ${OUT}`);
console.log(`  ✓ Regie passt zu allen ${slides.length} Folien (${steps.reduce((a, b) => a + b, 0) - slides.length} Klicks)`);
console.log(`  ${pdfPages} Seiten (Deckblatt + Folien)`);
console.log(`  Fehler im Browser: ${errors.length ? `✗ ${errors.join(' | ')}` : '✓ keine'}`);
if (errors.length) process.exit(1);

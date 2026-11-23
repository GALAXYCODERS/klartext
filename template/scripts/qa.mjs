// Qualitätsprüfung der fertigen dist/presentation.html (npm run qa):
//  1. Screenshot jeder Folie und jedes Schritts in 1920×1080 (dunkel) und des Endzustands in 1280×800 (hell)
//  2. Clicker-Test: mit Bild ↓ durch alle Schritte bis zum Ende, mit Bild ↑ zurück an den Anfang
//  3. Tasten: Pos1/Ende, Ziffern + Enter, T (Theme), O (Übersicht)
//  4. keine Fehler in der Browser-Konsole
// Ergebnisse: screenshots/qa/
import { mkdirSync, rmSync } from 'node:fs';
import { launch, fileUrl } from './browser.mjs';
import { slides } from '../content/slides.js';
import { regie } from '../content/regie.js';

const DIR = 'screenshots/qa';
rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });
const browser = await launch();
const results = [];
const check = (ok, text) => results.push(`${ok ? '✓' : '✗'} ${text}`);
const errors = [];
const watch = (page) => {
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
};
const pad = (n) => String(n).padStart(2, '0');

// 1a. jede Folie, jeder Schritt – 1920×1080, dunkel
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  watch(page);
  await page.goto(fileUrl());
  await page.waitForFunction(() => window.__deck);
  const plan = await page.evaluate(() => window.__deck.instances.map((i) => i.steps));
  let n = 0;
  for (let i = 0; i < plan.length; i++) {
    for (let s = 0; s < plan[i]; s++) {
      await page.evaluate(([i, s]) => window.__deck.goto(i, s), [i, s]);
      await page.waitForTimeout(60);
      await page.screenshot({ path: `${DIR}/1920-folie${pad(i + 1)}-schritt${s + 1}.png` });
      n += 1;
    }
  }
  check(true, `${plan.length} Folien, ${n} Schritte als Screenshot (1920×1080)`);
  const off = slides.filter((s, i) => (regie[s.id]?.schritte?.length ?? 0) !== plan[i]).map((s) => s.id);
  check(!off.length, `Regie-Notizen passen zu jedem Klick${off.length ? ` – abweichend: ${off.join(', ')}` : ''}`);

  // 2. Clicker: Bild ↓ bis zum Ende, Bild ↑ zurück
  await page.evaluate(() => window.__deck.goto(0, 0));
  const total = plan.reduce((a, b) => a + b, 0);
  for (let k = 0; k < total + 2; k++) {
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(1500);
  const end = await page.evaluate(() => [window.__deck.index, window.__deck.step]);
  check(end[0] === plan.length - 1 && end[1] === plan[plan.length - 1] - 1, `Bild ↓ erreicht die letzte Folie im letzten Schritt (#/${end[0] + 1}/${end[1] + 1})`);
  for (let k = 0; k < total + 2; k++) {
    await page.keyboard.press('PageUp');
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(1500);
  const start = await page.evaluate(() => [window.__deck.index, window.__deck.step]);
  check(start[0] === 0 && start[1] === 0, 'Bild ↑ führt zurück an den Anfang');

  // 3. Tasten
  await page.keyboard.press('End');
  check((await page.evaluate(() => window.__deck.index)) === plan.length - 1, 'Ende springt zur letzten Folie');
  await page.keyboard.press('Home');
  check((await page.evaluate(() => window.__deck.index)) === 0, 'Pos1 springt zur ersten Folie');
  // Ziffern + Enter: springt zur letzten Folie (zweistellig, falls es so viele gibt)
  const ziel = plan.length;
  for (const d of String(ziel)) await page.keyboard.press(d);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  check((await page.evaluate(() => window.__deck.index)) === ziel - 1, `Ziffern + Enter: „${ziel}“ springt zu Folie ${ziel}`);
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.keyboard.press('t');
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  check(before !== after, `T wechselt das Theme (${before} → ${after})`);
  await page.keyboard.press('t');
  await page.keyboard.press('o');
  await page.waitForTimeout(600);
  const ov = await page.evaluate(() => document.querySelector('.overview')?.classList.contains('is-open'));
  await page.screenshot({ path: `${DIR}/uebersicht.png` });
  await page.keyboard.press('Escape');
  check(ov, 'O öffnet die Übersicht');
  // Hash-Link: erste Folie mit mindestens 3 Schritten (sonst die mit den meisten), letzter Schritt
  const hi = plan.findIndex((n) => n >= 3) >= 0 ? plan.findIndex((n) => n >= 3) : plan.indexOf(Math.max(...plan));
  const hs = Math.min(3, plan[hi]);
  await page.goto(fileUrl(`#/${hi + 1}/${hs}`));
  await page.reload();
  await page.waitForTimeout(500);
  const hash = await page.evaluate(() => [window.__deck.index, window.__deck.step]);
  check(hash[0] === hi && hash[1] === hs - 1, `Neuladen mit #/${hi + 1}/${hs} bleibt auf Folie ${hi + 1}, Schritt ${hs}`);
  await page.close();
}

// 1b. Endzustand jeder Folie – 1280×800 (16:10-Beamer, Letterboxing), hell
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  watch(page);
  await page.goto(fileUrl());
  await page.waitForFunction(() => window.__deck);
  await page.keyboard.press('t');
  const plan = await page.evaluate(() => window.__deck.instances.map((i) => i.steps));
  for (let i = 0; i < plan.length; i++) {
    await page.evaluate(([i, s]) => window.__deck.goto(i, s), [i, plan[i] - 1]);
    await page.waitForTimeout(60);
    await page.screenshot({ path: `${DIR}/1280-folie${pad(i + 1)}.png` });
  }
  check(true, `${plan.length} Endzustände als Screenshot (1280×800, hell)`);
  await page.close();
}

await browser.close();
check(errors.length === 0, `Browser-Konsole ohne Fehler${errors.length ? `: ${errors.join(' | ')}` : ''}`);
console.log(results.join('\n'));
console.log(`Screenshots: ${DIR}/`);
if (results.some((r) => r.startsWith('✗'))) process.exit(1);

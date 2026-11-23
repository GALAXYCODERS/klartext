// PDF zum Verteilen: jede Folie im Endzustand (Folien mit `druck` mehrfach), 1920×1080 je Seite,
// echter Text, Hintergründe mitgedruckt. Standard = helles Theme; „--dark“ = dunkle Variante.
//   npm run pdf        → dist/presentation.pdf
//   npm run pdf:dark   → dist/presentation-dark.pdf
import { readFileSync, mkdirSync, rmSync } from 'node:fs';
import { launch, fileUrl, layoutFindings } from './browser.mjs';

const dark = process.argv.includes('--dark');
const out = `dist/presentation${dark ? '-dark' : ''}.pdf`;
const shots = `screenshots/pdf${dark ? '-dunkel' : ''}`;

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(fileUrl(`?print=1${dark ? '&theme=dark' : ''}`));
await page.waitForFunction(() => window.__PRINT_READY === true, null, { timeout: 30000 });
const expected = await page.evaluate(() => window.__PRINT_PAGES);
const slideCount = await page.evaluate(() => new Set([...document.querySelectorAll('.print-page')].map((p) => p.dataset.slide)).size);

await page.emulateMedia({ media: 'print' });
await page.pdf({ path: out, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });

// Prüfung 1: Seitenzahl im PDF = Druckseiten
const pdfPages = (readFileSync(out, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
// Prüfung 2: nichts ragt über den Rand, kein Text abgeschnitten
await page.emulateMedia({ media: 'screen' });
const findings = await layoutFindings(page);
// Prüfung 3: Vorschaubilder jeder Seite zum Ansehen
rmSync(shots, { recursive: true, force: true });
mkdirSync(shots, { recursive: true });
const pages = await page.$$('.print-page');
for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: `${shots}/seite-${String(i + 1).padStart(2, '0')}.png` });
await browser.close();

console.log(`PDF: ${out}`);
console.log(`  ${slideCount} Folien → ${pdfPages} Seiten (erwartet ${expected}) ${pdfPages === expected ? '✓' : '✗'}`);
console.log(`  Layout: ${findings.length ? `✗ ${findings.length} Befund(e)` : '✓ nichts abgeschnitten oder über den Rand'}`);
findings.forEach((f) => console.log(`    – ${f}`));
console.log(`  Fehler im Browser: ${errors.length ? `✗ ${errors.join(' | ')}` : '✓ keine'}`);
console.log(`  Vorschaubilder: ${shots}/`);
if (pdfPages !== expected || findings.length || errors.length) process.exit(1);

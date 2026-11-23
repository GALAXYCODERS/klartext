// Prüft die Farbtokens beider Themes gegen WCAG 2.1 AA.
// Aufruf: npm run contrast   (Exit-Code 1, wenn etwas durchfällt)
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

// Die Theme-Blöcke stehen hinter den Kommentaren /* Nacht */ und /* Papier */ in tokens.css.
function block(marker) {
  const i = css.indexOf(marker);
  const start = css.indexOf('{', i);
  const end = css.indexOf('}', start);
  const vars = {};
  for (const m of css.slice(start, end).matchAll(/--([\w-]+):\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

function parse(c) {
  c = c.trim();
  if (c.startsWith('#')) {
    const h = c.slice(1);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1);
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(',').map((x) => parseFloat(x));
    return [p[0], p[1], p[2], p[3] ?? 1];
  }
  throw new Error(`Farbe nicht lesbar: ${c}`);
}
const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
const lum = ([r, g, b]) => {
  const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// [Vordergrund, Hintergrund, Mindestwert, Zweck]
const checks = [
  ['ink', 'bg', 4.5, 'Fließtext'],
  ['ink', 'bg-2', 4.5, 'Text auf Knoten/Tabellenkopf'],
  ['ink-2', 'bg', 4.5, 'Sekundärtext, Quellenzeile'],
  ['ink-2', 'bg-2', 4.5, 'Rahmentext'],
  ['ink-3', 'bg', 3, 'Leitungen, Meta ≥ 24 px (Grafik)'],
  ['blau', 'bg', 4.5, 'Akzent A (Bestellung): Lampe, Icon, Beschriftung'],
  ['gruen', 'bg', 4.5, 'Versand: Lampe, Icon, Beschriftung'],
  ['bg', 'ink', 4.5, 'Zahlung: Schrift im invertierten Knoten'],
  ['bg', 'blau', 4.5, 'Schrift auf Akzent-A-Fläche'],
  ['bg', 'gruen', 4.5, 'Schrift auf Versand-Fläche'],
  ['alarm', 'bg', 4.5, 'Fehlertext („offline“)'],
  ['alarm', 'bg-2', 4.5, 'Fehlertext auf Knoten'],
  ['rule-2', 'bg', 1.5, 'Eckmarken, leere Ticks (Deko, nur sichtbar)'],
];

let failed = 0;
for (const [name, sel] of [
  ['Nacht', '/* Nacht */'],
  ['Papier', '/* Papier */'],
]) {
  const v = block(sel);
  const bg = parse(v.bg);
  const col = (k) => {
    const c = parse(v[k]);
    return c[3] < 1 ? over(c, bg) : c;
  };
  console.log(`\n${name}`);
  for (const [f, b, min, what] of checks) {
    const r = ratio(col(f), col(b));
    const ok = r >= min;
    if (!ok) failed += 1;
    console.log(`  ${ok ? '✓' : '✗'} ${f.padEnd(15)} auf ${b.padEnd(15)} ${r.toFixed(2).padStart(5)} : 1  (min ${min}) – ${what}`);
  }
}
console.log(failed ? `\n${failed} Prüfung(en) nicht bestanden.` : '\nAlle Kontraste bestehen WCAG AA.');
process.exit(failed ? 1 : 0);

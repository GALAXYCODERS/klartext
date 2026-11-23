// One source of truth: design-system/ and docs/ are the originals.
// This script copies them into the Claude skill (skill/klartext-design/).
//   node scripts/sync.mjs          copy
//   node scripts/sync.mjs --check  only compare; exit code 1 if anything is out of sync (used in CI)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

// [source, target, optional transform]
const MAP = [
  ...['klartext.css', 'bausteine.js', 'motion.js', 'feld.js', 'icons.js'].map((f) => [`design-system/${f}`, `skill/klartext-design/assets/${f}`]),
  // the demo page lives one folder deeper in the repo; inside the skill it sits next to the assets
  ['design-system/beispiel/index.html', 'skill/klartext-design/assets/beispiel.html', (t) => t.replaceAll('"../klartext.css"', '"klartext.css"').replaceAll("from '../", "from './")],
  ['docs/regelwerk.md', 'skill/klartext-design/references/regelwerk.md'],
  ['docs/praesentation.md', 'skill/klartext-design/references/praesentation.md'],
];

let drift = 0;
for (const [src, dst, fn = (t) => t] of MAP) {
  const want = fn(readFileSync(resolve(root, src), 'utf8'));
  const have = existsSync(resolve(root, dst)) ? readFileSync(resolve(root, dst), 'utf8') : null;
  if (want === have) continue;
  drift += 1;
  if (check) console.log(`✗ ${dst} differs from ${src}`);
  else {
    writeFileSync(resolve(root, dst), want);
    console.log(`→ ${dst}`);
  }
}
if (check) {
  console.log(drift ? `\n${drift} file(s) out of sync – run: node scripts/sync.mjs` : '✓ skill is in sync with design-system/ and docs/');
  process.exit(drift ? 1 : 0);
}
console.log(drift ? `${drift} file(s) updated.` : 'Nothing to do – already in sync.');

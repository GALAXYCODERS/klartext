// Builds the release assets into release/:
//   klartext-design.skill   – the Claude skill (ZIP with the folder klartext-design/ as root)
//   klartext-template.zip   – the presentation template (without node_modules, dist, screenshots)
//   node scripts/package.mjs [skill|template]   (default: both)
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'release');
const what = process.argv[2] || 'all';
mkdirSync(out, { recursive: true });

const zip = (cwd, file, args) => {
  rmSync(resolve(out, file), { force: true });
  execFileSync('zip', ['-r', '-X', '-q', resolve(out, file), ...args], { cwd, stdio: 'inherit' });
  console.log(`✓ release/${file} (${Math.round(statSync(resolve(out, file)).size / 1024)} KB)`);
};

if (what === 'all' || what === 'skill') {
  zip(resolve(root, 'skill'), 'klartext-design.skill', ['klartext-design', '-x', '*.DS_Store']);
}
if (what === 'all' || what === 'template') {
  zip(root, 'klartext-template.zip', ['template', '-x', 'template/node_modules/*', 'template/dist/*', 'template/screenshots/*', '*.DS_Store']);
}

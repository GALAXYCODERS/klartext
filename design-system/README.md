# Klartext design system

The reusable library — plain CSS and ES modules, no build step. **These files are the originals**; `scripts/sync.mjs` copies them into the Claude skill.

| File | What it is | Needs |
|---|---|---|
| `klartext.css` | tokens (both themes), type scale (`kt-display`, `kt-title`, `kt-lead`, `kt-text`, `kt-meta`, `kt-source`) and all building blocks | nothing — **always include** |
| `icons.js` | line icons on a 24 grid, 1.5 px stroke, square caps | — |
| `bausteine.js` | HTML helpers: `node`, `block`, `card`, `frame`, `badge`, `terminal`, `ticks`, `stat`, `quote`, `statement`, `table`, `toggle`, `team`, `db`, `packet`, `queue`, `wires`/`wire` | `icons.js` |
| `motion.js` | motion vocabulary: `type`, `decode`, `construct`/`appear`, `select`, `travel`, `fail`, `pulse`, `fill`, `countUp` | [GSAP](https://gsap.com) ≥ 3.13 incl. MotionPath + DrawSVG |
| `feld.js` | the living shape field (WebGL2) — [API](../docs/feld.md) | nothing |
| `beispiel/index.html` | runnable demo page using everything — [live](https://galaxycoders.github.io/klartext/design-system/beispiel/) | |

## Use it

```html
<html lang="en" data-theme="nacht">           <!-- or "papier" -->
<link rel="stylesheet" href="klartext.css">
<script type="importmap">
  { "imports": {
      "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.15.0/index.js",
      "gsap/MotionPathPlugin": "https://cdn.jsdelivr.net/npm/gsap@3.15.0/MotionPathPlugin.js",
      "gsap/DrawSVGPlugin": "https://cdn.jsdelivr.net/npm/gsap@3.15.0/DrawSVGPlugin.js"
  } }
</script>
<script type="module">
  import { card } from './bausteine.js';
  import { appear } from './motion.js';
  …
</script>
```

ES modules need to be served over http (e.g. `npx serve .` or `python3 -m http.server`) — opening the demo page via `file://` will not load the modules.

Without animations you don't need GSAP: `klartext.css` and `bausteine.js` work on their own.

## Fonts

Klartext uses two voices: **Martian Mono** (uppercase titles, values, states, code, labels — the machine) and **Archivo** (everything people read — the human). Both are variable fonts under the SIL Open Font License; they are not bundled here. See [`fonts/README.md`](fonts/README.md).

## Accents

`ak-a` (light blue), `ak-b` (inverted, filled in text colour), `ak-c` (green). Red (`--alarm`) is reserved for errors and failures. Colour is never the only signal — always pair it with an icon, a name or a shape.

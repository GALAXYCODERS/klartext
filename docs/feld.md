# The field (`feld.js`) – API

The *Feld* ("field") is Klartext's living background: every 24 px cell holds a small shape (square · circle · triangle), chosen by a slowly flowing noise field. It is WebGL2, has no dependencies, glows only in the dark theme, and **reacts to events only** (a message arrives, a failure, a page change) — never to the mouse as decoration.

It is an independent implementation of the idea behind *ShapeWaves* (React Bits).

## Quick start

```html
<div class="hero" style="position: relative">…</div>
<script type="module">
  import { createFeld } from './design-system/feld.js';
  const feld = createFeld(document.querySelector('.hero'), {
    pegel: 'laut',
    maske: { text: '</>', x: 0.72, y: 0.4, size: 0.5 },
  });
</script>
```

`createFeld()` returns `null` instead of throwing when WebGL2 is missing; the container then gets the static dot grid `.kt-raster` as a fallback. Use the static grid for print/PDF as well.

## Options

| Option | Values | Default | Meaning |
|---|---|---|---|
| `pegel` | `'laut'` · `'leise'` · `'aus'` | `'leise'` | level: *laut* 40 % (titles, heroes), *leise* 14 % (behind content), *aus* off (tables, long text) |
| `maske` | `{ text, x, y, size }` or `null` | `null` | a glyph the shapes leave out (only with `laut`); `x`, `y`, `size` relative to the container |
| `ruhe` | `true` · `false` · CSS selector | `true` | quiet zones: behind text blocks the field drops to ~6 % so text always sits on calm ground; `true` uses a built-in selector list, add elements with `data-ruhe` |
| `intro` | `true` · `false` | `true` | build-up animation on start |
| `reduced` | boolean | `prefers-reduced-motion` | no flow, no pulses, no intro |

The container must be `position: relative` or `absolute`; it receives `data-feld-host`. Colours come from the CSS variables `--bg`, `--f-dot`, `--f-hi` of the container (`klartext.css`), so theme switches via `data-theme` are picked up automatically.

## Methods

| Method | What it does |
|---|---|
| `feld.puls(x, y, strength = 1, radius = 70)` | ring wave at `x, y` (CSS px relative to the container) — e.g. when a packet arrives |
| `feld.front(dir)` | rebuild as a front: `+1` from the left, `-1` from the right, `0` radial — e.g. on a page/section change |
| `feld.maskAmount = 0…1` | dissolve the glyph (tweenable with GSAP) |
| `feld.set({ pegel, maske, ruhe })` | change options at runtime |
| `feld.setModus('ruhig' \| 'still' \| 'aus')` | audience mode: calm (default) → still (no motion, pulses stay) → off. Offer a switch (the template uses the key `R`) |
| `feld.measure()` | re-measure quiet zones after layout changes |
| `feld.destroy()` | remove canvas and listeners |

`MODI` (exported) lists the audience modes.

## Connecting motion

`motion.js` emits pulses (e.g. when `travel()` delivers a packet or `fail()` hits a node). Wire them to the field once:

```js
import { onPuls } from './design-system/motion.js';
onPuls((x, y, strength, radius, el) => feld?.puls(x, y, strength, radius));
```

## Rules of thumb

- The field must never pull the eye while people read. Keep the levels low; behind lots of text use `leise` or `aus`.
- One glyph mask per screen at most, and only on title/hero areas.
- In print, PDF and without WebGL2 only the static grid `.kt-raster` is shown.

The full background (why these levels, colours per theme, tempo) is in the German rulebook [`regelwerk.md`](regelwerk.md), section *Das Feld*.

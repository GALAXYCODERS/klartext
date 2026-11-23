# Klartext presentation template

An offline HTML presentation engine in the Klartext style: a fixed 1920×1080 stage, click-by-click GSAP timelines (forwards *and* backwards), presenter view with notes and timer, overview, light/dark theme, the living shape field, PDF export and an automated QA run. The build is **one single HTML file** that runs by double-click — no server, no internet.

> UI strings, field names and demo content are German (the engine grew out of a German talk). Translations are welcome — see the issues.

## Quick start

Requires [Node.js](https://nodejs.org) 20+.

```bash
npm ci                            # dependencies
npx playwright install chromium   # once: browser for PDF and QA
npm run dev                       # live preview at http://localhost:5173
npm run build                     # → dist/presentation.html (single file, offline)
```

| Command | What it does |
|---|---|
| `npm run build` | builds `dist/presentation.html` |
| `npm run pdf` | builds and exports `dist/presentation.pdf` (paper theme, one page per slide, final state) and checks page count, overflow and console errors |
| `npm run pdf:dark` | same PDF in the dark theme |
| `npm run notizen` | speaker-notes PDF (`dist/presentation-notes.pdf`) with a thumbnail per click; fails if notes don't match the click count |
| `npm run qa` | full check: screenshot of every slide and step (1920×1080 dark, 1280×800 light), clicker forwards/backwards, keys, hash links, console errors → `screenshots/qa/` |
| `npm run contrast` | checks the colour tokens of both themes against WCAG 2.1 AA |

## Presenting

| Key | Action |
|---|---|
| → · Space · PgDn | next step (presenter clickers work) |
| ← · PgUp | previous step |
| Home · End | first / last slide |
| digits + Enter | jump to slide |
| O | overview |
| P | presenter view (second window: notes for the current click, next step, clock, timer) |
| T | theme *Nacht* (dark) ↔ *Papier* (light) |
| R | background field: calm → still → off |
| F | fullscreen |
| B · . | black screen |
| ? · H | help |

URL options: `#/3/2` = slide 3, step 2 · `?print=1` (`&theme=dark`) = print view · `?presenter=1` = presenter view.

## Make your own deck

| Path | What goes there |
|---|---|
| `content/slides.js` | all texts: `meta` (title, author, duration, parts) and one object per slide (`modul`, `titel`, `kicker`, `quelle`, `feld`, `minuten`, …) — documented at the top of the file |
| `content/regie.js` | speaker notes, **exactly one entry per click** (`zeigt` / `sagen` / `tipp`), plus `kern` and `weiter` |
| `src/slides/*.js` | one module per slide type: `render(s)` returns HTML, `build(ctx)` builds the GSAP timeline; `ctx.step()` ends a click step. Register new modules in `src/slides/index.js` |
| `src/lib/` | building blocks (`ds.js`: node, card, badge, packet, wire, table, quote …), motion vocabulary (`motion.js`), icons |
| `src/engine/` | deck, transitions (shared elements via `data-flip`), field (`feld.js`), presenter, overview, print |
| `src/styles/` | fonts, tokens (both themes), stage, components, UI, print |

A slide without `modul` uses the default build: elements with `data-step="n"` appear on click *n*.

The five demo slides show one capability each: title with field mask, a diagram with wires and packets, a quote with markers, a table that fills row by row, and a source list.

## Relationship to `design-system/`

The template ships its own copy of the building blocks, tuned for the stage: accents are named after the demo services (`svc-bestellung` = accent A, `svc-zahlung` = B, `svc-versand` = C) and the field is bound to the slide timeline. The neutral library in [`../design-system`](../design-system) uses `ak-a/b/c` and a standalone field. Moving the template onto the neutral library is planned — see the issue tracker.

## License

MIT — see [`../LICENSE`](../LICENSE). Fonts (Archivo, Martian Mono: SIL OFL 1.1) and GSAP (free GSAP license) are installed from npm and inlined at build time; they keep their own licenses.

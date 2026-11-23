# Contributing to Klartext

Thanks for helping! Klartext is small and opinionated — please read this page before opening a pull request.

## Ground rules

**The "no AI look" list is not negotiable.** A contribution that adds any of these will be asked to change:

| Not in Klartext | Instead |
|---|---|
| purple/neon gradients, glow halos, glass/blur | flat surfaces; glow only in the field on a pulse |
| rounded cards with soft shadows | hairline frames with corner squares, radius 0 (tags/toggles 2 px) |
| a kicker line above the title | orientation in a meta line (mono, uppercase); the title stands alone |
| emoji, icon tiles, gradient text | own line icons (24 grid, 1.5 px stroke, square caps, mitre joins) |
| bounce, elastic, zoom, spinning | `expo.out` to appear, `power3.inOut` to move, `power2.in` to leave |
| particles as decoration, mouse effects | the field reacts to events only |
| mono as a costume for body text | mono only for titles, values, states, code, labels |

More rules:

- **Colour means something.** Accents A/B/C mark three equal things; red (`--alarm`) is reserved for errors. Never colour alone.
- **Every motion explains something** — otherwise leave it out. At most two signature motions per moment. No step longer than 0.9 s.
- **Accessibility:** text ≥ 4.5 : 1, graphics ≥ 3 : 1 in *both* themes; respect `prefers-reduced-motion`.
- **No secrets, no e-mail addresses, no private data** in code, examples or screenshots.

The full rulebook is [`docs/regelwerk.md`](docs/regelwerk.md) (German).

## Where to change what

| You want to … | Edit | Then |
|---|---|---|
| change a token, building block, motion or the field | `design-system/` (the originals) | `npm run sync` (copies into the skill) |
| change the rulebook or presentation guide | `docs/regelwerk.md`, `docs/praesentation.md` | `npm run sync` |
| change the skill instructions | `skill/klartext-design/SKILL.md` | — |
| change the presentation engine or demo deck | `template/` | run the template checks below |
| add an example | `examples/<name>/` with a `README.md` | see [`examples/README.md`](examples/README.md) |

### Adding a building block

1. Add the CSS to `design-system/klartext.css` (use tokens, hairlines, corner squares) and the HTML helper to `bausteine.js` with a short JSDoc comment.
2. If it moves, add the motion to `motion.js` — reversible (works backwards) and print-safe (final state = `progress(1)`).
3. Show it on the demo page `design-system/beispiel/index.html`.
4. Document it in `docs/regelwerk.md` (table of building blocks) and run `npm run sync`.

## Checks before a pull request

From the repository root:

```bash
npm run check:js     # syntax of the library, skill assets and scripts
npm run sync:check   # skill is in sync with design-system/ and docs/
```

If you touched `template/`:

```bash
cd template
npm ci && npx playwright install chromium
npm run contrast     # WCAG AA for both themes
npm run qa           # every slide and step, clicker, keys, console errors
npm run pdf          # page count, nothing cut off
```

CI runs the same checks. Look at the screenshots in `template/screenshots/qa/` in both themes and hold them against the list above.

## Commits and pull requests

- Work on a branch, open a pull request against `main`.
- Commit messages in English, imperative mood (`Add queue building block`).
- Add a line to `CHANGELOG.md` under *Unreleased*.
- Code comments: new comments in English; existing German comments may stay.

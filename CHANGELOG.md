# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] – 2026-11-23

First public release.

### Added
- `design-system/`: `klartext.css` (tokens for *Nacht* and *Papier*, type scale, building blocks), `bausteine.js`, `motion.js` (GSAP motion vocabulary), `feld.js` (living WebGL2 shape field), `icons.js`, runnable demo page.
- `template/`: offline single-file HTML presentation engine (Vite + vite-plugin-singlefile, GSAP 3.15) with five neutral demo slides, presenter view, overview, themes, field modes, PDF and speaker-notes export, QA and contrast checks.
- `skill/klartext-design/`: Claude skill, packaged as `klartext-design.skill` on every release.
- Docs: rulebook and presentation guide (German), field API (English).
- CI (build, QA, contrast, sync check), GitHub Pages (demo deck + design-system page), release workflow.

[Unreleased]: https://github.com/GALAXYCODERS/klartext/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/GALAXYCODERS/klartext/releases/tag/v0.1.0

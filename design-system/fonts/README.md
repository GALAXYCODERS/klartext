# Fonts

Klartext needs two variable fonts. Both are free (SIL Open Font License 1.1) and are **not** bundled in this repository.

| Font | Role | Axes used |
|---|---|---|
| [Martian Mono](https://github.com/evilmartians/mono) | the machine: titles (uppercase), values, states, code, labels | width 75–112.5 %, weight 100–800 |
| [Archivo](https://fonts.google.com/specimen/Archivo) | the human: body text, card text, quotes | width 62–125 %, weight 100–900 |

## Online: Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Martian+Mono:wdth,wght@75..112.5,100..800&display=swap" rel="stylesheet">
```

## Offline / single file: @fontsource

```bash
npm i -D @fontsource-variable/archivo @fontsource-variable/martian-mono
```

Then declare the faces with their full width and weight ranges, e.g. (paths depend on your bundler):

```css
@font-face {
  font-family: 'Martian Mono';
  src: url('@fontsource-variable/martian-mono/files/martian-mono-latin-wdth-normal.woff2') format('woff2-variations');
  font-weight: 100 800;
  font-stretch: 75% 112.5%;
  font-display: block;
}
@font-face {
  font-family: 'Archivo';
  src: url('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-stretch: 62% 125%;
  font-display: block;
}
```

The presentation template does exactly this in [`template/src/styles/fonts.css`](../../template/src/styles/fonts.css) and inlines the fonts into the single-file build.

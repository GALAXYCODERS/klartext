---
name: klartext-design
description: Das Design-System „Klartext“ – Schwarz/Weiß wie Code und Schreibmaschine, Akzente Hellblau und Grün, Martian Mono + Archivo, Haarlinien mit Eckquadraten, getippte Titel und ein lebendes WebGL-Formen-Feld als Hintergrund. Nutze diesen Skill immer, wenn jemand etwas „im Klartext-Stil“, „mit dem Design-System Klartext“, „im Coding-/Schreibmaschinen-Look“ oder „schwarz-weiß wie Code“ haben will (auch englisch: „Klartext style“, „code/typewriter look“) – für Webseiten, HTML-Präsentationen, Landingpages, Dashboards, Poster, Handouts, Lebenslauf, Portfolio oder jedes andere visuelle Projekt, auch wenn das Wort „Klartext“ nicht fällt, aber genau dieser Look gemeint ist.
---

# Klartext – Design-System

**Idee in einem Satz:** Das Ergebnis wirkt wie ein laufendes System, das man im Klartext mitliest – Titel werden *getippt*, Werte *entschlüsselt*, Rahmen *konstruiert*, und darunter atmet ein Feld aus kleinen Formen.

„Klartext“ ist doppelt gemeint: *plaintext* (unverschlüsselt, Code) und „Klartext reden“ (ohne Schnörkel). Beides ist die Haltung. Entstanden ist das System für eine Hochschul-Präsentation (Nov. 2026); es funktioniert für Webseiten, Präsentationen und Dokumente gleichermaßen.

**Quelle, Doku und Beispiele:** <https://github.com/GALAXYCODERS/klartext> · Musterseite und Demo-Präsentation online: <https://galaxycoders.github.io/klartext/> · Fertige Präsentations-Vorlage (Engine, PDF, QA): Ordner `template/` im Repo.

Erkläre Entscheidungen kurz in der Sprache der Person, nimm ihr die Technik ab, und nenne am Ende genau einen Weg zum Anschauen (z. B. „Doppelklick auf …html“).

## Woran man Klartext erkennt

1. **Schwarz/Weiß trägt alles.** Zwei Themes: *Nacht* (Tiefschwarz, warmes Weiß – Standard) und *Papier* (mattes Papierweiß, Tinte – für helle Räume, Beamer, Druck/PDF).
2. **Farbe ist selten und bedeutet immer etwas:** Hellblau = Akzent A, Grün = Akzent C, *invertiert* (gefüllt in Textfarbe) = Akzent B, **Rot nur für Fehler/Ausfall**. Farbe nie allein – immer mit Icon, Name oder Form.
3. **Zwei Stimmen:** *Martian Mono* (Versalien) für Titel, Werte, Zustände, Code, Beschriftungen = die Maschine. *Archivo* für alles, was man lesen und verstehen soll = der Mensch.
4. **Haarlinien mit vier Eckquadraten** statt Karten mit Rundung und Schatten. Radius 0, nur Tags/Umschalter 2 px.
5. **Lebendes Formen-Feld** (Dreieck · Kreis · Quadrat im 24-px-Raster) als Hintergrund – laut auf Titel/Hero, leise hinter Inhalt, aus hinter Tabellen und Fließtext-Seiten.

## Was Klartext bewusst *nicht* macht (Anti-„KI-Look“)

| Verboten | Stattdessen |
|---|---|
| Lila/Neon-Verläufe, Glow-Halos, Glas/Blur | flache Flächen; Leuchten nur im Feld beim Puls |
| abgerundete Karten mit weichem Schatten | Haarlinienrahmen mit Eckquadraten |
| Kicker-Zeile über dem Titel | Orientierung in einer Meta-Zeile (Mono, Versalien), Titel steht allein |
| Emoji, Icon-Kacheln, Verlaufstext | eigene Linien-Icons (1,5 px, eckige Enden) |
| Bounce, Elastic, Zoom, Wirbeln | ein ruhiges Kurvenpaar, Tippen, Entschlüsseln |
| Partikel als Deko, Maus-Effekte | das Feld reagiert nur auf Ereignisse (Nachricht kommt an, Ausfall, Seitenwechsel) |
| Mono als Kostüm für Fließtext | Mono nur für Titel, Werte, Zustände, Code, Beschriftungen |

Diese Liste ist der Kern. Wenn etwas „nach Template“ aussieht, ist meist eine dieser Regeln verletzt.

## So gehst du vor

1. **Klären, was gebaut wird** (Webseite, Präsentation, Dokument, Grafik) und welches Theme passt (Nacht als Standard; Papier für Druck, helle Räume, PDF).
2. **Dateien aus `assets/` ins Projekt kopieren** – nur die, die gebraucht werden:
   - `klartext.css` – Tokens (Farben, Typo, Abstände) + Grundtypo-Klassen (`kt-display`, `kt-title`, `kt-lead`, `kt-text`, `kt-meta`, `kt-source`) + alle Bausteine. **Immer.**
   - `icons.js` – Linien-Icons (wagen, muenze, paket, warnung, uhr, schloss, pfeil, haken …).
   - `bausteine.js` – HTML-Funktionen: `node`, `block`, `card`, `frame`, `badge`, `terminal`, `ticks`, `stat`, `quote`, `statement`, `table`, `toggle`, `team`, `db`, `packet`, `queue`, `wires`/`wire`.
   - `motion.js` – Bewegungen mit GSAP: `type`, `decode`, `construct`/`appear`, `select`, `travel`, `fail`, `pulse`, `fill`, `countUp`.
   - `feld.js` – das lebende Feld (WebGL2, keine Abhängigkeiten): `createFeld(container, { pegel, maske })`.
   - `beispiel.html` – lauffähige Musterseite, die alles zusammen zeigt. Gute Vorlage zum Abwandeln.
3. **Schriften einbinden.** Online: Google Fonts (`Archivo:wdth,wght@62..125,100..900` und `Martian+Mono:wdth,wght@75..112.5,100..800`, siehe `beispiel.html`). Offline/Einzeldatei: `@fontsource-variable/archivo` und `@fontsource-variable/martian-mono` per npm, als `@font-face` mit Breiten- und Stärkebereich einbetten. Beide Schriften sind frei (OFL).
4. **GSAP** (für `motion.js`) seit 2025 inkl. aller Plugins kostenlos: per npm (`gsap`, Version fest pinnen) oder per Import-Map aus jsDelivr (Beispiel in `beispiel.html`). Ohne Animationen braucht es kein GSAP – CSS und `bausteine.js` laufen allein.
5. **Bauen nach dem Regelwerk** – Details zu Farben, Typo-Stufen, Raster, Feld, Bausteinen und Bewegung stehen in `references/regelwerk.md`. Lies es, bevor du Layout oder Animation entwirfst.
6. **Für Präsentationen (1920×1080-Bühne, Klick-Schritte, PDF)** zusätzlich `references/praesentation.md` lesen.
7. **Prüfen:** Kontraste (Text ≥ 4,5 : 1, Grafik ≥ 3 : 1 – die Tokens erfüllen das, eigene Farben nachrechnen), beide Themes ansehen, `prefers-reduced-motion` respektiert, Screenshot anschauen und gegen die Verbotsliste halten.

## Bewegung in Kürze

Jede Bewegung erklärt etwas – sonst weglassen. Ein Kurvenpaar: `expo.out` für alles, was erscheint, `power3.inOut` für alles, was sich bewegt, `power2.in` für alles, was geht. Dauern 0,18 · 0,36 · 0,6 · 0,9 · 1,4 s. Kein Schritt länger als 0,9 s (außer Zählen). **Höchstens zwei Signatur-Bewegungen pro Moment** – wenn alles tippt, entschlüsselt und pulst, wird es wieder Deko.

| Bewegung | Funktion | Bedeutung |
|---|---|---|
| Tippen | `type(tl, el)` | „Hier beginnt ein neuer Befehl“ – Titel |
| Entschlüsseln | `decode(tl, el, { to })` | ein Wert wird gemessen |
| Konstruieren | `appear` / `construct` | ein Baustein entsteht (Ecken → Linien → Fläche) |
| Markieren | `select(tl, marks)` | „diesen Begriff merken“ |
| Senden | `travel(tl, paket, route)` | Nachricht unterwegs, Ankunft pulst im Feld |
| Ausfall | `fail(tl, knoten)` | Fehler: rot, gestrichelt, kurzes Zittern |

Das Feld hört auf Pulse aus `motion.js` über `onPuls((x, y, s, r, el) => feld.puls(x, y, s, r))`.

## Häufige Fehler

- Akzentfarben als große Flächen benutzen → nur Lampe, Icon, Eckmarke, Paket, aktive Leitung.
- Rot als Hervorhebung → Rot ist exklusiv für Fehler.
- Feld zu präsent → es darf beim Lesen nie den Blick ziehen. Pegel sind bewusst niedrig (laut 40 %, leise 14 %, hinter Text praktisch aus); nicht hochdrehen. Hinter viel Text `pegel: 'leise'` oder `'aus'`. Für Zuschauer einen Schalter anbieten: `feld.setModus('ruhig' | 'still' | 'aus')`.
- Mono für Absätze → Archivo. Mono-Versalien nur kurz (Titel, Labels ≤ ~6 Wörter).
- Lange Mono-Titel zu groß → nicht kleiner machen, sondern schmaler (`kt-title--schmal`, Breite 87,5 %).
- Ohne WebGL2 wirft `new Feld` einen Fehler → immer `createFeld` nutzen (fällt auf das statische Punktraster `.kt-raster` zurück); im Druck/PDF ebenfalls nur `.kt-raster`.

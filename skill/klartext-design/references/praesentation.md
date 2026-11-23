# Klartext für HTML-Präsentationen

Die fertige Vorlage liegt im Repo <https://github.com/GALAXYCODERS/klartext> im Ordner `template/` (auch als ZIP an jedem Release). Wer eine neue Präsentation in diesem Stil bauen will, kopiert am schnellsten **diesen ganzen Ordner** und tauscht `content/slides.js`, `content/regie.js` und `src/slides/*` aus – Engine (Navigation, Klick-Schritte, Übersicht `O`, Referentenansicht `P`, Theme `T`, Feld, PDF-Export `npm run pdf`, QA `npm run qa`) ist dort fertig.

## Bühne und Technik
- Feste Bühne 1920×1080, per `transform: scale()` eingepasst (Letterboxing). Alles in px auf der Bühne; Diagramme auf dem 24-px-Raster (`g(n) = n·24`).
- Einzeldatei-Build (Vite + `vite-plugin-singlefile`), läuft offline per Doppelklick. Schriften lokal eingebettet.
- Pro Folie eine pausierte GSAP-Timeline mit Sprungmarken je Klick; vorwärts und rückwärts sauber; Druckmodus `?print=1` zeigt den Endzustand (PDF per Playwright, eine Seite pro Folie, Papier-Theme).
- Folientitel werden beim Betreten getippt (`type`), Rahmen konstruieren sich (`appear` erkennt `.fr`).
- Feld je Folie über `feld: 'laut' | 'leise' | 'aus'` und `maske: { text: '</>', x, y, size }`; Ruhezonen misst es selbst; Pulse nur beim Abspielen, nie beim Springen.
- Inversion als Stilmittel: einzelne Kernaussage-Folien im umgedrehten Theme (`.theme-invert`), höchstens drei.

## Typo-Stufen auf der Bühne (px)
| Stufe | Größe | Schrift |
|---|---|---|
| Titel XL | 120 / 0,92 | Martian Mono 112,5 % · 640 · Versalien · −0,03 em |
| Kennzahl | 112–200 | Martian Mono 250 (dünn) |
| Folientitel | 60 / 1,0 | Martian Mono 100 % · 560 · Versalien (lange Titel 87,5 % Breite) |
| Leitsatz | 72 / 1,08 | Archivo 520, gedämpfter Teil in `--ink-2` |
| Zitat | 52 / 1,2 | Archivo 420 |
| Rahmentitel | 30 | Archivo 620 |
| Fließtext | 30 (min. 28) | Archivo 400 |
| Rahmentext | 26 | Archivo 400, `--ink-2` |
| Code/Label | 20 | Martian Mono 87,5 % · 420 |
| Meta | 17 | Martian Mono · 460 · Versalien · +0,06 em |
| Quelle | 18 (min. 16) | Archivo 400, `--ink-2`, Präfix `QUELLE` in Meta |

Höchstens ~40 Wörter pro Folie; Details gehören in die Sprechernotizen.

## 4. Raster, Rahmen, Folienaufbau

- **Bühne** 1920×1080. Ränder links/rechts **96 px**, 12 Spalten à 122 px, Abstand 24 px.
- **Grundzelle 24 px** = Zellgröße des Punktfelds = Diagrammraster `g(n)`. Knoten und Leitungen liegen exakt auf den Feldzellen – das Feld ist die Zeichenfläche.
- **Abstände:** 8 · 16 · 24 · 48 · 72 · 96 px (`--sp-1 … --sp-6`). Mehr Luft über einem Block als darunter.
- **Radien:** 0 (Rahmen, Knoten) · 2 px (Tags, Umschalter). Keine Pillen.
- **Linien:** 1 px Haarlinie (`--rule`), 1,5 px Leitung, 2 px aktive Leitung. Keine Schatten – Tiefe entsteht durch `--bg-2` und Linien.

**Folienrahmen (ersetzt Kicker + alte Fußzeile):**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ KLARTEXT / DEMO            TEIL 01 · GRUNDLAGEN                 01.03 /21 │  ← Meta-Zeile, y = 48
├──────────────────────────────────────────────────────────────────────────┤  ← Haarlinie, y = 96
│                                                                          │
│ DER ONLINESHOP ALS MONOLITH▌                                             │  ← Folientitel (getippt), y = 144
│                                                                          │
│                         Inhalt (y 240 … 952)                             │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤  ← Haarlinie, y = 984
│ [VL 2 · MONOLITH]  QUELLE Vgl. Wolff (2018), S. 3–5     ||||||||¦|||····  │  ← Fußzeile, y = 1016
└──────────────────────────────────────────────────────────────────────────┘
```

- **Kopfzeile links:** Projektmarke. **Mitte:** Teil + Kapitel (Orientierung statt Kicker). **Rechts:** Foliennummer `01.03` (Teil.Folie) und Gesamtzahl.
- **Fußzeile links:** VL-Brücke als Tag, dann Quelle. **Rechts: Minuten-Lineal** – 45 Striche = 45 Minuten, abgelaufene Minuten in `--ink`, Teilgrenzen als lange Striche. Ersetzt die Fortschrittsleiste; der Zeitstrahl von Folie 2 fliegt weiterhin per Shared-Element hinein.
- Titelfolie, Spiel-Folie und Inversionsfolien laufen ohne Rahmen (`chrome: false`).

## 8. Folien-Zuordnung (Auszug)

| Folie | Feld | Besonderheit |
|---|---|---|
| 1 Titel | `laut` + Maske `</>` | Titel XL getippt, Feld baut sich radial auf; beim Weiterklicken zerfällt `</>` in drei Service-Knoten (Leitmotiv) |
| 2 Ablauf | leise | Zeitstrahl = Minuten-Lineal, fliegt in die Fußzeile |
| 3 Ausgangslage | leise | Block mit Rasterpunkten, Speicherleck in „Versand“ → Rot breitet sich aus; Terminal-Log `ERR speicherleck` |
| 5 Vergleich | leise | Block teilt sich entlang der Modulgrenzen in drei Prozesse, Speicher teilt sich mit |
| 7 Kommunikation | leise | Leitungslabels als Code, Queue puffert bei Ausfall |
| 11 Spiel | `laut` (ohne Maske) | QR im Spec-Rahmen |
| 14 Isolation | **invertiert** | Leitsatz |
| 16 otto.de | leise | drei Kennzahlen dünn 200 px, entschlüsselt |
| 20 Fazit | **invertiert**, `laut` + `</>` | Prozesse fügen sich zurück zum Block (Leitmotiv schließt) |
| 21 Quellen | aus | reine Typo, Papier-tauglich |

## 9. Technik & Grenzen

- Neue Abhängigkeit nur `@fontsource-variable/martian-mono` (Dev, gepinnt). `@fontsource/ibm-plex-mono` entfällt. GSAP-Plugins ScrambleText/SplitText sind in `gsap@3.15.0` enthalten.
- Feld: WebGL2, eine Leinwand hinter der Bühne, gemeinsam für alle Folien; Bloom über zwei halb aufgelöste Weichzeichner-Durchgänge. Wellen-Simulation auf der CPU wie im Original, als 8-Bit-Textur hochgeladen.
- Zielgerät: MacBook Pro M5 (Chrome oder Safari, Vollbild). Weil die Präsi am HDMI-Beamer im Vollbild läuft, rendert das Feld in Beamer-Auflösung; die Retina-Stufe gilt für das MacBook-Display und die Referentenansicht bleibt ohne Feld.
- Einzeldatei bleibt (geschätzt +40 KB Schrift, +10 KB Code).
- Animiert werden nur `transform`, `opacity`, `clip-path`, `background-size` – plus das Feld im eigenen Canvas.


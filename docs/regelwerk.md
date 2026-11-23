# Klartext – Regelwerk

Allgemeines Regelwerk des Design-Systems. Abschnitt 4 und Teile von 5 sind für eine 1920×1080-Bühne formuliert (Präsentation); für Webseiten gelten dieselben Verhältnisse, nur die px-Größen skalieren (siehe `kt-*`-Klassen in `assets/klartext.css`, die mit `clamp()` arbeiten). Präsentations-Spezifisches steht in `praesentation.md`.

**Akzente:** In der Microservices-Präsentation standen sie für Services (A = Bestellung, B = Zahlung, C = Versand). In anderen Projekten stehen sie für drei beliebige, gleichrangige Dinge (Bereiche, Rollen, Kategorien). Gibt es nur eins, nimm Hellblau. Klassen: `.ak-a`, `.ak-b`, `.ak-c`.

**API-Namen:** In den Tabellen unten heißen Bausteine teils noch wie in der Präsentation (`node()`, `monolithFrame()`, `svc`). In `assets/bausteine.js` heißen sie `node(name, { ak, icon, tag })`, `block()` (statt `monolithFrame`), Akzent über `ak: 'a' | 'b' | 'c'`.

## 1. Themes

| Theme | Einsatz | Charakter |
|---|---|---|
| **Nacht** (Standard im Vortrag) | Hörsaal abgedunkelt, Teams-Freigabe | Tiefschwarz, warmes Weiß, Punktfeld sichtbar |
| **Papier** (Taste `T`, Standard im PDF) | heller Raum, schwacher Beamer, Druck | E-Ink-Anmutung: mattes Papierweiß, Tinte, Punktfeld nur angedeutet |

**Inversion als Stilmittel:** Einzelne Folien kehren das Theme lokal um (Nacht → helle Folie, Papier → dunkle Folie). Sie markieren **Kernaussagen**: Folie 14 „Isolation“, Folie 20 „Fazit“. Höchstens drei Folien – sonst verliert es die Wirkung.

## 2. Farben (`assets/klartext.css`, oberer Teil)

| Token | Rolle | Nacht | Papier | Kontrast (auf Fläche) |
|---|---|---|---|---|
| `--bg` | Fläche | `#0B0B0C` | `#F1F0EB` | – |
| `--bg-2` | erhöhte Fläche (Knoten, Tabellenkopf) | `#131315` | `#FBFAF6` | – |
| `--ink` | Text, aktive Linien | `#ECEBE6` | `#0C0C0D` | 16,5 / 17,1 |
| `--ink-2` | Sekundärtext, Quellen | `#A3A29C` | `#4C4B46` | 7,7 / 7,7 |
| `--ink-3` | Leitungen, Meta ≥ 24 px, Deko | `#76756F` | `#76746D` | 4,3 / 4,1 |
| `--rule` | Haarlinien, Raster | `#2A2A2E` | `#D8D6CE` | Deko |
| `--rule-2` | Eckmarken, leere Ticks | `#46464B` | `#B3B1A8` | Deko |
| `--blau` | **Akzent A** (Team A) | `#8CCBFF` | `#1662C2` | 11,3 / 5,2 |
| `--gruen` | **Akzent C** (Team C) | `#86E0AC` | `#0A7646` | 12,4 / 5,0 |
| `--ink` als Füllung | **Akzent B** (Team B) = invertierter Knoten | Weiß gefüllt | Schwarz gefüllt | 16,5 / 17,1 |
| `--alarm` | **Ausfall** – nur für Fehler | `#FF6B4F` | `#C4351B` | 7,0 / 4,8 |
| `--select` | Editor-Markierung im Zitat | `#8CCBFF` 26 % | `#CFE3FB` | – |

**Warum Akzent B „invertiert“ statt einer dritten Farbe?** Die Vorgabe ist Schwarz/Weiß mit Hellblau und Grün. Eine dritte Akzentfarbe (früher Gelb) würde den Look verwässern. Die Umkehrung ist im Schwarz-Weiß-System selbst die stärkste dritte „Farbe“ – sofort unterscheidbar, auch für Farbenblinde und im Graustufendruck. 

**Regeln**
- Farbe trägt nie allein Bedeutung: Knoten = Statuslampe + Icon + Name (+ Füllart bei Akzent B). Nachrichten unterscheiden sich in der Form, Leitungen im Strich.
- Akzentfarben erscheinen **nur** an: Statuslampe, Icon, Eckmarken, Paket, Leitung im aktiven Zustand. Nie als Flächenfarbe großer Bereiche.
- `--alarm` ist exklusiv für Ausfälle (Fehlerzustände). Nie Deko, nie Hervorhebung.
- `npm run contrast` wird auf die neuen Tokens umgestellt (WCAG AA: Text ≥ 4,5:1, Grafik ≥ 3:1). `--ink-3` nur für Text ≥ 24 px oder Grafik.

## 3. Schrift

Zwei Familien, beide variabel, lokal eingebettet (offline):

- **Martian Mono** (variabel: Breite 75–112,5 %, Stärke 100–800) – die *Maschinen-Stimme*: Titel, Zahlen, Zustände, Code, Beschriftungen. Breit und eigenständig, nicht die übliche Plex/Space/JetBrains-Wahl. Ersetzt IBM Plex Mono.
- **Archivo** (variabel, bleibt) – die *Menschen-Stimme*: alles, was man lesen und verstehen soll.

| Stufe | Größe @ 1920×1080 | Schrift | Einsatz |
|---|---|---|---|
| Titel XL | 120 px / 0,92 | Martian Mono 112,5 % · 640 · Versalien · −0,03 em | Titelfolie, Fazit |
| Kennzahl | 200 px / 0,9 | Martian Mono 100 % · 250 (dünn) | Folie 16 (otto.de), Zähler |
| Folientitel | 60 px / 1,0 | Martian Mono 100 % · 560 · Versalien · −0,02 em | jede Folie, wird getippt |
| Leitsatz | 72 px / 1,08 | Archivo 520 · −0,02 em | Statement-Folien, gedämpfter Teil in `--ink-2` |
| Zitat | 52 px / 1,2 | Archivo 420 | Folie 4 |
| Rahmentitel | 30 px / 1,15 | Archivo 620 | Spec-Rahmen, Tabellenzellen |
| **Fließtext** | **30 px** / 1,35 (Minimum 28) | Archivo 400 | |
| Rahmentext | 26 px / 1,35 | Archivo 400, `--ink-2` | |
| Code / Leitungslabel | 20 px | Martian Mono 87,5 % · 420 | `POST /zahlungen`, `BestellungAufgegeben` |
| Meta / Beschriftung | 17 px | Martian Mono 100 % · 460 · Versalien · +0,06 em | Kopf-/Fußzeile, Zustände `OFFLINE` |
| Quelle | 18 px (Minimum 16) | Archivo 400, `--ink-2`; Präfix `QUELLE` in Meta | |

Lange deutsche Titel („Qualitätsattribute aus der Vorlesung“) laufen in Martian Mono 87,5 % Breite statt 100 % – die Breite ist Teil der Typo-Skala, nicht die Größe.

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

## 5. Das Feld (lebender Hintergrund)

Eigene Umsetzung der Idee hinter *ShapeWaves* (React Bits) in **voller Qualität**: Retina-Auflösung, volle Bildrate, Leuchten (Bloom) im dunklen Theme.

Technisch ein **WebGL2-Shader** mit drei Durchgängen (Formen → Leuchtanteil weichzeichnen → addieren), statt der React-Komponente mit WebGPU (`vgpu`). Grund ist nicht die Leistung, sondern: gleicher Look, kein React, keine Zusatzbibliothek, und es läuft auch in der Playwright-Kette (PDF, QA) und als Notfall auf jedem anderen Rechner. WebGPU brächte für diesen Shader keinen sichtbaren Unterschied. Rückfall ohne WebGL: statisches Punktmuster.

**So funktioniert es:** Die Bühne ist in 24-px-Zellen geteilt. In jeder Zelle sitzt eine Form – Dreieck, Kreis oder Quadrat –, gewählt von einem langsam fließenden Rauschfeld (fbm-Perlin). Dadurch wandern sanfte „Wellen“ aus Formwechseln über die Fläche. Zum Rand hin blendet das Feld aus (Vignette).

| Parameter | Wert | Grund |
|---|---|---|
| Zellgröße | 24 px (Bühne) | = Diagrammraster |
| Formgröße | 0,62 der Zelle | ruhiger als das Original (0,75) |
| Tempo | 0,35 Inhaltsfolien · 0,6 Titel/Fazit | Teams-Übertragung (hybride Vorlesung) komprimiert schnelles Flimmern zu Matsch – im Saal selbst ginge mehr |
| Farbe Nacht | Punkte `#7C7C80` (über Pegel abgedunkelt) → Puls `#F2F1EC` | |
| Farbe Papier | Punkte `#A9A79E` → Puls `#1A1A1A` | |
| Leuchten | Stärke 0,35–0,4, nur Nacht | Nur helle Formen (Puls, Aufbau-Front) glühen; ruhende Punkte nicht. Auf Papier wäre Leuchten falsch herum → aus |
| Bildrate / Auflösung | volle Bildrate (bis 120 Hz), Retina ×2 | MacBook Pro M5; Feld rendert nur, solange es sich bewegt |

> **Nachgeschärft 04.11.2026** (Rückmeldung aus dem Praxiseinsatz: Feld lenkt beim Lesen ab): Pegel deutlich gesenkt, Fluss stark verlangsamt, Formen kleiner, kaum Leuchten. Zusätzlich ein Modus für Zuschauer (`feld.setModus()`, im Vortrag Taste `R`): Hintergrund ruhig → still (keine Bewegung, Pulse bleiben) → aus.

**Pegel pro Folie** (Feld `feld` in der Folien-/Seitenkonfiguration):
- `laut` – 40 % Stärke, langsamer Fluss, optional **Masken-Text** (`maske` in der Folien-/Seitenkonfiguration): Die Form-Zellen sparen eine Glyphe aus (Titelfolie `</>`, Fazit `</>`). Auf der Spiel-Folie ist das Feld laut, aber ohne Maske – dort ist kein freier Platz für die Glyphe.
- `leise` (Standard) – 14 % Stärke, sehr langsamer Fluss, dazu **Ruhezonen**: Hinter Textblöcken ist das Feld praktisch aus (6 %), damit Text immer auf ruhigem Grund steht. Das Feld misst die Textblöcke selbst (Endzustand der Folie); einzelne Elemente lassen sich mit `data-ruhe` dazunehmen, `ruhe: false` schaltet es je Folie ab.
- `aus` – Tabellen, Quellenverzeichnis.

**Das Feld reagiert – aber nur auf die Folie, nie auf Deko:**
- `feld.puls(x, y)` – Ringwelle, wenn ein Paket ankommt oder ein Service ausfällt (Formen „kippen“ kurz eine Stufe weiter und leuchten auf).
- **Folienwechsel:** Die Formen bauen sich als Front neu auf – vorwärts von links nach rechts, rückwärts von rechts nach links (0,9 s).
- Maus/Clicker: im Vortrag keine Mausreaktion. Optional `M` für Maus-Wellen (nett beim Üben, aus im Vortrag).

**Druck & Barrierefreiheit:** Im PDF steht ein statisches, sehr helles Punktmuster (kein WebGL). Bei `prefers-reduced-motion` steht das Feld still, Pulse entfallen. Referentenansicht ohne Feld.

## 6. Bausteine

API bleibt kompatibel (`node()`, `db()`, `packet()` … in `assets/bausteine.js`), damit die 21 Folien kaum Code-Änderungen brauchen. Neu: `terminal()`, `ticks()`, `frame()`.

| Baustein | Neues Aussehen | Zustände |
|---|---|---|
| **Prozess** (Service-Knoten) `node()` | Rechteck `--bg-2`, 1 px Rahmen, 4 Eckquadrate 6 px; Kopfzeile Mono `SVC · BESTELLUNG` mit **Statuslampe** (8 px Quadrat in Service-Farbe); darunter Icon 40 px + Name Archivo 30 px. Zahlung: komplett invertiert. | `--mono` (grau, ohne Lampe) · `--aktiv` (Lampe blinkt, Rahmen `--ink`) · `--down` (Rahmen gestrichelt `--alarm`, Lampe rot, Label `ERR 503 · OFFLINE`, Inhalt halbtransparent) |
| **Block** (Monolith) `monolithFrame()` | Fläche mit **Rasterpunkten** (Halbton, 8 px Teilung, `--ink-3`) – das Material „ungeteilt“. Module darin als gestrichelte Bereiche. | `--down`: Punkte färben sich von der Fehlerstelle aus rot (Ausbreitung) |
| **Speicher** (Datenbank) `db()` | Isometrische Linienzeichnung, drei gestapelte Platten (wie die Explosionszeichnung in Referenz 4); oberste Platte trägt das Speichermodell: Raster = Tabelle, Zeilen = Dokument, Schlüssel = Key-Value | `leer` gestrichelt |
| **Paket** `packet()` | Anfrage = gefülltes Quadrat 14 px, Event = Raute 16 px, Farbe = Absender; Spur aus drei kleiner werdenden Quadraten dahinter | Label als Code: `POST /zahlungen`, `BestellungAufgegeben` |
| **Leitung** `wire()` | synchron = durchgezogen 1,5 px, asynchron = Strich 6/6, „fließt“; Label in Code-Schrift an der Leitung | `live` (2 px, `--ink`) · `error` (`--alarm`, Kreuzmarke in der Mitte) |
| **Queue** `queue()` | Fächerreihe `[■][■][ ][ ]` in Haarlinien, Kopf `QUEUE · 2/4` | Fächer füllen sich einzeln |
| **Spec-Rahmen** (ersetzt Karte) `card()` | Haarlinienrahmen mit Eckquadraten; Nummer oben links in Martian Mono dünn 40 px (nur wo die Reihenfolge zählt, z. B. Merkmale 01–09); Titel + Text | neutral · `svc` (Eckmarken in Service-Farbe) · `error` · `quiet` (nur Eckmarken, keine Linien) |
| **Tabelle** `table()` | Kopf in Meta-Schrift, Zeilen durch Haarlinien getrennt, erste Spalte Mono | Zeilen erscheinen einzeln |
| **Zitat** `quote()` | Archivo 52 px; Schlüsselbegriffe `[[…]]` werden wie im Editor **markiert** (Auswahl-Hintergrund läuft von links nach rechts) | |
| **Kennzahl** `stat()` | Martian Mono dünn 200 px, Einheit 80 px; darunter ein Tick-Lineal | zählt hoch, Ziffern werden entschlüsselt |
| **Tick-Lineal** `ticks()` (ersetzt `meter()`) | 60 senkrechte Striche, gefüllte in `--ink`, leere in `--rule-2`; Wert rechts in Mono | `--f` 0…1 |
| **Terminal** `terminal()` *(neu)* | Eingabezeile `$ deploy shop --all` mit Cursor, darunter Log-Zeilen `12:04:31  versand   ERR  speicherleck` | Zeilen werden getippt; Zustandswort farbig (`OK` grün, `ERR` rot) |
| **Leitsatz** `statement()` | Archivo 72 px, gedämpfter Teil in `--ink-2`; oft auf Inversionsfolie | |
| **Umschalter** `toggle()` | Segmente in Mono `ONLINEHÄNDLER │ START-UP`, aktives Segment invertiert | |
| **Tag** `badge()` | Mono-Versalien 16 px in 1-px-Rahmen, Radius 2 | neutral · `error` · `svc` (Lampe davor) |
| **Team** `team()` | Mono-Kästchen `A1 A2 A3` mit Lampe in Teamfarbe | |
| **QR** `qr()` | Code mit Eckmarken, darunter `scan_` mit Cursor | Platzhalter gestrichelt |
| **Icons** `icons.js` | neu gezeichnet: 24er-Raster, 1,5 px, **eckige Enden**, Gehrung – technisch statt freundlich | |

## 7. Bewegung

**Ein Kurvenpaar, fünf Dauern:**

| Token | Wert | Wofür |
|---|---|---|
| `ease.ein` | `expo.out` | alles, was erscheint |
| `ease.weg` | `power3.inOut` | alles, was sich bewegt (Flip, Reisen) |
| `ease.aus` | `power2.in` | alles, was geht (schneller als Erscheinen) |
| `ease.tick` | `steps(n)` / `none` | Tippen, Ticks, Lampen |
| `d.1 … d.5` | 0,18 · 0,36 · 0,6 · 0,9 · 1,4 s | Zustand · UI · Erscheinen · Reisen · Zählen |

Kein `back`, `elastic`, `bounce`. Kein Schritt dauert länger als 0,9 s (Ausnahme Zählen/Füllen), damit der Clicker sich sofort anfühlt. Alles bleibt an der Folien-Timeline und läuft rückwärts sauber.

**Sechs Signatur-Bewegungen** (`assets/motion.js`) – jede erklärt etwas:

| Bewegung | Was passiert | Bedeutung |
|---|---|---|
| **Tippen** `type(tl, el)` | Folientitel erscheint Zeichen für Zeichen mit Block-Cursor `▌`, 22 ms/Zeichen, höchstens 0,55 s; Cursor blinkt zweimal und erlischt. Rückwärts: schnelles Löschen. | „Hier beginnt ein neuer Befehl.“ |
| **Entschlüsseln** `decode(tl, el)` | Mono-Werte laufen durch Zeichen `░▒▓01/<>` und rasten ein (GSAP ScrambleText, seit 2025 kostenlos) | Werte, Zustände, Zahlen „werden gemessen“ |
| **Konstruieren** `construct(tl, frame)` | erst die vier Eckquadrate (0,18 s), dann ziehen sich die Haarlinien dazwischen (0,36 s), dann gleitet der Inhalt 8 px hoch | jeder Rahmen/Knoten „wird gebaut“ |
| **Markieren** `select(tl, marks)` | Editor-Auswahl läuft hinter Schlüsselbegriffen entlang | „Diesen Begriff merken“ |
| **Senden** `travel(tl, packet, route)` | Paket fährt mit Spur; Ankunft → Lampe des Ziels blinkt + `feld.puls` | Nachricht unterwegs, synchron vs. asynchron |
| **Ausfall** `fail(tl, node)` | Lampe → rot, zwei Frames Zittern (±3 px, `steps`), Rahmen wird gestrichelt, Feld-Puls; im Monolith breitet sich Rot über die Rasterpunkte aus | Fehler, Ausbreitung, Isolation |

Dazu bleiben `travel`, `pulse`, `colorize`, `fill`, `countUp`, `swap` und die Shared-Element-Flüge (Flip) – nur im neuen Look.

**Folienwechsel:** alter Inhalt blendet in 0,25 s aus (4 px hoch), das Feld baut sich als Front neu auf, der neue Titel wird getippt, Rahmen konstruieren sich gestaffelt (0,04 s). Gemeinsame Objekte fliegen weiter.

**Höchstens zwei Signatur-Bewegungen pro Klick.** Wenn alles tippt, entschlüsselt und pulsiert, wird es wieder Deko.


// ─────────────────────────────────────────────────────────────────────────────
//  INHALTE DER PRÄSENTATION
//  Hier stehen alle Texte und Quellenzeilen. Sprechernotizen: content/regie.js.
//  Texte ändern = nur diese Datei bearbeiten. Animationen liegen in src/slides/.
//
//  Felder je Folie:
//    id        eindeutiger Name (keine Leerzeichen)
//    modul     welche Animationsdatei in src/slides/ benutzt wird (sonst: Standard-Aufbau)
//    teil      id eines Eintrags aus meta.teile (für das Minuten-Lineal) – leer = kein Lineal
//    kicker    Kapitel – steht in der Kopfzeile (Mitte)
//    titel     Folienüberschrift
//    quelle    Quellenzeile unten links
//    vl        kleine Bezugs-Tags unten links, z. B. ['Kapitel 2 · Daten']
//    sprecher  wer spricht (optional, erscheint in der Referentenansicht)
//    minuten   geplante Redezeit (für den Timer in der Referentenansicht)
//    (Sprechernotizen stehen Klick für Klick in content/regie.js)
//    druck     welche Schritte als eigene PDF-Seite gedruckt werden (Standard: nur der Endzustand)
//    invert    true = Folie im umgedrehten Theme (nur für Kernaussagen, höchstens drei Folien)
//    feld      lebender Hintergrund: 'laut' | 'leise' (Standard) | 'aus' (Tabellen, Quellen)
//    maske     nur bei 'laut': Glyphe, die das Feld ausspart, z. B. { text: '</>', x: 0.5, y: 0.45, size: 0.5 }
// ─────────────────────────────────────────────────────────────────────────────

export const meta = {
  kopfzeile: 'Klartext · Präsentations-Vorlage',
  titel: 'Klartext',
  untertitel: 'Präsentationen, die wie ein laufendes System wirken – offline, als eine einzige HTML-Datei.',
  autor: 'Dein Name',
  anlass: 'Demo-Folien',
  datum: '2026',
  dauerMinuten: 10,
  teile: [
    { id: 'bausteine', nummer: '01', label: 'Bausteine', minuten: 6 },
    { id: 'werkzeuge', nummer: '02', label: 'Werkzeuge', minuten: 4 },
  ],
};

// Fünf Demo-Folien – jede zeigt eine Fähigkeit der Vorlage. Zum Loslegen: Texte hier ersetzen,
// Folien löschen oder neue Module in src/slides/ anlegen. Notizen dazu: content/regie.js.
export const slides = [
  {
    id: 'titel',
    modul: 'titel',
    chrome: false,
    feld: 'laut',
    maske: { text: '</>', x: 0.3, y: 0.36, size: 0.42 },
    minuten: 1,
  },
  {
    id: 'diagramm',
    modul: 'diagramm',
    teil: 'bausteine',
    kicker: 'Diagramm · Leitungen und Pakete',
    titel: 'Ein Eingang statt Kabelsalat',
    quelle: 'Eigene Darstellung (Demo-Inhalt der Vorlage).',
    vl: ['node() · wire()', 'travel() · decode()'],
    minuten: 3,
    karten: [
      { titel: 'Gateway', text: 'Einziger Zugang von außen: nimmt Anfragen an und verteilt sie an die richtigen Dienste.' },
      { titel: 'Registry', text: 'Dienste melden sich beim Start an – so findet das Gateway auch neue Instanzen.' },
    ],
    registry: [
      ['Bestellung #1', '10.0.1.4'],
      ['Zahlung #1', '10.0.2.3'],
      ['Versand #1', '10.0.3.2'],
      ['Versand #2', '10.0.3.7'],
    ],
  },
  {
    id: 'zitat',
    modul: 'zitat',
    teil: 'bausteine',
    kicker: 'Zitat · Markieren',
    titel: 'Bewegung bedeutet etwas',
    quelle: 'Klartext-Regelwerk, Abschnitt „Bewegung“ (docs/regelwerk.md).',
    minuten: 3,
    zitat: {
      text: '„Jede Bewegung [[erklärt etwas]] – sonst weglassen. Höchstens [[zwei Signaturen]] pro Moment, sonst wird es [[wieder Deko]].“',
      quelle: 'Klartext-Regelwerk (2026).',
    },
    karten: [
      { label: 'Tippen', titel: '„Hier beginnt ein neuer Befehl.“', text: 'Titel werden beim Betreten der Folie getippt.' },
      { label: 'Senden', titel: '„Eine Nachricht ist unterwegs.“', text: 'Pakete wandern über Leitungen; die Ankunft pulst im Feld.' },
    ],
    kern: 'Kern: Bewegung erklärt',
    leitsatz: 'Schwarz und Weiß tragen alles – <em>Farbe und Bewegung bedeuten etwas.</em>',
  },
  {
    id: 'tabelle',
    modul: 'tabelle',
    feld: 'aus',
    teil: 'werkzeuge',
    kicker: 'Tabelle · Schritt für Schritt',
    titel: 'Was die Vorlage mitbringt',
    quelle: 'Alle Tasten auch mit ? in der Präsentation.',
    vl: ['npm run qa prüft jede Taste'],
    minuten: 2.5,
    rasterTitel: 'Fähigkeiten',
    raster: [
      { kategorie: 'Navigation', attribute: ['Übersicht', 'Hash-Links'] },
      { kategorie: 'Vortrag', attribute: ['Referentenansicht', 'Theme', 'Hintergrund'] },
      { kategorie: 'Ausgabe', attribute: ['PDF', 'Notizen-PDF'] },
    ],
    kopf: ['Fähigkeit', 'So geht es', 'Wofür'],
    zeilen: [
      ['Übersicht', 'Taste O: alle Folien als Raster', 'schnell springen, auch bei Rückfragen'],
      ['Referentenansicht', 'Taste P: Notizen, Timer, nächster Klick', 'zweites Fenster, läuft synchron'],
      ['Theme', 'Taste T: Nacht ↔ Papier', 'Papier für helle Räume und Beamer'],
      ['Hintergrund', 'Taste R: ruhig · still · aus', 'Rücksicht auf empfindliche Zuschauer'],
      ['PDF', 'npm run pdf: eine Seite je Folie', 'echter Text, Endzustand jeder Folie'],
    ],
    schluss: 'Eine Datei, kein Server – <em>läuft per Doppelklick offline.</em>',
  },
  {
    id: 'quellen',
    modul: 'quellen',
    feld: 'aus',
    kicker: 'Quellen',
    titel: 'Quellen und Werkzeuge',
    minuten: 0.5,
    eintraege: [
      ['GSAP (2025):', 'GreenSock Animation Platform 3.15, kostenlos inkl. aller Plugins, https://gsap.com.'],
      ['Omnibus-Type (2017):', 'Archivo, Schriftfamilie unter SIL Open Font License 1.1, https://fonts.google.com/specimen/Archivo.'],
      ['Evil Martians (2023):', 'Martian Mono, Schriftfamilie unter SIL Open Font License 1.1, https://github.com/evilmartians/mono.'],
      ['React Bits (2025):', 'ShapeWaves – Vorbild für die Idee des Formen-Felds; Klartext setzt sie eigenständig in WebGL2 um, https://reactbits.dev.'],
      ['Vite (2026):', 'Build-Werkzeug, mit vite-plugin-singlefile zu einer einzigen HTML-Datei gebündelt, https://vite.dev.'],
    ],
    hinweis: 'Hinweis: Diese Vorlage entstand mit Unterstützung von Claude (Anthropic).',
  },
];

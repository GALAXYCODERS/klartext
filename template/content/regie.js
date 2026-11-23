// ─────────────────────────────────────────────────────────────────────────────
//  REGIE-NOTIZEN – Spickzettel zum freien Sprechen, Klick für Klick.
//  Erscheinen in der Referentenansicht (Taste P, aktueller Klick hervorgehoben)
//  und in der Notizen-PDF fürs iPad (npm run notizen).
//
//  Je Folie (Schlüssel = id aus content/slides.js):
//    kern      die eine Botschaft der Folie (wenn sonst alles weg ist: das sagen)
//    schritte  GENAU so viele Einträge, wie die Folie Schritte hat:
//              [0] = was beim Erscheinen der Folie zu sehen ist (kein Klick)
//              [1] = 1. Klick, [2] = 2. Klick, …   (npm run notizen prüft die Anzahl)
//      zeigt   was auf der Folie passiert – die Animation, auf die man zeigen kann
//      sagen   Stichworte (keine Sätze zum Ablesen); **fett** = Schlüsselwort
//      tipp    optional: Regie-Hinweis (zeigen, Pause, Frage ans Publikum …)
//    weiter    Überleitung – der letzte Satz, bevor man zur nächsten Folie klickt
//    beleg     optional: Quelle für Rückfragen
// ─────────────────────────────────────────────────────────────────────────────

export const regie = {
  titel: {
    kern: 'Klartext zeigt Inhalte wie ein laufendes System, das man im Klartext mitliest.',
    schritte: [
      {
        zeigt: 'Das Feld baut sich auf und spart „</>“ aus, der Titel wird getippt; rechts steht ein grauer Block.',
        sagen: ['Begrüßung, Thema in einem Satz', 'Der graue Block: **ein Monolith** – alles in einem Stück'],
        tipp: 'Ruhig anfangen, erst nach dem ersten Satz klicken.',
      },
      {
        zeigt: 'Die Glyphe löst sich auf, Risse laufen durch den Block, er zerfällt in drei farbige Module; ein Paket wandert.',
        sagen: ['Drei Module, drei Akzente: **Hellblau · invertiert · Grün**', 'Pakete sind **Nachrichten** zwischen den Modulen'],
      },
    ],
    weiter: 'Wie so ein Diagramm Schritt für Schritt entsteht …',
  },

  diagramm: {
    kern: 'Diagramme entstehen Klick für Klick – jede Bewegung erklärt einen Gedanken.',
    schritte: [
      { zeigt: 'Kabelsalat: Browser und App sind direkt mit jedem Dienst verbunden; roter Hinweis.', sagen: ['Jeder Client kennt **jeden Dienst**', 'Rot heißt immer: **Fehler oder Problem**'] },
      { zeigt: 'Das Gateway schiebt sich dazwischen, die Leitungen ordnen sich.', sagen: ['**Ein Eingang** statt vieler Leitungen'] },
      {
        zeigt: 'Registry erscheint, eine neue Instanz startet und meldet sich an; ihre Adresse wird „entschlüsselt“.',
        sagen: ['Neue Instanz **meldet sich selbst an**', 'Entschlüsseln = ein Wert wird gemessen'],
        tipp: 'Auf die Adresse zeigen, während sie sich entschlüsselt.',
      },
      { zeigt: 'Das Gateway fragt die Registry und schickt die Anfrage an die neue Instanz; zwei Karten erscheinen.', sagen: ['Anfrage geht an **Instanz #2**', 'Karten fassen zusammen'] },
    ],
    weiter: 'Bewegung ist hier nie Deko – das steht auch im Regelwerk.',
  },

  zitat: {
    kern: 'Jede Bewegung erklärt etwas – sonst weglassen.',
    schritte: [
      { zeigt: 'Das Zitat erscheint ruhig.', sagen: ['Ein Satz aus dem **Regelwerk**'] },
      { zeigt: 'Drei Begriffe werden nacheinander unterstrichen.', sagen: ['**erklärt etwas**', '**zwei Signaturen**', '**wieder Deko**'] },
      { zeigt: 'Zwei Karten (Tippen, Senden) und ein gemeinsamer Kern in der Mitte.', sagen: ['Zwei Signatur-Bewegungen als Beispiel', 'gemeinsamer Kern: **Bewegung erklärt**'] },
      { zeigt: 'Der Leitsatz erscheint.', sagen: ['Schwarz/Weiß trägt – Farbe und Bewegung **bedeuten** etwas'] },
    ],
    weiter: 'Was die Vorlage sonst noch mitbringt …',
  },

  tabelle: {
    kern: 'Die Vorlage bringt alles für den Vortrag mit – von der Übersicht bis zum PDF.',
    schritte: [
      { zeigt: 'Links das Raster der Fähigkeiten, rechts der Tabellenkopf.', sagen: ['Drei Gruppen: **Navigation · Vortrag · Ausgabe**'] },
      { zeigt: 'Zeile „Übersicht“, im Raster leuchtet sie auf.', sagen: ['Taste **O**: alle Folien'] },
      { zeigt: 'Zeile „Referentenansicht“.', sagen: ['Taste **P**: Notizen und Timer im zweiten Fenster'] },
      { zeigt: 'Zeile „Theme“.', sagen: ['Taste **T**: Nacht oder Papier'] },
      { zeigt: 'Zeile „Hintergrund“.', sagen: ['Taste **R**: Feld ruhig, still oder aus'] },
      { zeigt: 'Zeile „PDF“.', sagen: ['**npm run pdf**: eine Seite je Folie'] },
      { zeigt: 'Der Schlusssatz erscheint.', sagen: ['Eine Datei, **läuft offline**'] },
    ],
    weiter: 'Zum Schluss die Quellen.',
  },

  quellen: {
    kern: 'Quellen gut lesbar, Feld aus.',
    schritte: [{ zeigt: 'Quellenverzeichnis, statisch.', sagen: ['Danke – **Fragen?**'] }],
    weiter: '',
  },
};

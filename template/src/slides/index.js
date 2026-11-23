// Registry: Name in content/slides.js (Feld `modul`) → Animationsdatei.
// Neue Folie: Datei in src/slides/ anlegen (render + build), hier eintragen, in content/slides.js benutzen.
import titel from './titel.js';
import diagramm from './diagramm.js';
import zitat from './zitat.js';
import tabelle from './tabelle.js';
import quellen from './quellen.js';

export const modules = { titel, diagramm, zitat, tabelle, quellen };

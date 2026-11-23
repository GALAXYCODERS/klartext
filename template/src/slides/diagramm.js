import './diagramm.css';
import { node, badge, card, wires, wire, packet, packetLabel, nodeAnchor, g, esc } from '../lib/ds.js';
import { appear, vanish, drawWire, travel, hideInitially, decode } from '../lib/motion.js';

// Diagramm-Folie: erst Kabelsalat (jeder Client kennt jeden Service), dann ein Eingang (Gateway).
// Eine neue Instanz meldet sich bei der Registry an und bekommt Last. Zeigt node, wire, packet, badge, decode.
const CL = { browser: [g(5), g(13)], app: [g(5), g(19)] };
const GW = [g(26), g(15) + 12]; // md, Mitte auf Höhe zwischen den Clients
const RG = [g(26), g(24)]; // Registry (md)
const SV = { bestellung: [g(52), g(12)], zahlung: [g(52), g(16)], versand: [g(52), g(20)], versand2: [g(52), g(24)] };
const ca = (k, side) => nodeAnchor(...CL[k], 'sm', side);
const sa = (k, side) => nodeAnchor(...SV[k], 'sm', side);
const ga = (side) => nodeAnchor(...GW, 'md', side);
const ra = (side) => nodeAnchor(...RG, 'md', side);
const SERVICES = ['bestellung', 'zahlung', 'versand'];

export default {
  render(s) {
    const mess = ['browser', 'app']
      .flatMap((c) => SERVICES.map((k) => wire([ca(c, 'r'), sa(k, 'l')], { cls: 'w-mess' })))
      .join('');
    const inn = ['browser', 'app'].map((c) => wire([ca(c, 'r'), ga('l')], { curve: true, cls: 'w-in' })).join('');
    const out = SERVICES.map((k) => wire([ga('r'), sa(k, 'l')], { curve: true, cls: 'w-out' })).join('');
    const out2 = wire([ga('r'), sa('versand2', 'l')], { curve: true, cls: 'w-out2' });
    const reg = wire([ga('b'), ra('t')], { kind: 'async', cls: 'w-reg' });
    const ping = [sa('versand2', 'b'), [sa('versand2', 'b')[0], ra('r')[1] + 64], [ra('r')[0] - 40, ra('r')[1] + 64], [ra('r')[0] - 40, ra('b')[1]]];
    const rows = s.registry
      .map(([n, ip], i) => `<div class="reg-row ${i === 3 ? 'reg-new' : ''}"><span>${esc(n)}</span><span>${esc(ip)}</span></div>`)
      .join('');
    return `
      <div class="scene">
        ${wires(mess + inn + out + out2 + reg + wire(ping, { kind: 'async', cls: 'w-ping' }))}
        ${node('browser', { x: CL.browser[0], y: CL.browser[1], size: 'sm', label: 'Browser' })}
        ${node('app', { x: CL.app[0], y: CL.app[1], size: 'sm', label: 'App' })}
        ${node('gateway', { x: GW[0], y: GW[1], label: 'API-Gateway', sub: 'ein Eingang', cls: 'gw' })}
        ${node('registry', { x: RG[0], y: RG[1], label: 'Registry', sub: 'wo läuft was?', cls: 'rg' })}
        <div class="reg-list" style="left:${RG[0] - 312}px;top:${RG[1] - 6}px">${rows}</div>
        ${SERVICES.map((k) => node(k, { x: SV[k][0], y: SV[k][1], size: 'sm', sub: '#1' })).join('')}
        ${node('versand', { x: SV.versand2[0], y: SV.versand2[1], size: 'sm', sub: '#2', flip: false, cls: 'v2' })}
        ${badge('neu gestartet', { icon: 'plus', x: SV.versand2[0] + 114, y: SV.versand2[1] - 44, center: true, cls: 'b-new' })}
        ${badge('Client kennt jeden Service', { tone: 'error', icon: 'warnung', x: g(30), y: g(10) + 12, center: true, cls: 'b-mess' })}
        ${packet({ svc: 'versand', cls: 'p-ping' })}
        ${packetLabel('Versand #2 · 10.0.3.7', 'p-ping-l')}
        ${packet({ cls: 'p-ask' })}
        ${packet({ cls: 'p-ans' })}
        ${packet({ cls: 'p-req' })}
        <div class="gw-cards">${s.karten.map((c, i) => card({ title: c.titel, text: c.text, cls: `gw-c gw-c${i}` })).join('')}</div>
      </div>`;
  },

  build({ tl, q, q1, step }) {
    hideInitially(q('.w-in, .w-out, .w-out2, .w-reg, .w-ping'), q1('.gw'), q1('.rg'), q1('.reg-list'), q1('.v2'), q('.badge'), q('.gw-c'));
    hideInitially(q1('.reg-new'));

    // Schritt 0: Kabelsalat – jeder Client spricht jeden Service direkt an
    drawWire(tl, q('.w-mess'), { duration: 0.6, stagger: 0.05, pos: 0.3 });
    appear(tl, q1('.b-mess'), { y: 6, pos: '-=0.2' });
    step();

    // Schritt 1: Das Gateway schiebt sich dazwischen – ein Eingang
    vanish(tl, [...q('.w-mess'), q1('.b-mess')], { duration: 0.35 });
    appear(tl, q1('.gw'), { y: 0, x: -24 });
    drawWire(tl, q('.w-in, .w-out'), { duration: 0.5, stagger: 0.06, pos: '-=0.2' });
    step();

    // Schritt 2: Neue Versand-Instanz startet und meldet sich bei der Registry an
    appear(tl, [q1('.rg'), q1('.reg-list')], { y: 12, stagger: 0.08 });
    drawWire(tl, q1('.w-reg'), { duration: 0.4, pos: '-=0.2' });
    appear(tl, [q1('.v2'), q1('.b-new')], { y: 12, stagger: 0.1 });
    drawWire(tl, q1('.w-ping'), { duration: 0.5 });
    const ping = [sa('versand2', 'b'), [sa('versand2', 'b')[0], ra('r')[1] + 64], [ra('r')[0] - 40, ra('r')[1] + 64], [ra('r')[0] - 40, ra('b')[1]]];
    travel(tl, q1('.p-ping'), ping, { followers: [q1('.p-ping-l')], duration: 1.2 });
    appear(tl, q1('.reg-new'), { y: 6, x: 0 });
    decode(tl, q1('.reg-new span:last-child'), { pos: '<' }); // neue Adresse wird „gemessen“
    step();

    // Schritt 3: Gateway fragt die Registry und verteilt die Anfrage an Instanz #2
    travel(tl, q1('.p-ask'), [ga('b'), ra('t')], { duration: 0.5 });
    travel(tl, q1('.p-ans'), [ra('t'), ga('b')], { duration: 0.5 });
    drawWire(tl, q1('.w-out2'), { duration: 0.5, pos: '<' });
    travel(tl, q1('.p-req'), [ca('browser', 'r'), ga('l'), ga('r'), sa('versand2', 'l')], { duration: 1.3 });
    vanish(tl, q1('.b-new'), { pos: '<' });
    appear(tl, q('.gw-c'), { y: 16, stagger: 0.12, pos: '-=0.4' });
    step();
  },
};

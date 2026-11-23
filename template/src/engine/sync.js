// Verbindung Vortragsfenster ↔ Referentenansicht.
// Zwei Wege parallel, weil file:// (Doppelklick) und http:// sich unterschiedlich verhalten:
//  1) postMessage über die Fensterreferenz (funktioniert immer, auch per Doppelklick)
//  2) BroadcastChannel (falls verfügbar). Doppelte Nachrichten werden per ID verworfen.
const CHANNEL = 'klartext-presentation';

export function createSync(onMessage) {
  const seen = new Set();
  const peers = new Set();
  let bc = null;

  const handle = (d, source) => {
    if (!d || d.__ch !== CHANNEL || seen.has(d.id)) return;
    seen.add(d.id);
    if (seen.size > 500) seen.delete(seen.values().next().value);
    if (source && source !== window) peers.add(source);
    onMessage(d);
  };

  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (e) => handle(e.data);
  } catch {
    bc = null;
  }
  window.addEventListener('message', (e) => handle(e.data, e.source));

  return {
    addPeer(w) {
      if (w) peers.add(w);
    },
    hasPeers() {
      for (const w of peers) if (!w.closed) return true;
      return false;
    },
    send(msg) {
      const d = { ...msg, __ch: CHANNEL, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
      seen.add(d.id);
      try {
        bc?.postMessage(d);
      } catch {
        /* egal */
      }
      for (const w of peers) {
        try {
          if (w.closed) peers.delete(w);
          else w.postMessage(d, '*');
        } catch {
          peers.delete(w);
        }
      }
    },
  };
}

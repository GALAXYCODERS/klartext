// localStorage kann in privaten Fenstern oder bei file:// fehlen – immer abgesichert.
export const store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(`klartext:${key}`);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`klartext:${key}`, JSON.stringify(value));
    } catch {
      /* egal */
    }
  },
};

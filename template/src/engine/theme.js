import { store } from './store.js';

export function getTheme() {
  return document.documentElement.dataset.theme || 'dark';
}
export function setTheme(theme, { persist = true } = {}) {
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  if (persist) store.set('theme', getTheme());
}
export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  return getTheme();
}
export function initTheme(params) {
  const forced = params.get('theme');
  if (forced) return setTheme(forced, { persist: false });
  setTheme(store.get('theme', 'dark'), { persist: false });
}

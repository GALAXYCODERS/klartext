import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/ui.css';
import './styles/print.css';

import { initTheme, setTheme } from './engine/theme.js';
import { renderMain } from './engine/app.js';
import { renderPresenter } from './engine/presenter.js';
import { renderPrint } from './engine/print.js';

const params = new URLSearchParams(location.search);
const app = document.getElementById('app');

if (params.has('print')) {
  // PDF: helles Theme als Standard, ?print=1&theme=dark für die dunkle Variante
  setTheme(params.get('theme') || 'light', { persist: false });
  renderPrint(app);
} else if (params.has('presenter')) {
  initTheme(params);
  renderPresenter(app);
} else {
  initTheme(params);
  renderMain(app);
}

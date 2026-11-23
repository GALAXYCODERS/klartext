import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { renameSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Baut EINE selbstständige Datei dist/presentation.html (CSS, JS, Schriften inline),
// die per Doppelklick offline läuft – ohne Server, ohne Internet.
export default defineConfig({
  base: './',
  plugins: [
    viteSingleFile(),
    {
      name: 'rename-output',
      closeBundle() {
        const from = resolve('dist/index.html');
        if (existsSync(from)) renameSync(from, resolve('dist/presentation.html'));
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // PDFs in dist/ bleiben beim Neubauen erhalten
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 5000,
  },
  server: { open: false },
});

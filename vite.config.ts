import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@hwp.js/parser': fileURLToPath(new URL('./lib/hwp.js/packages/parser/src/index.ts', import.meta.url)),
    },
  },
});
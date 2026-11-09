import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@hwp.js/parser': fileURLToPath(new URL('./lib/hwp.js/packages/parser/src/index.ts', import.meta.url)),
      '@hwplib-js': fileURLToPath(new URL('./lib/hwplib-js/index.ts', import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // Isolate heavier editor/parser libraries if applicable
            return 'vendor';
          }
        }
      }
    }
  }, 
});
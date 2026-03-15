import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      // Proxy API vers le backend Express
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // ✅ Proxy /uploads pour servir les vidéos et fichiers uploadés
      // Les vidéos stockées dans uploads/ du backend sont accessibles via /uploads/...
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // ================== TESTS ==================
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
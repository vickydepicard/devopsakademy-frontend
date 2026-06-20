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
        // Support des Range requests pour le streaming vidéo MP4
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Transmettre le header Range au backend
            if (req.headers['range']) {
              proxyReq.setHeader('Range', req.headers['range']);
            }
          });
        },
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
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    outDir: 'dist',
  },
  plugins: [react()],
  server: {
    proxy: {
      '/v1/api': {
        target: 'http://localhost:1000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

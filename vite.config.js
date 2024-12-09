import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/', 
  build: {
    rollupOptions: {
      input: './index.html',
    },
  },
  server: {
    proxy: {
      '/enviarFormulario': {
        target: 'http://localhost:3001', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

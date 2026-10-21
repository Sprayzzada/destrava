import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Caminhos relativos: funciona em qualquer pasta de hospedagem.
  base: './',
  build: {
    // Tudo num arquivo só (o script de publicação junta JS e CSS no HTML).
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
  },
});

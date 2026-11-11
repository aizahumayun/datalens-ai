import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => ({
  root: __dirname,

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  build: {
    outDir: path.resolve(__dirname, '../dist/client'),
    emptyOutDir: true,
  },

  server: {
  port: 5173,

  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
  },

  hmr: process.env.DISABLE_HMR !== 'true',
  watch: process.env.DISABLE_HMR === 'true' ? null : {},
},
}));
// Vite settings for the simulator's visual dashboard.
// It has 4 pages: the control room (index.html) and the 3 screens shown inside the MacBooks.
// "@site/..." points at the real website's code in /frontend/src, so the website screen
// uses the SAME components as the live site (nothing in /frontend is changed).
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = import.meta.dirname; // …/SIMULATOR/dashboard
const repo = resolve(here, '../..');

export default defineConfig({
  root: here,
  plugins: [react(), tailwindcss()],
  // Reuse the website's favicon and logo files
  publicDir: resolve(repo, 'frontend/public'),
  resolve: {
    alias: { '@site': resolve(repo, 'frontend/src') },
    // One copy of React/i18next for both the simulator and the website's components
    dedupe: ['react', 'react-dom', 'i18next', 'react-i18next'],
  },
  server: {
    port: 5180,
    open: true,
    fs: { allow: [repo] }, // allow reading /frontend/src
  },
  build: {
    outDir: resolve(here, '../dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(here, 'index.html'),
        sensor: resolve(here, 'sensor.html'),
        website: resolve(here, 'website.html'),
        owner: resolve(here, 'owner.html'),
      },
    },
  },
});

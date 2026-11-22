/// <reference types="vitest/config" />
// Vite = the dev server + build tool for the dashboard.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // During development, send any /api/... request to the backend on port 4000.
    // This way the browser thinks both live on one address (no CORS hassle).
    proxy: { '/api': 'http://localhost:4000' },
  },
  test: {
    environment: 'jsdom', // a fake browser for component tests
    setupFiles: ['./src/test-setup.ts'],
  },
});

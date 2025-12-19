import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.svg', 'pwa-512x512.svg'], // Incluimos los SVGs
      manifest: {
        name: 'Centrol-Soft Admin',
        short_name: 'CentrolSoft',
        description: 'Panel de Control Administrativo SaaS',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.svg', // Apuntamos al SVG
            sizes: '192x192',
            type: 'image/svg+xml'   // Importante: Cambiar tipo a svg+xml
          },
          {
            src: 'pwa-512x512.svg', // Apuntamos al SVG
            sizes: '512x512',
            type: 'image/svg+xml',  // Importante: Cambiar tipo a svg+xml
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  }
});

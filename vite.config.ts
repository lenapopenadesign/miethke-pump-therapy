import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Installable web app: manifest + a service worker that precaches the whole
    // prototype (bundle and everything in public/) so it opens offline once
    // installed. Icons come from scripts/pwa-icons.mjs.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa/favicon.svg', 'pwa/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Clarisa — B. Braun Miethke',
        short_name: 'Clarisa',
        description: 'Clarisa intrathecal pump therapy — clinician prototype',
        start_url: '/',
        scope: '/',
        // The screens draw their own status bar, so hide the system one.
        display: 'fullscreen',
        // Screens are authored for a 1200×1920 portrait tablet.
        orientation: 'portrait',
        theme_color: '#0b786a',
        background_color: '#f0fcf7',
        icons: [
          { src: 'pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,gif,pdf}'],
        // The standalone pages in public/ (catheter animation etc.) must load
        // as themselves, not fall back to the app shell.
        navigateFallbackDenylist: [/\.[a-z0-9]+$/i],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});

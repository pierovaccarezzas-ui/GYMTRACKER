import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Build estándar para una PWA real desplegada en Vercel.
// (La antigua configuración para Google Apps Script se conserva en
//  vite.config.appsscript.js por si alguna vez se necesita el HTML único.)
// https://vite.dev/config/
export default defineConfig({
  // Only Firebase's public web configuration is exposed. Service-account keys
  // must never be added here or to a VITE_ variable.
  envPrefix: ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_STORAGE_BUCKET'],
  plugins: [
    react(),
    VitePWA({
      // La app instalada detecta el nuevo service worker tras cada deploy
      // y se actualiza sola, sin intervención del usuario.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'GymTrack',
        short_name: 'GymTrack',
        description: 'Seguimiento de entrenamientos de gimnasio',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#070B14',
        background_color: '#070B14',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precachea el bundle del build para que la app funcione offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // SPA: cualquier navegación cae en index.html.
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        // Permite probar el service worker también con `vite dev`.
        enabled: false,
      },
    }),
  ],
})

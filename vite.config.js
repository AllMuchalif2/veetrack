import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [vue(), tailwindcss(), VitePWA({
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    devOptions: {
      enabled: true
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    },
    manifest: {
      name: 'veetrack',
      short_name: 'veetrack',
      description: 'Aplikasi Produktivitas Neobrutalism',
      theme_color: '#FDE047',
      background_color: '#FDE047',
      display: 'standalone',
      icons: [
        {
          src: '/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        },
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    }
  }), cloudflare()]
})
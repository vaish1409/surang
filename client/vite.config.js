import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "SURANG — हर कला की पहचान",
        short_name: "SURANG",
        description:
          "India's art marketplace. Buy authentic Indian art directly from local artists.",
        theme_color: "#0A0818",
        background_color: "#0A0818",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            // Artwork listings — try the network first (real, current data),
            // fall back to the last cached response if offline.
            urlPattern: ({ url }) => url.pathname.startsWith("/api/artworks"),
            handler: "NetworkFirst",
            options: {
              cacheName: "surang-api-artworks",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Artwork photos rarely change once uploaded — cache aggressively.
            urlPattern: ({ url }) => url.hostname.includes("cloudinary.com"),
            handler: "CacheFirst",
            options: {
              cacheName: "surang-artwork-images",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Keep the service worker OUT of `npm run dev` — it makes local dev
        // confusing (stale cached responses). Test PWA behavior with
        // `npm run build && npm run preview` instead.
        enabled: false,
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: false,
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        },
        devOptions: {
          enabled: true,
        },
        manifest: {
          name: "Bena Flash Global PLT",
          short_name: "Bena Flash",
          description: "Kontraktor Elektrik dan Penghawa Dingin No 1 di Kuantan & Pekan, Pahang.",
          theme_color: "#0F172A",
          background_color: "#0F172A",
          display: "standalone",
          display_override: ["standalone", "minimal-ui", "window-controls-overlay"],
          start_url: "/",
          scope: "/",
          orientation: "portrait",
          icons: [
            {
              src: "https://i.ibb.co/6c1Xgxr4/BENA.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "https://i.ibb.co/6c1Xgxr4/BENA.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "https://i.ibb.co/6c1Xgxr4/BENA.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "https://i.ibb.co/6c1Xgxr4/BENA.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          shortcuts: [
            {
              name: "Servis Aircond",
              short_name: "Aircond",
              description: "Tempah Servis Aircond Bena Flash",
              url: "/?tab=services",
              icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
            {
              name: "Pendawaian Elektrik",
              short_name: "Pendawaian",
              description: "Perkhidmatan Pendawaian Elektrik & CIDB",
              url: "/?tab=services",
              icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
            {
              name: "Aduan & Tempahan",
              short_name: "Tempahan",
              description: "Buka Borang Tempahan & Aduan Servis",
              url: "/?tab=contact",
              icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
            {
              name: "Artikel & Petua Blog",
              short_name: "Blog",
              description: "Baca Panduan Elektrik Bena Flash",
              url: "/?tab=blog",
              icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
          ],
          screenshots: [
            {
              src: "/screenshot-mobile.png",
              sizes: "360x640",
              type: "image/png",
              form_factor: "narrow",
              label: "Antaramuka Utama Bena Flash Mobile App",
            },
            {
              src: "/screenshot-desktop.png",
              sizes: "1280x720",
              type: "image/png",
              form_factor: "wide",
              label: "Portal Utama Bena Flash Global PLT Desktop",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-helmet-async", "recharts"],
    },
    build: {
      minify: "esbuild" as const,
      target: "esnext",
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              "react",
              "react-dom",
              "react-helmet-async",
              "firebase/app",
              "firebase/firestore",
              "firebase/auth",
            ],
            ui: ["lucide-react", "motion/react"],
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          leaflet: ['leaflet', 'react-leaflet', 'leaflet-routing-machine'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
    // Optimizaciones para producción
    target: 'es2015',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'geoplanner.onrender.com',
      '.onrender.com'
    ],
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'geoplanner.onrender.com',
      '.onrender.com'
    ],
  },
});
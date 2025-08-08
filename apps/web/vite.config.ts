console.log('VITE_GOOGLE_CLIENT_ID (build):', process.env.VITE_GOOGLE_CLIENT_ID);
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({}),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuração para GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/aicodegen/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          ui: ['framer-motion', 'lucide-react'],
          utils: ['jszip', 'file-saver'],
          editor: ['@monaco-editor/react']
        }
      }
    }
  },
  // Otimizações para produção
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-router']
  },
  // Preview config para desenvolvimento
  preview: {
    port: 4173,
    host: true
  }
});
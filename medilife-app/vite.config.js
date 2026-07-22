import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-pdf/renderer') || id.includes('pdfjs-dist')) {
            return 'pdf-renderer'
          }
          if (id.includes('@supabase')) {
            return 'supabase'
          }
          if (id.includes('framer-motion')) {
            return 'framer'
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})

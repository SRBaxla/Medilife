import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep heavy PDF library in its own chunk — only loads when user downloads
          'pdf-renderer': ['@react-pdf/renderer'],
          // Separate React core from app code
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Animation library chunk
          'framer': ['framer-motion'],
          // Supabase client
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Increase chunk size warning threshold (PDF library is inherently large)
    chunkSizeWarningLimit: 1000,
  },
})

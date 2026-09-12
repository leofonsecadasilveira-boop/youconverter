import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7132,
    host: true,
    open: true,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  preview: {
    port: 7132
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('pdf-lib')) return 'pdf-lib'
          if (id.includes('pdfjs-dist')) return 'pdfjs'
          if (id.includes('node_modules')) return 'vendor'
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})

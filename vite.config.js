import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // This is the crucial part for PGLite
    exclude: ['@electric-sql/pglite'],
  },
})

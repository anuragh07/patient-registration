import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'build'
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  base: '/'
})
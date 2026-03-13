import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for bundled app
  server: {
    port: 3001
  },
  build: {
    outDir: 'dist',
    emptyDirBeforeWrite: true
  }
})

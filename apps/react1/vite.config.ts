import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Use a different port than the main Astro app
  },
  build: {
    outDir: 'dist',
  },
})

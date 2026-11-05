import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // each repo deploys under its own path (set by the GitHub workflow)
  base: process.env.VITE_BASE || '/quatrea/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1600 },
})

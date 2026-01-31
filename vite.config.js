import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // PENTING: Harus sama persis dengan nama repo di GitHub
  base: '/sistemakademikkampus/',
  build: {
    outDir: 'docs',
  },
})
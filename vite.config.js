import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // LOGIKA OTOMATIS:
    // Jika sedang build (production), pakai '/sistemakademikkampus/'
    // Jika sedang dev (localhost), pakai '/'
    base: mode === 'production' ? '/sistemakademikkampus/' : '/',
  }
})
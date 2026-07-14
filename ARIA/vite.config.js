import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the production build works under SecureAuth's /academy/
// path (not only at domain root). Absolute "/assets/..." would 404 there.
export default defineConfig({
  base: './',
  plugins: [react()],
})

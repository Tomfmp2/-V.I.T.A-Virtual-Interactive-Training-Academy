import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5174,
    strictPort: true // Si está ocupado, se detiene en vez de cambiar de puerto
  },
  plugins: [react(), tailwindcss()],
})

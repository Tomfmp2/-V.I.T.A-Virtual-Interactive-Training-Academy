import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 7259,
    strictPort: true // Si está ocupado, se detiene en vez de cambiar de puerto
  },
  plugins: [react(), tailwindcss()],
})

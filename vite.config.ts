import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Esto asegura que process.env no rompa la app en producción si alguna librería antigua lo usa
    'process.env': {}
  }
})
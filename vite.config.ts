import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar todas las variables de entorno, incluyendo las que no tienen prefijo VITE_
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Aquí ocurre la magia: Mapeamos la variable VITE_API_KEY (que tienes en Vercel)
      // a process.env.API_KEY (que usa nuestra App).
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    }
  }
})
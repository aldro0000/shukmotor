import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Para poder abrir la app desde el celular en la misma red y para pasarle
    // un link por túnel a alguien de afuera. Vite bloquea por defecto todo
    // dominio que no conoce; acá se habilitan los de Cloudflare y ngrok.
    host: true,
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.io', '.loca.lt'],
  },
})

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Panel local de hipótesis y conclusiones del TDR. Es una página aparte que NO
// forma parte de la app desplegada: se arranca solo en local con
// `npm run panel` y lee las claves de Supabase del .env.local de la raíz.
const projectRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  envDir: projectRoot,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5184,
    fs: { allow: [projectRoot] },
  },
})

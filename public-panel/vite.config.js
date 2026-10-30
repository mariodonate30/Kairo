import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Web pública con las respuestas anónimas del test inicial y la encuesta final.
// Es un sitio aparte de la app: no usa Supabase, solo lee la copia fija
// public/respuestas.json exportada desde el panel de admin.
//   npm run public-panel        → desarrollo en local
//   npm run build:public        → genera dist-public/ para desplegar
const projectRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), tailwindcss()],
  build: {
    outDir: fileURLToPath(new URL('../dist-public', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5185,
    fs: { allow: [projectRoot] },
  },
})

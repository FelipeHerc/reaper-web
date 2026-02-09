import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let reaperTarget = 'http://localhost:8082'
try {
  const config = JSON.parse(readFileSync(resolve(__dirname, 'public/config.json'), 'utf-8'))
  reaperTarget = config.reaperUrl || reaperTarget
} catch {
  console.warn('[vite] config.json não encontrado, proxy usando localhost:8082')
}

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: {
    proxy: {
      // Requisições /reaper/* são proxyadas para o host em config.json (evita CORS)
      '/reaper': {
        target: reaperTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reaper/, ''),
      },
    },
  },
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
export default defineConfig({
plugins: [react(), viteSingleFile()],
server: {
    proxy: {
      // Toda requisição que começar com /reaper será proxyada para localhost:8080
      '/reaper': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reaper/, ''),
      },
    },
  },
})
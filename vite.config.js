// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()) // loads only VITE_* keys
  const apiBase = env.VITE_API_BASE_URL || '/api'
  const apiTarget = env.VITE_API_TARGET_URL // set this in .env.local or .env.development

  return {

    // Set base to your repo name if deploying to GitHub Pages
    base: '/',

    plugins: [vue()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },
    server: apiTarget
      ? {
          proxy: {
            [apiBase]: {
              target: apiTarget,
              changeOrigin: true,
              // set false only if your dev API uses self-signed https
              secure: true,
              rewrite: p => p.replace(new RegExp(`^${apiBase}`), '')
            }
          }
        }
      : undefined,
    build: {
      minify: mode === 'production',
      sourcemap: mode !== 'production'
    }
  }
})


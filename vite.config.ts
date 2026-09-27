import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'

// Build stamp shown in the footer, so you can tell which version of the site you are looking at.
// Netlify provides COMMIT_REF; locally we ask git.
function buildStamp(): string {
  let sha = (process.env.COMMIT_REF ?? '').slice(0, 7)
  if (!sha) {
    try {
      sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    } catch {
      sha = 'dev'
    }
  }
  return `${sha} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

// https://vite.dev/config/
export default defineConfig({
  define: { __BUILD__: JSON.stringify(buildStamp()) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Union School of Theology',
        short_name: 'Union',
        description: 'Courses, teaching and study tools for Union students.',
        theme_color: '#1b3a6b',
        background_color: '#f7f4ec',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})

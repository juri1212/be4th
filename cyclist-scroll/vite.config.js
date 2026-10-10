import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import markdown from './plugins/markdown.js'

// Shown in the footer. Taken from the commit rather than the clock, so the client and the prerender agree.
const git = (format) => execSync(`git log -1 --format=${format}`).toString().trim()

// https://vite.dev/config/
export default defineConfig({
  plugins: [markdown(), react()],
  // The prerender reads the manifest to link each page's CSS and chunks in its HTML.
  build: { manifest: true },
  define: {
    __BUILD__: JSON.stringify({ commit: git('%h'), date: git('%cs') }),
  },
})

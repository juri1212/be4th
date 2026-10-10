import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const page = (path) => resolve(import.meta.dirname, path)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      // The start page is the React ride; projects and posts are static pages.
      input: {
        main: page('index.html'),
        duophonic: page('projects/duophonic/index.html'),
        blog: page('blog/index.html'),
        'play-mac-audio-on-two-outputs': page('blog/play-mac-audio-on-two-outputs/index.html'),
      },
    },
  },
})

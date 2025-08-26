// @ts-check
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },

    imageService: 'cloudflare',
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        ...(import.meta.env.PROD && {
          // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
          // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
          // (https://github.com/withastro/astro/issues/12824#issuecomment-2563095382)
          'react-dom/server': 'react-dom/server.edge',
        }),
      },
    },
    build: {
      sourcemap: true,
    },
  },
})

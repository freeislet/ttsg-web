// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import cloudflare from '@astrojs/cloudflare'
import path from 'path'

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), tailwind(), react()],
  output: 'server',
  adapter: cloudflare(),
  vite: {
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
    // 환경 변수에 따른 API 프록시 설정
    ...(import.meta.env.VITE_API_PROXY_ENABLED === 'true' && {
      server: {
        proxy: {
          // API 요청을 로컬 API 서버로 프록시
          '/api': {
            target: `http://localhost:${import.meta.env.VITE_API_PROXY_PORT || '8788'}`,
            changeOrigin: true,
          },
        },
      },
    }),
  },
})

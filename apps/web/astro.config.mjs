// @ts-check
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import starlight from '@astrojs/starlight'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },

    imageService: 'cloudflare',
  }),

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    icon(),
    starlight({
      title: 'TT Wiki',
      prerender: false,
      sidebar: [
        // 그냥 사이드바 자체를 없애는게 나을 듯 TODO
        {
          label: 'TTSG 문서',
          link: '/wiki/',
        },
        // 추가 메뉴 항목들은 여기에 정의할 수 있습니다
        // {
        //   label: '컴포넌트',
        //   items: [
        //     { label: '헤더', link: '/wiki/components/header/' },
        //     { label: '푸터', link: '/wiki/components/footer/' },
        //   ]
        // }
      ],
    }),
  ],
})

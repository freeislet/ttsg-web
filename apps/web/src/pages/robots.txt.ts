import type { APIRoute } from 'astro'
import { siteConfig } from '@/lib/seo/config'

/**
 * robots.txt 생성 API 엔드포인트
 */
export const GET: APIRoute = async () => {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteConfig.url}/sitemap.xml

# 크롤링 제외 경로
Disallow: /api/
Disallow: /_astro/
Disallow: /admin/
Disallow: /private/

# 크롤링 지연 설정 (1초)
Crawl-delay: 1`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // 24시간 캐시
    },
  })
}

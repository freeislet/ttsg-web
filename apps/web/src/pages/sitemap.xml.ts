import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { siteConfig } from '@/lib/seo/config'

/**
 * Sitemap XML 생성 API 엔드포인트
 */
export const GET: APIRoute = async () => {
  // 정적 페이지 목록
  const staticPages = [
    { url: '/', lastmod: new Date(), priority: 1.0 },
    { url: '/blog', lastmod: new Date(), priority: 0.9 },
    { url: '/wiki', lastmod: new Date(), priority: 0.8 },
    { url: '/apps', lastmod: new Date(), priority: 0.8 },
  ]

  // 블로그 포스트 가져오기
  const blogPosts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true
  })

  // 블로그 포스트를 sitemap 항목으로 변환
  const blogPages = blogPosts.map((post) => ({
    url: `/blog/${post.slug}`,
    lastmod: post.data.updatedDate || post.data.pubDate,
    priority: post.data.featured ? 0.9 : 0.7,
  }))

  // 블로그 카테고리 페이지
  const categoryPages = [
    { url: '/blog/category/tech', lastmod: new Date(), priority: 0.6 },
    { url: '/blog/category/news', lastmod: new Date(), priority: 0.6 },
    { url: '/blog/category/intro', lastmod: new Date(), priority: 0.6 },
  ]

  // 모든 페이지 합치기
  const allPages = [...staticPages, ...blogPages, ...categoryPages]

  // Sitemap XML 생성
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${siteConfig.url}${page.url}</loc>
    <lastmod>${page.lastmod.toISOString()}</lastmod>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // 1시간 캐시
    },
  })
}

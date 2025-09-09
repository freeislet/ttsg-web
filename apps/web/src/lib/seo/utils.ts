import type { SEOData, OpenGraphData, TwitterCardData, JsonLDData } from '@/types/seo'
import { siteConfig } from './config'

/**
 * SEO 데이터를 Open Graph 데이터로 변환
 */
export function seoToOpenGraph(seo: SEOData): OpenGraphData {
  return {
    title: seo.title,
    description: seo.description,
    image: seo.image || siteConfig.defaultImage,
    url: seo.url || siteConfig.url,
    type: seo.type || 'website',
    siteName: seo.siteName || siteConfig.name,
    locale: seo.locale || siteConfig.locale,
    publishedTime: seo.publishedTime,
    modifiedTime: seo.modifiedTime,
    author: seo.author,
    section: seo.section,
    tags: seo.tags,
  }
}

/**
 * SEO 데이터를 Twitter Card 데이터로 변환
 */
export function seoToTwitterCard(seo: SEOData): TwitterCardData {
  return {
    card: seo.image ? 'summary_large_image' : 'summary',
    title: seo.title,
    description: seo.description,
    image: seo.image || siteConfig.defaultImage,
    site: siteConfig.social.twitter ? `@${siteConfig.social.twitter}` : undefined,
    creator: seo.author ? `@${seo.author}` : undefined,
  }
}

/**
 * SEO 데이터를 JSON-LD 구조화된 데이터로 변환
 */
export function seoToJsonLD(seo: SEOData): JsonLDData {
  const baseData: JsonLDData = {
    '@context': 'https://schema.org',
    '@type': seo.type === 'article' ? 'Article' : 'WebPage',
    name: seo.title,
    description: seo.description,
    url: seo.url || siteConfig.url,
  }

  // 이미지 추가
  if (seo.image) {
    baseData.image = seo.image
  }

  // 기사 타입인 경우 추가 정보
  if (seo.type === 'article') {
    baseData.headline = seo.title
    baseData.datePublished = seo.publishedTime
    baseData.dateModified = seo.modifiedTime || seo.publishedTime
    
    if (seo.author) {
      baseData.author = {
        '@type': 'Person',
        name: seo.author,
      }
    }

    baseData.publisher = {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.logo}`,
      },
    }

    baseData.mainEntityOfPage = {
      '@type': 'WebPage',
      '@id': seo.url || siteConfig.url,
    }

    if (seo.keywords) {
      baseData.keywords = seo.keywords
    }

    if (seo.section) {
      baseData.articleSection = seo.section
    }
  }

  return baseData
}

/**
 * 제목을 SEO 친화적으로 포맷팅
 */
export function formatSEOTitle(title: string, siteName?: string): string {
  const site = siteName || siteConfig.name
  return title.includes(site) ? title : `${title} | ${site}`
}

/**
 * 설명을 SEO 최적 길이로 자르기
 */
export function truncateDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) {
    return description
  }
  
  const truncated = description.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}

/**
 * URL을 절대 URL로 변환
 */
export function toAbsoluteURL(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  return `${siteConfig.url}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * 키워드 배열을 문자열로 변환
 */
export function keywordsToString(keywords: string[]): string {
  return keywords.join(', ')
}

/**
 * 날짜를 ISO 8601 형식으로 변환
 */
export function formatDateForSEO(date: Date): string {
  return date.toISOString()
}

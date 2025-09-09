import type { SiteConfig } from '@/types/seo'

/**
 * TTSG 사이트 기본 SEO 설정
 */
export const siteConfig: SiteConfig = {
  name: 'TTSG',
  description: 'Technology & Innovation Hub - 최신 기술과 혁신을 탐구하는 플랫폼',
  url: 'https://ttsg.space',
  logo: '/favicon.svg',
  author: 'TTSG Team',
  social: {
    github: 'https://github.com/ttsg-space',
  },
  defaultImage: '/images/og-default.jpg',
  locale: 'ko_KR',
}

/**
 * 기본 SEO 데이터
 */
export const defaultSEO = {
  title: 'TTSG - Technology & Innovation Hub',
  description: siteConfig.description,
  keywords: ['기술', '혁신', 'AI', '개발', '블로그', '위키', '프로그래밍'],
  image: siteConfig.defaultImage,
  url: siteConfig.url,
  type: 'website' as const,
  locale: siteConfig.locale,
  siteName: siteConfig.name,
}

/**
 * 페이지별 SEO 설정
 */
export const pageSEO = {
  home: {
    title: 'TTSG - Technology & Innovation Hub',
    description: '최신 기술 트렌드, AI 개발, 프로그래밍 인사이트를 제공하는 TTSG에 오신 것을 환영합니다.',
    keywords: ['TTSG', '기술 블로그', 'AI', '개발', '프로그래밍', '혁신'],
  },
  blog: {
    title: 'Blog - TTSG',
    description: '기술, 개발, AI에 관한 최신 인사이트와 튜토리얼을 확인하세요.',
    keywords: ['기술 블로그', '개발 블로그', 'AI 블로그', '프로그래밍', '튜토리얼'],
  },
  wiki: {
    title: 'Wiki - TTSG',
    description: 'AI가 생성한 기술 문서와 지식베이스를 탐색하세요.',
    keywords: ['위키', '기술 문서', 'AI 생성', '지식베이스', '개발 가이드'],
  },
  apps: {
    title: 'Apps - TTSG',
    description: 'TTSG에서 개발한 다양한 AI 기반 애플리케이션을 체험해보세요.',
    keywords: ['AI 앱', '데모', '애플리케이션', '기술 데모', 'AI 채팅'],
  },
}

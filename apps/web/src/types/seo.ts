/**
 * SEO 관련 타입 정의
 */

export interface SEOData {
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 */
  description: string;
  /** 키워드 목록 */
  keywords?: string[];
  /** 대표 이미지 URL */
  image?: string;
  /** 페이지 URL */
  url?: string;
  /** 페이지 타입 */
  type?: 'website' | 'article' | 'profile';
  /** 발행일 (ISO 8601 형식) */
  publishedTime?: string;
  /** 수정일 (ISO 8601 형식) */
  modifiedTime?: string;
  /** 작성자 */
  author?: string;
  /** 섹션/카테고리 */
  section?: string;
  /** 태그 목록 */
  tags?: string[];
  /** 언어 코드 */
  locale?: string;
  /** 사이트명 */
  siteName?: string;
}

export interface OpenGraphData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  image?: string;
  site?: string;
  creator?: string;
}

export interface JsonLDData {
  '@context': string;
  '@type': string;
  name?: string;
  headline?: string;
  description?: string;
  image?: string | string[];
  url?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
  };
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
  mainEntityOfPage?: {
    '@type': string;
    '@id': string;
  };
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  logo: string;
  author: string;
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  defaultImage: string;
  locale: string;
}

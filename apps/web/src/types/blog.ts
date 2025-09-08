/**
 * 블로그 카테고리 정의
 */
export const categories = ['ai', 'dev', 'misc'] as const
export type Category = (typeof categories)[number]

/**
 * 카테고리 정보 인터페이스
 */
interface CategoryInfo {
  name: string
  detailedName: string
  description: string
  style: string
}

/**
 * 카테고리별 통합 데이터
 */
export const categoryData: Record<Category, CategoryInfo> = {
  ai: {
    name: 'AI',
    detailedName: 'AI 기술 문서',
    description: 'AI 관련 기술 문서와 동향',
    style: 'bg-green-100 text-green-800',
  },
  dev: {
    name: '개발',
    detailedName: '개발 기술 문서',
    description: '개발 관련 기술 문서, 튜토리얼',
    style: 'bg-blue-100 text-blue-800',
  },
  misc: {
    name: '기타',
    detailedName: '기타',
    description: '기타 기술 문서와 소식',
    style: 'bg-purple-100 text-purple-800',
  },
}

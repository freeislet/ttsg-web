/**
 * 블로그 카테고리 정의
 */
export const categories = ['news', 'tech', 'misc'] as const
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
  news: {
    name: '소식',
    detailedName: '소식',
    description: '최신 업계 동향, 제품 소식, 그리고 중요한 발표 내용을 전해드립니다.',
    style: 'bg-green-100 text-green-800',
  },
  tech: {
    name: '기술',
    detailedName: '기술 문서',
    description: '개발 관련 기술 문서, 튜토리얼, 그리고 실무 경험을 공유합니다.',
    style: 'bg-blue-100 text-blue-800',
  },
  misc: {
    name: '기타',
    detailedName: '기타',
    description: 'TTSG의 제품, 서비스, 그리고 팀에 대한 소개글을 확인하세요.',
    style: 'bg-purple-100 text-purple-800',
  },
}

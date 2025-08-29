/**
 * 블로그 카테고리 타입 정의
 */
export type Category = 'tech' | 'news' | 'intro'

/**
 * 카테고리별 한글 이름 매핑
 */
export const categoryNames: Record<Category, string> = {
  tech: '기술',
  news: '뉴스',
  intro: '소개',
}

/**
 * BlogList 컴포넌트용 카테고리 이름 (상세 버전)
 */
export const categoryNamesDetailed: Record<Category, string> = {
  tech: '기술 문서',
  news: '뉴스',
  intro: '소개글',
}

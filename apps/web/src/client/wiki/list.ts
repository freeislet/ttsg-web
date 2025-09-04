import type { WikiListResponse, NotionPage } from '@/types/wiki'

export type { NotionPage }

/**
 * 노션 위키 목록 조회 API 호출 함수
 * @param limit 조회할 페이지 수 (선택사항, 없으면 서버 기본값 사용)
 * @returns 노션 페이지 목록
 */
export const getNotionWikiList = async (limit?: number): Promise<NotionPage[]> => {
  const url = limit ? `/api/wiki/list?limit=${limit}` : '/api/wiki/list'
  const response = await fetch(url)
  const result: WikiListResponse = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'API 호출 실패')
  }

  return result.data
}

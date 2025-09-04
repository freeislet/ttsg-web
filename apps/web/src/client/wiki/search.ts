import type { NotionPage, WikiSearchResponse } from '@/types/wiki'

export type { NotionPage }

/**
 * 위키 페이지 검색 API 호출 함수
 * @param title 검색할 위키 제목
 * @param language 언어 필터 (선택적)
 * @param version AI 모델명 필터 (선택적)
 * @returns 검색된 노션 페이지 목록
 */
export const searchWikiPages = async (
  title: string,
  language?: string,
  version?: string
): Promise<NotionPage[]> => {
  const params = new URLSearchParams({ title })
  if (language) params.append('language', language)
  if (version) params.append('version', version)

  const response = await fetch(`/api/wiki/search?${params}`)
  const result: WikiSearchResponse = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'API 호출 실패')
  }

  return result.data
}

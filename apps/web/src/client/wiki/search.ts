import type { NotionPage, WikiSearchResponse, WikiSearchResult, Language } from '@/types/wiki'
import type { WikiSearchOptions } from '@/lib/notion'

export type { NotionPage, WikiSearchResult, Language }

/**
 * 위키 페이지 검색 API 호출 함수 (무한 스크롤 지원)
 * @param query 검색어
 * @param options 검색 옵션
 * @returns 검색 결과 (페이지네이션 정보 포함)
 */
export const searchWikiPages = async (
  query: string,
  options?: WikiSearchOptions
): Promise<WikiSearchResult> => {
  const params = new URLSearchParams({ q: query })

  if (options?.startCursor) params.append('cursor', options.startCursor)
  if (options?.pageSize) params.append('size', options.pageSize.toString())
  if (options?.exactMatch !== undefined) params.append('exact', options.exactMatch.toString())
  if (options?.languages) params.append('language', options.languages.join(','))
  if (options?.versions) params.append('version', options.versions.join(','))

  const response = await fetch(`/api/wiki/search?${params}`)
  const result: WikiSearchResponse = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'API 호출 실패')
  }

  return result.data
}

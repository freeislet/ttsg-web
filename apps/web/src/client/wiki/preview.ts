import type { WikiPreviewResponse } from '@/types/wiki'

/**
 * 위키 페이지 프리뷰 API 호출 함수
 * @param pageId 노션 페이지 ID
 * @returns 페이지 프리뷰 내용
 */
export const getWikiPreview = async (pageId: string): Promise<string> => {
  const response = await fetch(`/api/wiki/preview?pageId=${encodeURIComponent(pageId)}`)
  const result: WikiPreviewResponse = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'API 호출 실패')
  }

  return result.data.preview
}

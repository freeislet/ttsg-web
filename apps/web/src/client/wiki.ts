import type { NotionPage } from '@/lib/notion'
import type { NotionApiResponse, WikiGenerationRequest, WikiGenerationResponse } from '@/types'
import type { WikiFormData } from '@/types/wiki-form'

/**
 * 노션 위키 목록 조회 API 호출 함수
 * @returns 노션 페이지 목록
 */
export const getNotionWikiList = async (): Promise<NotionPage[]> => {
  const response = await fetch('/api/notion-pages.json')
  const result: NotionApiResponse = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'API 호출 실패')
  }

  return result.data
}

/**
 * 위키 생성 API 호출 함수
 * @param data 위키 생성 폼 데이터
 * @returns 위키 생성 응답
 */
export const generateWiki = async (data: WikiFormData): Promise<WikiGenerationResponse> => {
  const request: WikiGenerationRequest = {
    models: data.models,
    topic: data.topic.trim(),
    instruction: data.instruction || undefined,
    language: data.language,
    tags: data.tags,
  }
  const response = await fetch('/api/wiki/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const result: WikiGenerationResponse = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || '위키 생성에 실패했습니다.')
  }

  return result
}

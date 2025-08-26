import type { AIModel } from '@/lib/ai'
import type { NotionPage } from '@/lib/notion'
import type {
  NotionApiResponse,
  WikiGenerationRequest,
  WikiGenerationResponse,
  WikiGenerationResult,
} from '@/types'
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

  if (!response.ok) {
    throw new Error(result.message || '위키 생성에 실패했습니다.')
  }

  return result
}

/**
 * SSE 이벤트 타입 정의
 */
export interface SSEEvent {
  type: 'generation_start' | 'model_start' | 'model_complete' | 'generation_complete' | 'error'
  model?: AIModel
  result?: WikiGenerationResult
  progress?: number
  totalModels?: number
  error?: string
}

/**
 * SSE 이벤트 핸들러 타입
 */
export type SSEEventHandler = (event: SSEEvent) => void

/**
 * 위키 생성 SSE 스트리밍 API 호출 함수
 * @param data 위키 생성 폼 데이터
 * @param onEvent SSE 이벤트 핸들러
 * @returns Promise<void>
 */
export const generateWikiStream = async (
  data: WikiFormData,
  onEvent: SSEEventHandler
): Promise<void> => {
  const request: WikiGenerationRequest = {
    models: data.models,
    topic: data.topic.trim(),
    instruction: data.instruction || undefined,
    language: data.language,
    tags: data.tags,
  }

  // SSE 연결을 위한 POST 요청 생성
  const response = await fetch('/api/wiki/generate-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('응답 스트림을 사용할 수 없습니다')
  }

  // ReadableStream을 텍스트로 읽기
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()

  try {
    let isReading = true
    while (isReading) {
      const { done, value } = await reader.read()
      if (done) {
        isReading = false
        break
      }

      // SSE 데이터 파싱 (여러 이벤트가 한 번에 올 수 있음)
      const lines = value.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(line.slice(6)) as SSEEvent
            onEvent(eventData)
          } catch (parseError) {
            console.warn('SSE 데이터 파싱 오류:', parseError, line)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

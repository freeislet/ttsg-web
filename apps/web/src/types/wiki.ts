/**
 * 위키 생성 API 관련 타입 정의
 */

import type { Language } from '@/lib/notion'
import type { WikiGenerationResult } from '@/lib/wiki'

/**
 * 위키 생성 API 요청 타입
 */
export interface WikiGenerationRequest {
  topic: string
  models: string[]
  language: Language
  tags: string[]
}

/**
 * 위키 생성 API 응답 타입
 */
export interface WikiGenerationResponse {
  success: boolean
  results: WikiGenerationResult[]
  message?: string
}

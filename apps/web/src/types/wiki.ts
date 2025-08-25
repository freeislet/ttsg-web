/**
 * 위키 생성 API 관련 타입 정의
 */

import type { AIModel } from '@/lib/ai'
import type { Language } from '@/lib/notion'

/**
 * 위키 생성 API 요청 타입
 */
export interface WikiGenerationRequest {
  models: AIModel[]
  topic: string
  instruction?: string
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

/**
 * 위키 생성 결과 타입
 */
export interface WikiGenerationResult {
  model: AIModel
  title: string
  version: string
  prompt?: string
  content?: string
  notionUrl?: string
  notionPageId?: string
  error?: string
}

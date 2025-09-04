/**
 * 위키 API 관련 타입 정의
 */

import type { NotionPage, Language, WikiSearchResult } from '@/lib/notion'
import type { AIModel } from '@/lib/ai'

export type { NotionPage, Language, WikiSearchResult, AIModel }

/**
 * 위키 목록 API 응답 타입
 */
export interface WikiListResponse {
  success: boolean
  data: NotionPage[]
  count: number
  message?: string
}

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

/**
 * 위키 검색 API 응답 타입
 */
export interface WikiSearchResponse {
  success: boolean
  data: WikiSearchResult
  error?: string
}

/**
 * 위키 프리뷰 API 응답 타입
 */
export interface WikiPreviewResponse {
  success: boolean
  data: { preview: string }
  error?: string
}

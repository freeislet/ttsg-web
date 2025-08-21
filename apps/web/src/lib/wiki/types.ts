import type { Language } from '@/lib/notion'

/**
 * 위키 생성 결과 타입
 */
export interface WikiGenerationResult {
  model: string
  notionUrl: string
  pageId: string
  title: string
  version: string
}

/**
 * 위키 콘텐츠 타입
 */
export interface WikiContent {
  title: string
  content: string
  summary?: string
}

/**
 * AI 모델 정보 타입
 */
export interface AIModel {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

/**
 * 위키 생성기 인터페이스
 * 모든 AI 모델 구현체가 따라야 하는 공통 인터페이스입니다.
 */
export interface IWikiGenerator {
  /**
   * 주어진 주제로 위키 콘텐츠를 생성합니다.
   * @param topic 위키 생성 주제
   * @param language 언어 설정 (선택적, 기본값: 'ko')
   * @returns 생성된 위키 콘텐츠
   */
  generate(topic: string, language?: Language): Promise<WikiContent>

  /**
   * 모델명을 반환합니다.
   * @returns 모델명 (예: "gemini-pro")
   */
  getModelName(): string

  /**
   * 모델 버전을 반환합니다.
   * @returns 모델 버전 (예: "Gemini Pro")
   */
  getModelVersion(): string
}
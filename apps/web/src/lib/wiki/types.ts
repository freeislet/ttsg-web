import type { Language } from '@/lib/notion'

export type { Language }

/**
 * 위키 콘텐츠 타입
 */
export interface WikiContent {
  title: string
  content: string
  // summary?: string
}

/**
 * 위키 생성기 인터페이스
 * 모든 AI 모델 구현체가 따라야 하는 공통 인터페이스입니다.
 */
export interface IWikiGenerator {
  /**
   * 생성기 이름(AI 모델명)을 반환합니다.
   * @returns 생성기 이름 (예: "GPT-5")
   */
  getName(): string

  /**
   * 주어진 주제로 위키 콘텐츠를 생성합니다.
   * @param topic 위키 생성 주제
   * @param language 언어 설정 (선택적, 기본값: 'ko')
   * @param instruction 사용자 정의 지침 (선택적)
   * @returns 생성된 위키 콘텐츠
   */
  generate(topic: string, language?: Language, instruction?: string): Promise<WikiContent>
}

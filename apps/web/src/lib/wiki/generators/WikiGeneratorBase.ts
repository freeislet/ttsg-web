import type { AIType } from '@/lib/ai'
import type { IWikiGenerator, WikiContent, Language } from '../types'

/**
 * 위키 생성기 기본 추상 클래스
 * 모든 AI 모델 구현체가 상속받아야 하는 공통 기능을 제공합니다.
 */
export abstract class WikiGeneratorBase implements IWikiGenerator {
  protected name: string
  protected aiType?: AIType

  constructor(name: string, aiType?: AIType) {
    this.name = name
    this.aiType = aiType
  }

  /**
   * 생성기 이름(AI 모델명)을 반환합니다.
   * @returns 생성기 이름 (예: "GPT-5")
   */
  getName(): string {
    return this.name
  }

  /**
   * AI 타입을 반환합니다.
   * @returns AI 타입
   */
  getAIType(): AIType | undefined {
    return this.aiType
  }

  /**
   * 주어진 주제로 위키 콘텐츠를 생성합니다.
   * @param topic 위키 생성 주제
   * @param language 언어 설정 (선택적, 기본값: 'ko')
   * @param instruction 사용자 정의 지침 (선택적)
   * @returns 생성된 위키 콘텐츠
   */
  async generate(topic: string, language?: Language, instruction?: string): Promise<WikiContent> {
    // try {
    return await this._generate(topic, language ?? 'ko', instruction)
    // } catch (error) {
    //   console.error(`${this.aiType} ${this.name} 위키 생성 실패:`, error)

    //   const msg = error instanceof Error ? error.message : '알 수 없는 오류'
    //   throw new Error(`${this.aiType} ${this.name}로 위키 생성 중 오류가 발생했습니다: ${msg}`)
    // }
  }

  /**
   * 주어진 주제로 위키 콘텐츠를 생성합니다.
   * @param topic 위키 생성 주제
   * @param language 언어 설정
   * @param instruction 사용자 정의 지침 (선택적)
   * @returns 생성된 위키 콘텐츠
   */
  abstract _generate(topic: string, language: Language, instruction?: string): Promise<WikiContent>
}

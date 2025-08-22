import { Gemini, type GeminiModel } from '@/lib/ai'
import type { IWikiGenerator, WikiContent, Language } from '../types'
import { getWikiPrompt } from '../prompt'

/**
 * Gemini Pro 모델을 사용한 위키 생성기
 */
export class GeminiGenerator implements IWikiGenerator {
  private gemini: Gemini
  private name: string

  constructor(model: GeminiModel, name?: string) {
    const apiKey = import.meta.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.')
    }

    this.gemini = new Gemini({ apiKey, model })
    this.name = name ?? model
  }

  /**
   * 생성기 이름(AI 모델명)을 반환합니다.
   * @returns 생성기 이름 (예: "Gemini 2.5 Pro")
   */
  getName(): string {
    return this.name
  }

  /**
   * 주어진 주제로 위키 콘텐츠를 생성합니다.
   * @param topic 위키 생성 주제
   * @param language 언어 설정 (선택적, 기본값: 'ko')
   * @returns 생성된 위키 콘텐츠
   */
  async generate(topic: string, language: Language = 'ko'): Promise<WikiContent> {
    try {
      const prompt = getWikiPrompt(topic, {
        aiType: 'Gemini',
        language,
        includeSystemPrompt: true,
      })
      const content = await this.gemini.generate(prompt)

      return {
        title: topic,
        content: content.trim(),
        summary: this.extractSummary(content, topic),
      }
    } catch (error) {
      console.error('Gemini Pro 위키 생성 실패:', error)
      const msg = error instanceof Error ? error.message : '알 수 없는 오류'
      throw new Error(`Gemini Pro로 위키 생성 중 오류가 발생했습니다: ${msg}`)
    }
  }

  /**
   * 콘텐츠에서 요약을 추출합니다.
   */
  private extractSummary(content: string, topic: string): string {
    const lines = content.split('\n')
    const overviewIndex = lines.findIndex((line) => line.includes('## 개요'))

    if (overviewIndex !== -1 && overviewIndex + 1 < lines.length) {
      const summaryLines = []
      for (let i = overviewIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.startsWith('##')) break
        if (line && !line.startsWith('#')) {
          summaryLines.push(line.replace(/^- /, ''))
        }
      }
      return summaryLines.join(' ').substring(0, 200) + '...'
    }

    return topic + '에 대한 위키 문서입니다.'
  }
}

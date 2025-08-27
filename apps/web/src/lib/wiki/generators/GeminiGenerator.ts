import { Gemini, type GeminiModel } from '@/lib/ai'
import type { WikiContent, Language } from '../types'
import { getWikiPrompt, getWikiSystemMessage } from '../prompts'
import { WikiGeneratorBase } from './WikiGeneratorBase'

/**
 * Gemini Pro 모델을 사용한 위키 생성기
 */
export class GeminiGenerator extends WikiGeneratorBase {
  private gemini: Gemini

  constructor(model: GeminiModel, name?: string) {
    super(name ?? model, 'Gemini')

    const apiKey = getEnv('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.')
    }

    this.gemini = new Gemini({ apiKey, model })
  }

  /**
   * 주어진 주제로 위키 콘텐츠를 생성합니다.
   * @param topic 위키 생성 주제
   * @param language 언어 설정
   * @param instruction 사용자 정의 지침 (선택적)
   * @returns 생성된 위키 콘텐츠
   */
  async _generate(topic: string, language: Language, instruction?: string): Promise<WikiContent> {
    const systemMessage = getWikiSystemMessage(language, 'Gemini')
    const prompt = getWikiPrompt(topic, language, instruction)
    const combinedPrompt = systemMessage + '\n\n' + prompt

    try {
      console.log('Gemini 위키 생성 시작', topic, language, instruction)
      const content = await this.gemini.generate(combinedPrompt)

      return {
        title: topic,
        prompt: combinedPrompt,
        content: content.trim(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      console.error(`Gemini 위키 생성 실패 [${topic}]:`, errorMessage)

      return {
        title: topic,
        prompt: combinedPrompt,
        error: errorMessage,
      }
    }
  }
}

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

    const apiKey = import.meta.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.')
    }

    this.gemini = new Gemini({ apiKey, model })
  }

  /**
   * 주어진 주제로 위키 콘텐츠를 생성합니다.
   * @param topic 위키 생성 주제
   * @param language 언어 설정
   * @returns 생성된 위키 콘텐츠
   */
  async _generate(topic: string, language: Language): Promise<WikiContent> {
    const systemMessage = getWikiSystemMessage(language, 'Gemini')
    const prompt = getWikiPrompt(topic, language)
    const combinedPrompt = systemMessage + '\n\n' + prompt

    const content = await this.gemini.generate(combinedPrompt)

    return {
      title: topic,
      content: content.trim(),
    }
  }
}

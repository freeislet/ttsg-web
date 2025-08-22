import { type AIModel, AI_MODELS, CHATGPT_MODELS, GEMINI_MODELS } from '@/lib/ai'
import type { IWikiGenerator } from './types'
import { ChatGPTGenerator } from './generators/ChatGPTGenerator'
import { GeminiGenerator } from './generators/GeminiGenerator'

/**
 * 위키 생성기 팩토리 클래스
 * 모델명에 따라 적절한 위키 생성기 인스턴스를 생성합니다.
 */
export class WikiGeneratorFactory {
  /**
   * 지원하는 모든 모델명 목록
   */
  static readonly supportedModels = AI_MODELS.map((m) => m.model)

  /**
   * 모델명에 따른 위키 생성기 인스턴스를 생성합니다.
   * @param model 모델명
   * @returns 위키 생성기 인스턴스
   */
  static create(model: AIModel): IWikiGenerator {
    const chatgptModel = CHATGPT_MODELS.find((m) => m.model === model)
    if (chatgptModel) {
      return new ChatGPTGenerator(chatgptModel.model, chatgptModel.name)
    }

    const geminiModel = GEMINI_MODELS.find((m) => m.model === model)
    if (geminiModel) {
      return new GeminiGenerator(geminiModel.model, geminiModel.name)
    }

    throw new Error(`지원하지 않는 모델입니다: ${model}`)
  }
}

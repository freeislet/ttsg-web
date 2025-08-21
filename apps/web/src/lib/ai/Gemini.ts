import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai'
import type { GeminiModel } from './types'

/**
 * Gemini 클래스 옵션 타입
 */
export interface GeminiOptions {
  apiKey: string
  model: GeminiModel
}

/**
 * Google Gemini API를 사용한 텍스트 생성 클래스
 */
export class Gemini {
  private genAI: GoogleGenerativeAI
  private model: GenerativeModel

  constructor(options: GeminiOptions) {
    this.genAI = new GoogleGenerativeAI(options.apiKey)
    this.model = this.genAI.getGenerativeModel({ model: options.model })
  }

  /**
   * 주어진 프롬프트로 텍스트를 생성합니다.
   * @param prompt 생성할 텍스트의 프롬프트
   * @returns 생성된 텍스트
   */
  async generate(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error('Gemini 생성 실패:', error)
      throw new Error(
        `Gemini로 텍스트 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      )
    }
  }
}

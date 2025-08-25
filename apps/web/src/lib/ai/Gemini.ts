import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerativeModel, GenerateContentRequest } from '@google/generative-ai'
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
   * 주어진 텍스트 생성 요청 또는 프롬프트로 텍스트를 생성합니다.
   * @param request 텍스트 생성 요청 또는 프롬프트
   * @returns 생성된 텍스트
   */
  async generate(request: GenerateContentRequest | string): Promise<string> {
    // try {
    const result = await this.model.generateContent(request)
    return result.response.text()
    // } catch (error) {
    //   console.error('Gemini 텍스트 생성 실패:', error)
    //   throw error
    // }
  }
}

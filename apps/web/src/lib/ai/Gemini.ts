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
    try {
      const result = await this.model.generateContent(request)
      return result.response.text()
    } catch (error) {
      console.error('Gemini 텍스트 생성 실패:', error)
      throw error
    }
  }

  /**
   * 스트리밍 방식으로 텍스트를 생성합니다.
   * @param request 텍스트 생성 요청 또는 프롬프트
   * @param onChunk 새로운 청크가 도착할 때마다 호출될 콜백
   * @returns 생성된 전체 텍스트
   */
  async generateStream(
    request: GenerateContentRequest | string,
    onChunk: (chunk: string, fullText: string) => void
  ): Promise<string> {
    try {
      const result = await this.model.generateContentStream(request)
      
      let fullText = ''
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        if (chunkText) {
          fullText += chunkText
          onChunk(chunkText, fullText)
        }
      }

      return fullText
    } catch (error) {
      console.error('Gemini 스트리밍 텍스트 생성 실패:', error)
      throw error
    }
  }
}

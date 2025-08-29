import OpenAI from 'openai'
import type { ChatGPTModel } from './types'

/**
 * ChatGPT 클래스 옵션 타입
 */
export interface ChatGPTOptions {
  apiKey: string
  model: ChatGPTModel
}

/**
 * ChatGPT 메시지 타입
 */
export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * ChatGPT API를 사용한 텍스트 생성 클래스
 */
export class ChatGPT {
  readonly openai: OpenAI
  readonly model: ChatGPTModel

  constructor(options: ChatGPTOptions) {
    this.openai = new OpenAI({
      apiKey: options.apiKey,
    })
    this.model = options.model
  }

  /**
   * 주어진 메시지들로 텍스트를 생성합니다.
   * @param messages 대화 메시지 배열
   * @param options 생성 옵션
   * @returns 생성된 텍스트
   */
  async generate(
    messages: ChatGPTMessage[],
    options?: {
      maxTokens?: number
    }
  ): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_completion_tokens: options?.maxTokens ?? 4000,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('ChatGPT 텍스트 생성 실패:', error)
      throw error
    }
  }

  /**
   * 스트리밍 방식으로 텍스트를 생성합니다.
   * @param messages 대화 메시지 배열
   * @param onChunk 새로운 청크가 도착할 때마다 호출될 콜백
   * @param options 생성 옵션
   * @returns 생성된 전체 텍스트
   */
  async generateStream(
    messages: ChatGPTMessage[],
    onChunk: (chunk: string, fullText: string) => void,
    options?: {
      maxTokens?: number
    }
  ): Promise<string> {
    try {
      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_completion_tokens: options?.maxTokens ?? 4000,
        stream: true,
      })

      let fullText = ''

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullText += content
          onChunk(content, fullText)
        }
      }

      return fullText
    } catch (error) {
      console.error('ChatGPT 스트리밍 텍스트 생성 실패:', error)
      throw error
    }
  }
}

import { ChatGPT, type ChatGPTModel } from '@/lib/ai'
import type { WikiContent, Language } from '../types'
import { getWikiPrompt, getWikiSystemMessage } from '../prompts'
import { WikiGeneratorBase } from './WikiGeneratorBase'

/**
 * ChatGPT 모델을 사용한 위키 생성기
 */
export class ChatGPTGenerator extends WikiGeneratorBase {
  private chatgpt: ChatGPT

  constructor(model: ChatGPTModel, name?: string) {
    super(name ?? model, 'ChatGPT')

    const apiKey = import.meta.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.')
    }

    this.chatgpt = new ChatGPT({ apiKey, model })
  }

  /**
   * 주어진 주제로 위키 콘텐츠를 생성합니다.
   * @param topic 위키 생성 주제
   * @param language 언어 설정
   * @param instruction 사용자 정의 지침 (선택적)
   * @returns 생성된 위키 콘텐츠
   */
  async _generate(topic: string, language: Language, instruction?: string): Promise<WikiContent> {
    const systemMessage = getWikiSystemMessage(language, 'ChatGPT')
    const prompt = getWikiPrompt(topic, language, instruction)

    console.log(`<${topic}> ChatGPT prompt:`, systemMessage, prompt)
    const content = await this.chatgpt.generate(
      [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        maxTokens: 4000,
        temperature: 0.7,
      }
    )

    return {
      title: topic,
      content: content.trim(),
    }
  }
}

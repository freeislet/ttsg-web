/**
 * AI 타입
 */
export type AIType = 'ChatGPT' | 'Gemini'

/**
 * AI 모델 타입
 */
export type AIModel = ChatGPTModel | GeminiModel

/**
 * ChatGPT 모델 타입
 */
// export type { ChatModel as ChatGPTModel } from 'openai/resources'
export type ChatGPTModel = 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano'

/**
 * Gemini 모델 타입
 */
export type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite'

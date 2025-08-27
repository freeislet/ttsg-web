import type { AIModel, ChatGPTModel, GeminiModel } from './types'
import { type ColorClasses, COLOR_CLASSES } from './colors'

/**
 * AI 모델 메타 정보 인터페이스
 */
export interface AIModelMeta<T = AIModel> {
  model: T
  name: string
  description: string
  icon: string
  colors: ColorClasses
}

/**
 * ChatGPT 모델 메타 정보 배열
 */
export const CHATGPT_MODELS: AIModelMeta<ChatGPTModel>[] = [
  {
    model: 'gpt-5',
    name: 'GPT-5',
    description: 'OpenAI의 최신 GPT-5 모델',
    icon: 'simple-icons:openai',
    colors: COLOR_CLASSES.purple,
  },
  {
    model: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    description: 'OpenAI의 경량화된 GPT-5 모델',
    icon: 'simple-icons:openai',
    colors: COLOR_CLASSES.pink,
  },
  {
    model: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    description: 'OpenAI의 초경량 GPT-5 모델',
    icon: 'simple-icons:openai',
    colors: COLOR_CLASSES.orange,
  },
]

/**
 * Gemini 모델 메타 정보 배열
 */
export const GEMINI_MODELS: AIModelMeta<GeminiModel>[] = [
  {
    model: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google의 고성능 언어 모델',
    icon: 'simple-icons:googlegemini',
    colors: COLOR_CLASSES.blue,
  },
  {
    model: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Google의 빠른 응답 모델',
    icon: 'simple-icons:googlegemini',
    colors: COLOR_CLASSES.cyan,
  },
  {
    model: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Google의 경량화된 빠른 모델',
    icon: 'simple-icons:googlegemini',
    colors: COLOR_CLASSES.green,
  },
]

export const AI_MODELS: AIModelMeta[] = [...CHATGPT_MODELS, ...GEMINI_MODELS]

/**
 * 모델 메타 정보 조회
 * @param model 모델명
 * @param options 옵션
 * @returns 모델 메타 정보
 */
export function getModelMeta(model: AIModel, options?: { useFallback?: boolean }): AIModelMeta {
  const modelMeta = AI_MODELS.find((m) => m.model === model)
  if (modelMeta) {
    return modelMeta
  }

  // useFallback이 true인 경우 기본값 반환
  if (options?.useFallback === true) {
    return {
      model,
      name: model,
      description: '알 수 없는 모델',
      icon: 'mdi:auto-fix',
      colors: COLOR_CLASSES.gray,
    }
  } else {
    throw new Error(`지원하지 않는 모델입니다: ${model}`)
  }
}

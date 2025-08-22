import type { AIModel } from './types'

export interface AIModelMeta {
  model: AIModel
  name: string
  description: string
  icon: string
  color: string
}

export const AI_MODELS: AIModelMeta[] = [
  {
    model: 'gpt-5',
    name: 'GPT-5',
    description: 'OpenAI의 최신 GPT-5 모델',
    icon: 'simple-icons:openai',
    color: 'purple',
  },
  {
    model: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    description: 'OpenAI의 경량화된 GPT-5 모델',
    icon: 'simple-icons:openai',
    color: 'orange',
  },
  {
    model: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    description: 'OpenAI의 초경량 GPT-5 모델',
    icon: 'simple-icons:openai',
    color: 'red',
  },
  {
    model: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google의 고성능 언어 모델',
    icon: 'simple-icons:google',
    color: 'blue',
  },
  {
    model: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Google의 빠른 응답 모델',
    icon: 'simple-icons:google',
    color: 'green',
  },
  {
    model: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Google의 경량화된 빠른 모델',
    icon: 'simple-icons:google',
    color: 'teal',
  },
]

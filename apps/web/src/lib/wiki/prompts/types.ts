import type { AIType } from '@/lib/ai'

export type { AIType }
export type { Language } from '@/lib/notion'

export interface PromptStrings {
  getPrompt: (topic: string, instruction?: string) => string
  systemMessage: string
  optimizationMessages: Record<AIType, string>
}

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { type AIModel, AI_MODELS } from '@/lib/ai'
import type { Language } from '@/lib/notion'

export { Controller }

/**
 * 위키 생성 폼 데이터 타입
 */
export interface WikiFormData {
  /** 위키 주제 */
  topic: string
  /** 사용자 정의 지침 (선택사항) */
  instruction?: string
  /** 언어 설정 */
  language: Language
  /** 태그 목록 */
  tags: string[]
  /** 선택된 AI 모델들 */
  models: AIModel[]
}

/**
 * 사용 가능한 태그 목록
 */
export const AVAILABLE_TAGS = ['IT', 'AI', 'Software Dev', 'Web Dev', '3D', 'Game'] as const

/**
 * 언어 옵션
 */
export const LANGUAGE_OPTIONS = [
  { value: 'ko' as const, label: '한국어' },
  { value: 'en' as const, label: 'English' },
] as const

/**
 * Zod validation 스키마
 */
export const wikiFormSchema = z.object({
  topic: z
    .string()
    .min(1, '주제를 입력해주세요')
    .max(100, '주제는 100자 이내로 입력해주세요')
    .refine((val) => val.trim().length > 0, '주제를 입력해주세요'),

  instruction: z.string().max(500, '지침은 500자 이내로 입력해주세요').optional().or(z.literal('')),

  language: z.enum(['ko', 'en'], {
    message: '언어를 선택해주세요',
  }),

  tags: z.array(z.string()),
  // .min(1, '최소 하나의 태그를 선택해주세요')
  // .max(10, '최대 10개의 태그까지 선택 가능합니다'),

  models: z
    .array(z.enum(AI_MODELS.map<AIModel>((model) => model.model)))
    .min(1, '최소 하나의 AI 모델을 선택해주세요')
    .max(AI_MODELS.length, `최대 ${AI_MODELS.length}개의 모델까지 선택 가능합니다`),
})

/**
 * 폼 기본값
 */
export const defaultFormValues: WikiFormData = {
  topic: '',
  models: ['gpt-5-mini', 'gemini-2.5-flash'],
  instruction: '',
  language: 'ko',
  tags: [],
}

/**
 * 위키 생성 폼을 위한 커스텀 hook
 * react-hook-form과 zod validation을 함께 제공합니다.
 */
export const useWikiGenerationForm = () => {
  return useForm<WikiFormData>({
    resolver: zodResolver(wikiFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  })
}

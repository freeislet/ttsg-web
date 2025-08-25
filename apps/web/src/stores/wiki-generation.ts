import { map } from 'nanostores'
import { useStore } from '@nanostores/react'
import type { AIModel } from '@/lib/ai'
import type { Language } from '@/lib/notion'
import { type WikiFormData, defaultFormValues } from '@/types/wiki-form'

/**
 * 위키 생성 과정에서 발생하는 모델별 결과 데이터
 */
export interface WikiModelResult {
  model: AIModel
  status: 'pending' | 'generating' | 'success' | 'error'
  prompt?: string
  content?: string
  error?: string
  notionUrl?: string
  notionPageId?: string
}

/**
 * 위키 생성 컨텍스트 전체 상태
 */
export interface WikiGenerationContext {
  // 공통 파라미터
  topic: string
  instruction?: string
  language: Language
  tags: string[]

  // 생성 상태
  isGenerating: boolean
  progress: number

  // 모델별 결과
  modelResults: WikiModelResult[]

  // 전체 완료 상태
  isCompleted: boolean
  hasErrors: boolean
}

/**
 * 위키 생성 컨텍스트 스토어
 */
export const $wikiGenerationContext = map<WikiGenerationContext>({
  topic: '',
  instruction: '',
  language: 'ko',
  tags: [],
  isGenerating: false,
  progress: 0,
  modelResults: [],
  isCompleted: false,
  hasErrors: false,
})

/**
 * 위키 생성 컨텍스트 초기화
 */
export const resetWikiContext = () => {
  $wikiGenerationContext.set({
    topic: '',
    instruction: '',
    language: 'ko',
    tags: [],
    isGenerating: false,
    progress: 0,
    modelResults: [],
    isCompleted: false,
    hasErrors: false,
  })
}

/**
 * 위키 생성 시작 액션
 */
export const startWikiGeneration = (formData: WikiFormData, reset = true) => {
  if (reset) {
    resetWikiContext()
  }

  const modelResults: WikiModelResult[] = formData.models.map((model) => ({
    model,
    status: 'pending',
  }))

  $wikiGenerationContext.setKey('topic', formData.topic)
  $wikiGenerationContext.setKey('instruction', formData.instruction)
  $wikiGenerationContext.setKey('language', formData.language)
  $wikiGenerationContext.setKey('tags', formData.tags)
  $wikiGenerationContext.setKey('isGenerating', true)
  $wikiGenerationContext.setKey('progress', 0)
  $wikiGenerationContext.setKey('modelResults', modelResults)
  $wikiGenerationContext.setKey('isCompleted', false)
  $wikiGenerationContext.setKey('hasErrors', false)
}

export const restartWikiGeneration = () => {
  startWikiGeneration(defaultFormValues)
}

/**
 * 모델별 프롬프트 설정
 */
export const setModelPrompt = (model: AIModel, prompt: string) => {
  const currentResults = $wikiGenerationContext.get().modelResults
  const updatedResults = currentResults.map((result) =>
    result.model === model ? { ...result, prompt } : result
  )
  $wikiGenerationContext.setKey('modelResults', updatedResults)
}

/**
 * 모델별 생성 시작
 */
export const startModelGeneration = (model: AIModel) => {
  const currentResults = $wikiGenerationContext.get().modelResults
  const updatedResults = currentResults.map((result) =>
    result.model === model ? { ...result, status: 'generating' as const } : result
  )
  $wikiGenerationContext.setKey('modelResults', updatedResults)
}

/**
 * 모델별 생성 성공
 */
export const setModelSuccess = (
  model: AIModel,
  content: string,
  notionUrl: string,
  notionPageId: string
) => {
  const currentResults = $wikiGenerationContext.get().modelResults
  const updatedResults = currentResults.map((result) =>
    result.model === model
      ? {
          ...result,
          status: 'success' as const,
          content,
          notionUrl,
          notionPageId,
          error: undefined,
        }
      : result
  )
  $wikiGenerationContext.setKey('modelResults', updatedResults)

  // 모든 모델이 완료되었는지 확인
  const allCompleted = updatedResults.every(
    (result) => result.status === 'success' || result.status === 'error'
  )

  if (allCompleted) {
    const hasErrors = updatedResults.some((result) => result.status === 'error')
    $wikiGenerationContext.setKey('isCompleted', true)
    $wikiGenerationContext.setKey('isGenerating', false)
    $wikiGenerationContext.setKey('hasErrors', hasErrors)
    $wikiGenerationContext.setKey('progress', 100)
  }
}

/**
 * 모델별 생성 실패
 */
export const setModelError = (model: AIModel, error: string) => {
  const currentResults = $wikiGenerationContext.get().modelResults
  const updatedResults = currentResults.map((result) =>
    result.model === model
      ? {
          ...result,
          status: 'error' as const,
          error,
          content: undefined,
          notionUrl: undefined,
          notionPageId: undefined,
        }
      : result
  )
  $wikiGenerationContext.setKey('modelResults', updatedResults)

  // 모든 모델이 완료되었는지 확인
  const allCompleted = updatedResults.every(
    (result) => result.status === 'success' || result.status === 'error'
  )

  if (allCompleted) {
    $wikiGenerationContext.setKey('isCompleted', true)
    $wikiGenerationContext.setKey('isGenerating', false)
    $wikiGenerationContext.setKey('hasErrors', true)
    $wikiGenerationContext.setKey('progress', 100)
  }
}

/**
 * 진행률 업데이트
 */
export const updateProgress = (progress: number) => {
  $wikiGenerationContext.setKey('progress', progress)
}

/**
 * 위키 생성 액션 함수들을 그룹화한 객체
 */
export const wikiGenerationActions = {
  reset: resetWikiContext,
  startGeneration: startWikiGeneration,
  restartGeneration: restartWikiGeneration,
  setModelPrompt,
  startModelGeneration,
  setModelSuccess,
  setModelError,
  updateProgress,
} as const

/**
 * 위키 생성 스토어를 사용하는 커스텀 hook
 * 상태와 액션을 함께 반환하여 zustand와 유사한 패턴 제공
 */
export const useWikiGenerationStore = () => {
  const context = useStore($wikiGenerationContext)
  return {
    ...context,
    actions: wikiGenerationActions,
  }
}

import { atom } from '@illuxiza/nanostores-immer'
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
 * 위키 생성 과정에서 발생하는 컨텍스트 데이터
 */
export interface WikiGenerationContext {
  // 폼 데이터
  topic: string
  instruction?: string
  language: Language
  tags: string[]

  // 생성 및 완료 상태
  isGenerating: boolean
  isCompleted: boolean
  progress: number
  hasErrors: boolean

  // 전체 에러 상태
  globalError?: string

  // 모델별 결과
  modelResults: WikiModelResult[]
}

/**
 * 위키 생성 컨텍스트 스토어
 */
export const $wikiGenerationContext = atom<WikiGenerationContext>({
  topic: '',
  instruction: '',
  language: 'ko',
  tags: [],
  isGenerating: false,
  isCompleted: false,
  progress: 0,
  hasErrors: false,
  globalError: undefined,
  modelResults: [],
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
    isCompleted: false,
    progress: 0,
    hasErrors: false,
    globalError: undefined,
    modelResults: [],
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

  $wikiGenerationContext.mut((draft) => {
    draft.topic = formData.topic
    draft.instruction = formData.instruction
    draft.language = formData.language
    draft.tags = formData.tags
    draft.isGenerating = true
    draft.isCompleted = false
    draft.progress = 0
    draft.hasErrors = false
    draft.modelResults = modelResults
  })
}

/**
 * 위키 생성 재시작 액션
 */
export const restartWikiGeneration = () => {
  startWikiGeneration(defaultFormValues)
}

/**
 * 전체 위키 생성 에러 설정
 */
export const setWikiGenerationError = (error: string) => {
  $wikiGenerationContext.mut((draft) => {
    // 전역 에러 설정
    draft.globalError = error

    // 모든 모델 결과를 에러 상태로 변경
    draft.modelResults.forEach((result) => {
      result.status = 'error'
    })

    // 생성 상태 업데이트
    draft.isGenerating = false
    draft.isCompleted = true
    draft.hasErrors = true
  })
}

/**
 * 모델별 프롬프트 설정
 */
export const setModelPrompt = (model: AIModel, prompt: string) => {
  $wikiGenerationContext.mut((draft) => {
    const result = draft.modelResults.find((r) => r.model === model)
    if (result) {
      result.prompt = prompt
    }
  })
}

/**
 * 모델별 생성 시작
 */
export const startModelGeneration = (model: AIModel) => {
  $wikiGenerationContext.mut((draft) => {
    const result = draft.modelResults.find((r) => r.model === model)
    if (result) {
      result.status = 'generating'
    }
  })
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
  $wikiGenerationContext.mut((draft) => {
    // 해당 모델의 결과 업데이트
    const result = draft.modelResults.find((r) => r.model === model)
    if (result) {
      result.status = 'success'
      result.content = content
      result.notionUrl = notionUrl
      result.notionPageId = notionPageId
      result.error = undefined
    }

    // 모든 모델이 완료되었는지 확인
    const allCompleted = draft.modelResults.every(
      (r) => r.status === 'success' || r.status === 'error'
    )

    if (allCompleted) {
      const hasErrors = draft.modelResults.some((r) => r.status === 'error')
      draft.isCompleted = true
      draft.isGenerating = false
      draft.progress = 100
      draft.hasErrors = hasErrors
    }
  })
}

/**
 * 모델별 생성 실패
 */
export const setModelError = (model: AIModel, error: string) => {
  $wikiGenerationContext.mut((draft) => {
    // 해당 모델의 결과 업데이트
    const result = draft.modelResults.find((r) => r.model === model)
    if (result) {
      result.status = 'error'
      result.error = error
      result.content = undefined
      result.notionUrl = undefined
      result.notionPageId = undefined
    }

    // 모든 모델이 완료되었는지 확인
    const allCompleted = draft.modelResults.every(
      (r) => r.status === 'success' || r.status === 'error'
    )

    if (allCompleted) {
      draft.isCompleted = true
      draft.isGenerating = false
      draft.progress = 100
      draft.hasErrors = true
    }
  })
}

/**
 * 진행률 업데이트
 */
export const updateProgress = (progress: number) => {
  $wikiGenerationContext.mut((draft) => {
    draft.progress = progress
  })
}

/**
 * 위키 생성 액션 함수들을 그룹화한 객체
 */
export const wikiGenerationActions = {
  reset: resetWikiContext,
  startGeneration: startWikiGeneration,
  restartGeneration: restartWikiGeneration,
  setError: setWikiGenerationError,
  // setModelPrompt,
  // startModelGeneration,
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

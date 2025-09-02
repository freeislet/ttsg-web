import { atom } from '@illuxiza/nanostores-immer'
import { useStore } from '@nanostores/react'
import type { AIModel } from '@/lib/ai'
import type { Language } from '@/lib/notion'
import type { WikiGenerationResult } from '@/types/wiki'
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
 * 모델별 결과 설정
 */
export const setModelResult = (
  model: AIModel,
  result: Omit<WikiGenerationResult, 'model' | 'title' | 'version'>
) => {
  $wikiGenerationContext.mut((draft) => {
    // 해당 모델의 결과 업데이트
    const modelResult = draft.modelResults.find((r) => r.model === model)
    if (modelResult) {
      // 상태 결정: 에러가 있으면 error, 없으면 success
      modelResult.status = result.error ? 'error' : 'success'

      // 모든 필드 업데이트 (오류가 있어도 prompt, content는 보존)
      if (result.prompt !== undefined) modelResult.prompt = result.prompt
      if (result.content !== undefined) modelResult.content = result.content
      if (result.error !== undefined) modelResult.error = result.error
      if (result.notionUrl !== undefined) modelResult.notionUrl = result.notionUrl
      if (result.notionPageId !== undefined) modelResult.notionPageId = result.notionPageId
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
 * 진행률 업데이트
 */
export const updateProgress = (progress: number) => {
  $wikiGenerationContext.mut((draft) => {
    draft.progress = progress
  })
}

/**
 * 강제 완료 처리 (방어적 UI 업데이트)
 * 서버에서 완료 신호를 받았지만 일부 모델이 아직 완료되지 않은 경우 사용
 */
export const forceComplete = () => {
  $wikiGenerationContext.mut((draft) => {
    console.log('[Store] 강제 완료 처리 - 현재 상태:', {
      isGenerating: draft.isGenerating,
      modelResults: draft.modelResults.map(r => ({ model: r.model, status: r.status }))
    })
    
    // 아직 pending이나 generating 상태인 모델들을 success로 변경
    draft.modelResults.forEach((result) => {
      if (result.status === 'pending' || result.status === 'generating') {
        console.log(`[Store] 모델 ${result.model} 상태를 ${result.status}에서 success로 변경`)
        result.status = 'success'
        // 내용이 없으면 기본 메시지 추가
        if (!result.content) {
          result.content = '생성이 완료되었습니다. 노션에서 확인해주세요.'
        }
      }
    })
    
    // 전체 상태 업데이트
    draft.isGenerating = false
    draft.isCompleted = true
    draft.progress = 100
    
    // 에러가 있는 모델이 있는지 확인
    draft.hasErrors = draft.modelResults.some((r) => r.status === 'error')
    
    console.log('[Store] 강제 완료 처리 완료 - 최종 상태:', {
      isGenerating: draft.isGenerating,
      isCompleted: draft.isCompleted,
      progress: draft.progress,
      hasErrors: draft.hasErrors
    })
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
  startModelGeneration,
  setModelResult,
  updateProgress,
  forceComplete,
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

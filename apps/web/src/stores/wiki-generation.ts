import { map } from 'nanostores'
import type { WikiFormData } from '@/types/wiki-form'
import type { AIModel } from '@/lib/ai'
import type { Language } from '@/lib/notion'

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
export const wikiContextStore = map<WikiGenerationContext>({
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
 * 위키 생성 시작 액션
 */
export const startWikiGeneration = (formData: WikiFormData) => {
  const modelResults: WikiModelResult[] = formData.models.map(model => ({
    model,
    status: 'pending',
  }))

  wikiContextStore.setKey('topic', formData.topic)
  wikiContextStore.setKey('instruction', formData.instruction)
  wikiContextStore.setKey('language', formData.language)
  wikiContextStore.setKey('tags', formData.tags)
  wikiContextStore.setKey('isGenerating', true)
  wikiContextStore.setKey('progress', 0)
  wikiContextStore.setKey('modelResults', modelResults)
  wikiContextStore.setKey('isCompleted', false)
  wikiContextStore.setKey('hasErrors', false)
}

/**
 * 모델별 프롬프트 설정
 */
export const setModelPrompt = (model: AIModel, prompt: string) => {
  const currentResults = wikiContextStore.get().modelResults
  const updatedResults = currentResults.map(result => 
    result.model === model 
      ? { ...result, prompt }
      : result
  )
  wikiContextStore.setKey('modelResults', updatedResults)
}

/**
 * 모델별 생성 시작
 */
export const startModelGeneration = (model: AIModel) => {
  const currentResults = wikiContextStore.get().modelResults
  const updatedResults = currentResults.map(result => 
    result.model === model 
      ? { ...result, status: 'generating' as const }
      : result
  )
  wikiContextStore.setKey('modelResults', updatedResults)
}

/**
 * 모델별 생성 성공
 */
export const setModelSuccess = (model: AIModel, content: string, notionUrl: string, notionPageId: string) => {
  const currentResults = wikiContextStore.get().modelResults
  const updatedResults = currentResults.map(result => 
    result.model === model 
      ? { ...result, status: 'success' as const, content, notionUrl, notionPageId, error: undefined }
      : result
  )
  wikiContextStore.setKey('modelResults', updatedResults)
  
  // 모든 모델이 완료되었는지 확인
  const allCompleted = updatedResults.every(result => 
    result.status === 'success' || result.status === 'error'
  )
  
  if (allCompleted) {
    const hasErrors = updatedResults.some(result => result.status === 'error')
    wikiContextStore.setKey('isCompleted', true)
    wikiContextStore.setKey('isGenerating', false)
    wikiContextStore.setKey('hasErrors', hasErrors)
    wikiContextStore.setKey('progress', 100)
  }
}

/**
 * 모델별 생성 실패
 */
export const setModelError = (model: AIModel, error: string) => {
  const currentResults = wikiContextStore.get().modelResults
  const updatedResults = currentResults.map(result => 
    result.model === model 
      ? { ...result, status: 'error' as const, error, content: undefined, notionUrl: undefined, notionPageId: undefined }
      : result
  )
  wikiContextStore.setKey('modelResults', updatedResults)
  
  // 모든 모델이 완료되었는지 확인
  const allCompleted = updatedResults.every(result => 
    result.status === 'success' || result.status === 'error'
  )
  
  if (allCompleted) {
    wikiContextStore.setKey('isCompleted', true)
    wikiContextStore.setKey('isGenerating', false)
    wikiContextStore.setKey('hasErrors', true)
    wikiContextStore.setKey('progress', 100)
  }
}

/**
 * 진행률 업데이트
 */
export const updateProgress = (progress: number) => {
  wikiContextStore.setKey('progress', progress)
}

/**
 * 위키 생성 컨텍스트 초기화
 */
export const resetWikiContext = () => {
  wikiContextStore.set({
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

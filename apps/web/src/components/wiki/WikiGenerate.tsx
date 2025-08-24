import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import type { WikiGenerationResponse, WikiGenerationResult } from '@/types/wiki'
import { type WikiFormData, wikiFormSchema, defaultFormValues } from '@/types/wiki-form'
import TopicInput from './TopicInput'
import InstructionInput from './InstructionInput'
import LanguageSelector from './LanguageSelector'
import TagSelector from './TagSelector'
import ModelSelector from './ModelSelector'
import GenerationProgress from './GenerationProgress'
import ResultDisplay from './ResultDisplay'

/**
 * 위키 자동 생성 메인 컴포넌트
 * 주제 입력, AI 모델 선택, 생성 진행 상태, 결과 표시를 관리합니다.
 */
export default function WikiGenerate() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<WikiGenerationResult[]>([])

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<WikiFormData>({
    resolver: zodResolver(wikiFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  })

  const watchedValues = watch()

  /**
   * 위키 생성 요청을 처리하는 함수
   */
  const onSubmit = async (data: WikiFormData) => {
    setIsGenerating(true)
    setProgress(0)
    setResults([])

    try {
      const response = await fetch('/api/wiki/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: data.topic.trim(),
          models: data.models,
          language: data.language,
          tags: data.tags,
          instruction: data.instruction || undefined,
        }),
      })

      const result: WikiGenerationResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || '위키 생성에 실패했습니다.')
      }

      setResults(result.results)
      setProgress(100)
    } catch (err) {
      console.error('위키 생성 실패:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * 새로운 생성을 위한 초기화 함수
   */
  const handleReset = () => {
    reset(defaultFormValues)
    setProgress(0)
    setResults([])
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
          <Icon icon="mdi:auto-fix" className="w-8 h-8 mr-3 text-purple-600" />
          AI 위키 문서 만들기
        </h1>
        <p className="text-lg text-gray-600">
          AI를 활용하여 원하는 주제의 위키 문서를 자동으로 생성합니다.
        </p>
      </div>

      {/* 생성 폼 */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        {/* 주제 입력 */}
        <Controller
          name="topic"
          control={control}
          render={({ field }) => (
            <TopicInput
              value={field.value}
              onChange={field.onChange}
              error={errors.topic?.message}
              disabled={isGenerating}
            />
          )}
        />

        {/* 사용자 정의 지침 */}
        <Controller
          name="instruction"
          control={control}
          render={({ field }) => (
            <InstructionInput
              value={field.value}
              onChange={field.onChange}
              error={errors.instruction?.message}
              disabled={isGenerating}
            />
          )}
        />

        {/* 언어 선택 */}
        <Controller
          name="language"
          control={control}
          render={({ field }) => (
            <LanguageSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.language?.message}
              disabled={isGenerating}
            />
          )}
        />

        {/* 태그 선택 */}
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.tags?.message}
              disabled={isGenerating}
            />
          )}
        />

        {/* AI 모델 선택 */}
        <Controller
          name="models"
          control={control}
          render={({ field }) => (
            <ModelSelector
              selectedModels={field.value}
              onChange={field.onChange}
              error={errors.models?.message}
              disabled={isGenerating}
            />
          )}
        />

        {/* 생성 버튼 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isGenerating || !isValid}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                생성 중...
              </>
            ) : (
              <>
                <Icon icon="mdi:magic-staff" className="w-5 h-5 mr-2" />
                위키 생성하기
              </>
            )}
          </button>

          {results.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-50"
            >
              새로 생성
            </button>
          )}
        </div>
      </form>

      {/* 진행 상태 */}
      {isGenerating && (
        <GenerationProgress progress={progress} selectedModels={watchedValues.models} />
      )}

      {/* 결과 표시 */}
      {results.length > 0 && <ResultDisplay results={results} />}
    </div>
  )
}

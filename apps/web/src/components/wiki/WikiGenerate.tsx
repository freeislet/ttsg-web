import { Icon } from '@iconify/react'
import { useWikiGenerationForm, Controller, type WikiFormData } from '@/types/wiki-form'
import { useWikiGenerationStore } from '@/stores/wiki-generation'
import { generateWiki } from '@/client/wiki'
import { useAutoScroll } from '@/hooks/useAutoScroll'
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
  // 위키 생성 스토어 사용
  const wikiGeneration = useWikiGenerationStore()
  const { isGenerating, isCompleted, actions } = wikiGeneration

  // 자동 스크롤 훅 사용
  const progressRef = useAutoScroll<HTMLDivElement>(isGenerating)
  const resultsRef = useAutoScroll<HTMLDivElement>(isCompleted)

  // 폼 훅 사용
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useWikiGenerationForm()

  /**
   * 위키 생성 요청을 처리하는 함수
   */
  const onSubmit = async (data: WikiFormData) => {
    // 스토어 초기화 및 생성 시작
    actions.startGeneration(data)

    try {
      const response = await generateWiki(data)

      // 결과들을 스토어에 저장 (성공/실패 모두)
      response.results.forEach((result) => {
        actions.setModelResult(result.model, result)
      })
    } catch (err) {
      console.error('위키 생성 실패:', err)
      // 전체 API 요청 실패 처리
      actions.setError(
        `API 요청 실패: ${err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'}`
      )
    }
  }

  /**
   * 새로운 생성을 위한 초기화 함수
   */
  const handleReset = () => {
    reset()
    actions.restartGeneration()
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
              disabled={wikiGeneration.isGenerating}
            />
          )}
        />

        {/* 사용자 정의 지침 */}
        <Controller
          name="instruction"
          control={control}
          render={({ field }) => (
            <InstructionInput
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.instruction?.message}
              disabled={wikiGeneration.isGenerating}
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
              disabled={wikiGeneration.isGenerating}
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
              disabled={wikiGeneration.isGenerating}
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
              disabled={wikiGeneration.isGenerating}
            />
          )}
        />

        {/* 생성 버튼 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={wikiGeneration.isGenerating || !isValid}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {wikiGeneration.isGenerating ? (
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

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={wikiGeneration.isGenerating}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              초기화
            </button>
          </div>
        </div>
      </form>

      {/* 진행 상태 표시 */}
      {wikiGeneration.isGenerating && (
        <div ref={progressRef}>
          <GenerationProgress
            progress={wikiGeneration.progress}
            selectedModels={wikiGeneration.modelResults.map((result) => result.model)}
          />
        </div>
      )}

      {/* 결과 표시 */}
      {wikiGeneration.modelResults.some((result) => result.status !== 'pending') && (
        <div ref={resultsRef}>
          <ResultDisplay />
        </div>
      )}
    </div>
  )
}

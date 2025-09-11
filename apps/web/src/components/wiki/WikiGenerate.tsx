import { Icon } from '@iconify/react'
import { useWikiGenerationForm, type WikiFormData, Controller } from '@/types/wiki-form'
import { useWikiGenerationStore } from '@/stores/wiki-generation'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { generateWiki, generateWikiStream, type SSEEvent } from '@/client/wiki'
import TopicInput from './TopicInput'
import InstructionInput from './InstructionInput'
import LanguageSelector from './LanguageSelector'
import TagSelector from './TagSelector'
import ModelSelector from './ModelSelector'
import GenerationProgress from './GenerationProgress'
import GenerationResult from './GenerationResult'

/**
 * 위키 자동 생성 메인 컴포넌트
 * 주제 입력, AI 모델 선택, 생성 진행 상태, 결과 표시를 관리합니다.
 */
export default function WikiGenerate() {
  // 위키 생성 스토어 사용
  const wikiGeneration = useWikiGenerationStore()
  const { isGenerating, isCompleted, modelResults, actions } = wikiGeneration

  // 자동 스크롤 훅 사용
  const progressRef = useAutoScroll<HTMLDivElement>(isGenerating)
  const resultsRef = useAutoScroll<HTMLDivElement>(isCompleted)

  // 폼 훅 사용
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useWikiGenerationForm()

  /**
   * 위키 생성 요청을 처리하는 함수 (기본: 스트리밍, 필요시 일반 방식)
   */
  const onSubmit = async (data: WikiFormData) => {
    console.log('[UI] 위키 생성 시작:', data)

    // 스토어 초기화 및 생성 시작
    actions.startGeneration(data)

    // 타임아웃 설정 (5분)
    const timeoutId = setTimeout(
      () => {
        console.warn('[UI] 위키 생성 타임아웃 - 강제 완료 처리')
        actions.forceComplete()
      },
      5 * 60 * 1000
    )

    try {
      console.log('[UI] SSE 스트리밍 시작')
      // 스트리밍 방식으로 위키 생성
      await generateWikiStream(data, handleSSEEvent)
      console.log('[UI] SSE 스트리밍 정상 완료')

      // 스트림이 정상 종료되었지만 UI가 아직 생성 중이면 강제 완료
      if (isGenerating) {
        console.log('[UI] 스트림 완료 후 UI 상태 확인 - 강제 완료 처리')
        actions.forceComplete()
      }
    } catch (err) {
      console.error('[UI] 스트리밍 위키 생성 실패, 일반 방식으로 재시도:', err)

      try {
        console.log('[UI] 일반 API 호출 시작')
        // 스트리밍 실패 시 일반 방식으로 폴백
        const response = await generateWiki(data)
        console.log('[UI] 일반 API 호출 완료:', response)

        // 결과들을 스토어에 저장 (성공/실패 모두)
        response.results.forEach((result) => {
          const { model, title: _title, version: _version, ...rest } = result
          actions.setModelResult(model, rest)
        })
      } catch (fallbackErr) {
        console.error('[UI] 일반 위키 생성도 실패:', fallbackErr)
        actions.setError(
          `위키 생성 실패: ${fallbackErr instanceof Error ? fallbackErr.message : '알 수 없는 오류가 발생했습니다.'}`
        )
      }
    } finally {
      clearTimeout(timeoutId)
      console.log('[UI] 위키 생성 프로세스 종료')
    }
  }

  /**
   * SSE 이벤트를 처리하는 함수
   */
  const handleSSEEvent = (event: SSEEvent) => {
    console.log('[SSE Event]', event.type, event)

    switch (event.type) {
      case 'generation_start':
        console.log('[UI] 위키 생성 시작:', event.totalModels, '개 모델')
        break

      case 'model_start':
        console.log('[UI] 모델 생성 시작:', event.model)
        if (event.model) {
          actions.startModelGeneration(event.model)
        }
        if (event.progress !== undefined) {
          actions.updateProgress(event.progress)
        }
        break

      case 'model_complete':
        console.log('[UI] 모델 생성 완료:', event.model)
        if (event.model && event.result) {
          actions.setModelResult(event.model, event.result)
        }
        if (event.progress !== undefined) {
          actions.updateProgress(event.progress)
        }
        break

      case 'generation_complete':
        console.log('[UI] 전체 위키 생성 완료 - UI 상태 강제 업데이트')
        // 방어적 완료 처리: 모든 모델이 완료되지 않았어도 강제로 완료 상태로 변경
        actions.forceComplete()
        break

      case 'error':
        console.error('[UI] 위키 생성 오류:', event.error)
        if (event.error) {
          actions.setError(event.error)
        }
        break

      default:
        console.warn('[UI] 알 수 없는 SSE 이벤트:', event)
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
            selectedModels={watch('models')}
            isGenerating={isGenerating}
            modelResults={modelResults}
          />
        </div>
      )}

      {/* 결과 표시 - 생성 완료 또는 에러가 발생한 모델이 있을 때만 표시 */}
      {wikiGeneration.modelResults.some(
        (result) => result.status === 'success' || result.status === 'error'
      ) && (
        <div ref={resultsRef}>
          <GenerationResult />
        </div>
      )}
    </div>
  )
}

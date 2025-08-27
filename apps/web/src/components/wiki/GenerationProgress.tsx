import { Icon } from '@iconify/react'
import { type AIModel, getModelMeta } from '@/lib/ai'
import type { WikiModelResult } from '@/stores/wiki-generation'

interface GenerationProgressProps {
  progress: number
  selectedModels: AIModel[]
  isGenerating?: boolean
  modelResults?: WikiModelResult[]
}

/**
 * 위키 생성 진행 상태 표시 컴포넌트
 * 선택된 모델별 생성 진행률과 상태를 표시합니다.
 */
export default function GenerationProgress({
  progress,
  selectedModels,
  isGenerating = false,
  modelResults = [],
}: GenerationProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Icon icon="mdi:progress-clock" className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">생성 진행 상황</h2>
      </div>

      {/* 전체 진행률 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">전체 진행률</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 모델별 상태 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">선택된 모델</h3>
        {selectedModels.map((model, index) => {
          const modelResult = modelResults.find(r => r.model === model)
          const modelProgress = Math.min(100, (progress / selectedModels.length) * (index + 1))
          
          // 모델 결과에 따라 상태 결정
          const isCompleted = modelResult?.status === 'success'
          const isError = modelResult?.status === 'error'
          const isInProgress = modelResult?.status === 'generating' || 
                             (isGenerating && !modelResult && index === 0) // 첫 번째 모델인 경우
          const isPending = !modelResult || modelResult.status === 'pending'
          
          // 상태에 따른 아이콘과 텍스트
          let statusIcon = 'mdi:clock-outline'
          let statusText = '대기 중'
          let iconClass = 'text-gray-400'
          
          if (isCompleted) {
            statusIcon = 'mdi:check-circle'
            statusText = '완료'
            iconClass = 'text-green-500'
          } else if (isError) {
            statusIcon = 'mdi:alert-circle'
            statusText = '실패'
            iconClass = 'text-red-500'
          } else if (isInProgress) {
            statusIcon = 'mdi:loading'
            statusText = '생성 중'
            iconClass = 'text-blue-500 animate-spin'
          }

          return (
            <div key={model} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <Icon 
                  icon={statusIcon} 
                  className={`w-5 h-5 ${iconClass} ${statusIcon === 'mdi:loading' ? 'animate-spin' : ''}`} 
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {getModelMeta(model, { useFallback: true }).name}
                  </span>
                  <span className={`text-xs ${isError ? 'text-red-600' : 'text-gray-500'}`}>
                    {statusText}
                  </span>
                </div>
                {isError && modelResult?.error && (
                  <div className="mt-1 text-xs text-red-500">
                    {modelResult.error}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <Icon icon="mdi:information" className="w-4 h-4 text-blue-500 mr-2" />
          <span className="text-sm text-blue-700">
            각 모델별로 개별 노션 페이지가 생성됩니다. 잠시만 기다려주세요.
          </span>
        </div>
      </div>
    </div>
  )
}

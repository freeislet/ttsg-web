import { Icon } from '@iconify/react'
import { type AIModel, AI_MODELS, getColorClasses } from '@/lib/ai'

interface ModelSelectorProps {
  selectedModels: AIModel[]
  onChange: (models: AIModel[]) => void
  error?: string
  disabled?: boolean
}

/**
 * AI 모델 선택 컴포넌트
 * 사용자가 위키 생성에 사용할 AI 모델을 다중 선택할 수 있습니다.
 */
export default function ModelSelector({
  selectedModels,
  onChange,
  error,
  disabled = false,
}: ModelSelectorProps) {
  /**
   * 모델 선택/해제 처리 함수
   */
  const handleModelToggle = (modelId: AIModel) => {
    if (selectedModels.includes(modelId)) {
      onChange(selectedModels.filter((id) => id !== modelId))
    } else {
      onChange([...selectedModels, modelId])
    }
  }

  /**
   * 전체 선택/해제 처리 함수
   */
  const handleSelectAll = () => {
    if (selectedModels.length === AI_MODELS.length) {
      onChange([])
    } else {
      onChange(AI_MODELS.map((model) => model.model))
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <Icon icon="mdi:robot" className="w-4 h-4 inline mr-1" />
          AI 모델
        </label>
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={disabled}
          className="text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400"
        >
          {selectedModels.length === AI_MODELS.length ? '전체 해제' : '전체 선택'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {AI_MODELS.map((model) => {
          const isSelected = selectedModels.includes(model.model)
          const colorClasses = getColorClasses(model.colors, isSelected)

          return (
            <div
              key={model.model}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                colorClasses.border
              } ${colorClasses.bg} ${
                !isSelected ? 'hover:border-gray-300' : ''
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={() => !disabled && handleModelToggle(model.model)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleModelToggle(model.model)}
                    disabled={disabled}
                    className={`w-5 h-5 ${colorClasses.checkbox} border-gray-300 rounded`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Icon icon={model.icon} className={`w-5 h-5 ${colorClasses.text}`} />
                    <h3 className="text-sm font-medium text-gray-900">{model.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{model.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center text-sm text-red-600">
          <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      <div className="text-xs text-gray-500">
        <Icon icon="mdi:information-outline" className="w-3 h-3 inline mr-1" />
        선택된 각 모델별로 개별 위키 문서가 생성됩니다. ({selectedModels.length}개 선택됨)
      </div>
    </div>
  )
}

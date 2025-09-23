import React, { useState, useCallback } from 'react'
import { 
  Brain, 
  Play, 
  Square, 
  BarChart3, 
  Settings,
  Layers,
  Target,
  Zap,
  Edit3
} from 'lucide-react'
import { ModelNodeData, LayerConfig, TrainingConfig, IModelComponent } from '@/types/ModelNode'
import { LayerEditor as LayerEditorModal } from '@/components/layer-editor'

// 기본 레이어 설정은 LayerEditor 타입 정의로 이동됨

// 기존 LayerEditor 컴포넌트는 새로운 React Flow 기반 레이어 에디터로 대체됨

/**
 * 학습 설정 컴포넌트
 */
const TrainingConfigEditor: React.FC<{
  config: TrainingConfig
  onUpdate: (config: TrainingConfig) => void
  mode: 'node' | 'panel'
}> = ({ config, onUpdate, mode }) => {
  const isCompact = mode === 'node'
  
  const handleChange = (field: keyof TrainingConfig, value: any) => {
    onUpdate({ ...config, [field]: value })
  }
  
  if (isCompact) {
    return (
      <div className="p-2 bg-blue-50 rounded text-xs">
        <div className="font-medium mb-1">학습 설정</div>
        <div className="text-gray-600">
          {config.optimizer} | {config.epochs} epochs
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Settings className="w-4 h-4" />
        학습 설정
      </h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">옵티마이저</label>
          <select
            value={config.optimizer}
            onChange={(e) => handleChange('optimizer', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="adam">Adam</option>
            <option value="sgd">SGD</option>
            <option value="rmsprop">RMSprop</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">손실 함수</label>
          <select
            value={config.loss}
            onChange={(e) => handleChange('loss', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="meanSquaredError">MSE</option>
            <option value="categoricalCrossentropy">Categorical CE</option>
            <option value="binaryCrossentropy">Binary CE</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">에포크</label>
          <input
            type="number"
            value={config.epochs}
            onChange={(e) => handleChange('epochs', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">배치 크기</label>
          <input
            type="number"
            value={config.batchSize}
            onChange={(e) => handleChange('batchSize', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * 신경망 모델 컴포넌트 구현
 */
export const NeuralNetworkModelComponent: IModelComponent = {
  type: 'neural-network',
  name: '신경망',
  description: '다층 퍼셉트론 신경망 모델',
  
  renderNode: (data: ModelNodeData, onUpdate: (data: Partial<ModelNodeData>) => void) => {
    // 레이어 편집은 새로운 React Flow 기반 에디터에서 처리
    
    return (
      <div className="space-y-2">
        {/* 모델 구조 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">레이어 구조</span>
            <span className="text-xs text-gray-500">
              {data.layers?.length || 0}개 레이어
            </span>
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {data.layers?.map((layer, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                <span className="font-medium">{layer.type}</span>
                {layer.units && <span>({layer.units})</span>}
                {layer.filters && <span>({layer.filters})</span>}
              </div>
            ))}
            {(!data.layers || data.layers.length === 0) && (
              <div className="text-xs text-gray-500 text-center py-2">
                레이어 편집 버튼을 클릭하여 레이어를 추가하세요
              </div>
            )}
          </div>
        </div>
        
        {/* 학습 설정 (configured 상태 이상에서만 표시) */}
        {data.state !== 'definition' && data.trainingConfig && (
          <TrainingConfigEditor
            config={data.trainingConfig}
            onUpdate={(config) => onUpdate({ trainingConfig: config })}
            mode="node"
          />
        )}
      </div>
    )
  },
  
  renderPanel: (data: ModelNodeData, onUpdate: (data: Partial<ModelNodeData>) => void) => {
    const [activeTab, setActiveTab] = useState<'structure' | 'training' | 'results'>('structure')
    const [isLayerEditorOpen, setIsLayerEditorOpen] = useState(false)
    
    const startTraining = useCallback(() => {
      if (data.trainingConfig) {
        onUpdate({ 
          state: 'training',
          trainingProgress: {
            epoch: 0,
            totalEpochs: data.trainingConfig.epochs,
            loss: 0,
            isTraining: true,
            startTime: new Date()
          }
        })
      }
    }, [data.trainingConfig, onUpdate])
    
    const stopTraining = useCallback(() => {
      onUpdate({ 
        state: 'configured',
        trainingProgress: {
          ...data.trainingProgress!,
          isTraining: false,
          endTime: new Date()
        }
      })
    }, [data.trainingProgress, onUpdate])
    
    return (
      <div className="space-y-4">
        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'structure'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-1" />
            구조
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'training'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Play className="w-4 h-4 inline mr-1" />
            학습
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'results'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            결과
          </button>
        </div>
        
        {/* 탭 내용 */}
        {activeTab === 'structure' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">모델 구조</h4>
              <button
                onClick={() => setIsLayerEditorOpen(true)}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                레이어 편집
              </button>
            </div>
            
            {/* 레이어 요약 표시 */}
            <div className="space-y-2">
              {data.layers && data.layers.length > 0 ? (
                data.layers.map((layer, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} 레이어
                      </span>
                      <div className="text-xs text-gray-500">
                        {layer.units && `${layer.units} units`}
                        {layer.filters && `${layer.filters} filters`}
                        {layer.rate && `${(layer.rate * 100).toFixed(0)}% dropout`}
                        {layer.activation && ` (${layer.activation})`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Layers className="w-8 h-8 mx-auto mb-2" />
                  <p>레이어가 없습니다</p>
                  <p className="text-xs">레이어 편집 버튼을 클릭하여 모델 구조를 설계해보세요</p>
                </div>
              )}
            </div>
            
            {/* 레이어 에디터 모달 */}
            <LayerEditorModal
              isOpen={isLayerEditorOpen}
              onClose={() => setIsLayerEditorOpen(false)}
              initialLayers={data.layers || []}
              onSave={(layers) => {
                onUpdate({ layers })
                setIsLayerEditorOpen(false)
              }}
            />
          </div>
        )}
        
        {activeTab === 'training' && (
          <div className="space-y-4">
            {data.trainingConfig ? (
              <TrainingConfigEditor
                config={data.trainingConfig}
                onUpdate={(config) => onUpdate({ trainingConfig: config })}
                mode="panel"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-8 h-8 mx-auto mb-2" />
                <p>학습 설정을 구성해주세요</p>
                <button
                  onClick={() => onUpdate({
                    trainingConfig: {
                      optimizer: 'adam',
                      loss: 'meanSquaredError',
                      metrics: ['accuracy'],
                      epochs: 100,
                      batchSize: 32,
                      validationSplit: 0.2
                    }
                  })}
                  className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  기본 설정 적용
                </button>
              </div>
            )}
            
            {/* 학습 제어 버튼 */}
            {data.trainingConfig && (
              <div className="flex gap-2">
                {data.state !== 'training' ? (
                  <button
                    onClick={startTraining}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <Play className="w-4 h-4" />
                    학습 시작
                  </button>
                ) : (
                  <button
                    onClick={stopTraining}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Square className="w-4 h-4" />
                    학습 중지
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'results' && (
          <div className="space-y-4">
            {data.metrics ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  성능 지표
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">Loss</div>
                    <div className="text-lg font-bold">{data.metrics.loss?.toFixed(4)}</div>
                  </div>
                  
                  {data.metrics.accuracy && (
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600">Accuracy</div>
                      <div className="text-lg font-bold">{(data.metrics.accuracy * 100).toFixed(1)}%</div>
                    </div>
                  )}
                </div>
                
                {/* 학습 곡선 (간단한 시각화) */}
                {data.lossHistory && data.lossHistory.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600 mb-2">학습 곡선</div>
                    <div className="h-20 flex items-end gap-1">
                      {data.lossHistory.slice(-20).map((loss, index) => (
                        <div
                          key={index}
                          className="bg-blue-500 w-2 rounded-t"
                          style={{ 
                            height: `${Math.max(5, (1 - loss) * 100)}%` 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                <p>학습 결과가 없습니다</p>
                <p className="text-xs">모델을 학습한 후 결과를 확인할 수 있습니다</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
  
  getDefaultConfig: () => ({
    state: 'definition' as const,
    layers: [
      { type: 'dense', units: 128, activation: 'relu' },
      { type: 'dense', units: 64, activation: 'relu' },
      { type: 'dense', units: 1, activation: 'sigmoid' }
    ],
    trainingConfig: {
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2
    }
  }),
  
  validateConfig: (data: ModelNodeData) => {
    const errors: string[] = []
    
    if (!data.layers || data.layers.length === 0) {
      errors.push('최소 하나의 레이어가 필요합니다')
    }
    
    if (data.layers) {
      data.layers.forEach((layer, index) => {
        if (layer.type === 'dense' && (!layer.units || layer.units <= 0)) {
          errors.push(`레이어 ${index + 1}: Dense 레이어는 유닛 수가 필요합니다`)
        }
        if (layer.type === 'conv2d' && (!layer.filters || layer.filters <= 0)) {
          errors.push(`레이어 ${index + 1}: Conv2D 레이어는 필터 수가 필요합니다`)
        }
        if (layer.type === 'dropout' && (layer.rate === undefined || layer.rate < 0 || layer.rate >= 1)) {
          errors.push(`레이어 ${index + 1}: Dropout 비율은 0과 1 사이여야 합니다`)
        }
      })
    }
    
    if (data.trainingConfig) {
      if (data.trainingConfig.epochs <= 0) {
        errors.push('에포크는 1 이상이어야 합니다')
      }
      if (data.trainingConfig.batchSize <= 0) {
        errors.push('배치 크기는 1 이상이어야 합니다')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ModelNodeData, LayerConfig } from '@/types'
import { Brain, Plus, Trash2, Settings } from 'lucide-react'

/**
 * 모델 정의 노드 컴포넌트
 * 신경망 모델의 구조를 정의하고 레이어를 구성하는 노드
 */
const ModelNode: React.FC<NodeProps<ModelNodeData>> = ({ id, data, selected }) => {
  const [showLayerEditor, setShowLayerEditor] = React.useState(false)

  // 레이어 추가
  const addLayer = () => {
    const newLayer: LayerConfig = {
      type: 'dense',
      units: 32,
      activation: 'relu',
    }

    // TODO: 상태 관리 시스템에 연결 (Valtio 사용)
    console.log('레이어 추가:', newLayer)
  }

  // 레이어 제거
  const removeLayer = (index: number) => {
    // TODO: 상태 관리 시스템에 연결
    console.log('레이어 제거:', index)
  }

  // 레이어 수정
  const updateLayer = (index: number, updates: Partial<LayerConfig>) => {
    // TODO: 상태 관리 시스템에 연결
    console.log('레이어 수정:', index, updates)
  }

  // 모델 학습 노드 생성
  const createTrainingNode = () => {
    // TODO: 새로운 TrainingNode 생성 로직
    console.log('학습 노드 생성')
  }

  const getModelTypeColor = () => {
    switch (data.modelType) {
      case 'neural-network':
        return 'text-blue-600'
      case 'cnn':
        return 'text-green-600'
      case 'rnn':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[320px] bg-blue-50 border-blue-300
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        transition-all duration-200
        text-blue-800
      `}
    >
      {/* 입력 형태 연결 - 훈련 데이터의 dataShape에서 */}
      <div className="relative mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Handle
              type="target"
              position={Position.Left}
              id="inputShape"
              className="w-2 h-2 bg-blue-500 border border-white relative"
              style={{ position: 'relative', left: -8, top: 0 }}
            />
            <span className="text-xs text-blue-700">입력 형태:</span>
          </div>
          <span className="text-xs font-mono">
            {Array.isArray(data.inputShape) ? `[${data.inputShape.join(', ')}]` : data.inputShape}
          </span>
        </div>
      </div>

      {/* 출력 유닛 연결 - 훈련 데이터의 outputClasses에서 */}
      <div className="relative mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Handle
              type="target"
              position={Position.Left}
              id="outputUnits"
              className="w-2 h-2 bg-blue-500 border border-white relative"
              style={{ position: 'relative', left: -8, top: 0 }}
            />
            <span className="text-xs text-blue-700">출력 유닛:</span>
          </div>
          <span className="text-xs font-mono">
            {typeof data.outputUnits === 'number' ? data.outputUnits : data.outputUnits}
          </span>
        </div>
      </div>

      {/* 노드 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-sm">{data.label}</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs px-2 py-1 rounded-full bg-white ${getModelTypeColor()}`}>
            {data.modelType}
          </span>
        </div>
      </div>

      {/* 모델 타입 선택 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-blue-700 mb-1">모델 타입</label>
        <select
          value={data.modelType}
          onChange={(e) => {
            // TODO: 상태 업데이트
            console.log('모델 타입 변경:', e.target.value)
          }}
          className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="neural-network">신경망</option>
          <option value="cnn">CNN</option>
          <option value="rnn">RNN</option>
        </select>
      </div>

      {/* 입력/출력 형태 */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">입력 형태</label>
          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {Array.isArray(data.inputShape) ? `[${data.inputShape.join(', ')}]` : data.inputShape}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">출력 유닛</label>
          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {data.outputUnits}
          </div>
        </div>
      </div>

      {/* 레이어 구성 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-blue-700">레이어 구성</label>
          <button
            onClick={() => setShowLayerEditor(!showLayerEditor)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1">
          {data.layers.map((layer, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-blue-100 px-2 py-1 rounded text-xs"
            >
              <span className="text-blue-700">
                {layer.type} ({layer.units} units, {layer.activation})
              </span>
              {showLayerEditor && (
                <button
                  onClick={() => removeLayer(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {showLayerEditor && (
          <button
            onClick={addLayer}
            className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-200 text-blue-700 rounded hover:bg-blue-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            레이어 추가
          </button>
        )}
      </div>

      {/* 컴파일 상태 */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${data.isCompiled ? 'bg-green-400' : 'bg-gray-300'}`}
        />
        <span className="text-xs text-gray-600">
          {data.isCompiled ? '컴파일됨' : '컴파일 대기'}
        </span>
      </div>

      {/* 학습 노드 생성 버튼 */}
      <button
        onClick={createTrainingNode}
        className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
      >
        모델 학습 노드 생성
      </button>

      {/* 모델 구성 출력 - 학습 노드의 modelDefinition으로 */}
      <div className="relative mt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-700">모델 구성:</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono">{data.layers.length}개 레이어</span>
            <Handle
              type="source"
              position={Position.Right}
              id="modelConfig"
              className="w-2 h-2 bg-blue-500 border border-white relative"
              style={{ position: 'relative', right: -8, top: 0 }}
            />
          </div>
        </div>
      </div>

      {/* 컴파일 상태 출력 - 학습 노드로 */}
      <div className="relative mt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-700">컴파일 상태:</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${data.isCompiled ? 'text-green-600' : 'text-gray-500'}`}>
              {data.isCompiled ? '완료' : '대기'}
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="compiledModel"
              className="w-2 h-2 bg-blue-500 border border-white relative"
              style={{ position: 'relative', right: -8, top: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelNode

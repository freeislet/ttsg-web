import React from 'react'
import { Settings, Info, Layers } from 'lucide-react'
import { useModelSnapshot } from '@/stores/modelStore'
import { LayerNodeData, ModelNodeData, DataNodeData } from '@/types'

const NodeProperties: React.FC = () => {
  const { selectedNode, nodes } = useModelSnapshot()

  const selectedNodeData = selectedNode ? nodes.find((node) => node.id === selectedNode) : null

  if (!selectedNodeData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <Info size={48} className="mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">노드 속성</h3>
        <p className="text-sm text-center">
          노드를 선택하면
          <br />
          속성을 확인하고 편집할 수 있습니다
        </p>
      </div>
    )
  }

  const renderLayerProperties = (data: LayerNodeData) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">레이어 타입</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
          {data.type === 'input'
            ? '입력 레이어'
            : data.type === 'output'
              ? '출력 레이어'
              : '히든 레이어'}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">뉴런 수</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">{data.neurons}개</div>
      </div>

      {data.activation && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">활성화 함수</label>
          <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">{data.activation}</div>
        </div>
      )}

      {data.weights && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">가중치 상태</label>
          <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
            {data.weights.length}×{data.weights[0]?.length || 0} 행렬
          </div>
        </div>
      )}

      {data.isActive !== undefined && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">활성 상태</label>
          <div
            className={`px-3 py-2 border rounded-md text-sm ${
              data.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
            }`}
          >
            {data.isActive ? '활성' : '비활성'}
          </div>
        </div>
      )}
    </div>
  )

  const renderModelProperties = (data: ModelNodeData) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">모델 타입</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">신경망</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">학습률</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
          {data.hyperparameters.learningRate}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">에포크</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
          {data.hyperparameters.epochs}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">배치 크기</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
          {data.hyperparameters.batchSize}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">옵티마이저</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
          {data.hyperparameters.optimizer}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">손실 함수</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
          {data.hyperparameters.loss}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">컴파일 상태</label>
          <div
            className={`px-3 py-2 border rounded-md text-sm ${
              data.isCompiled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
            }`}
          >
            {data.isCompiled ? '완료' : '미완료'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학습 상태</label>
          <div
            className={`px-3 py-2 border rounded-md text-sm ${
              data.isTrained ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
            }`}
          >
            {data.isTrained ? '완료' : '미완료'}
          </div>
        </div>
      </div>
    </div>
  )

  const renderDataProperties = (data: DataNodeData) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">데이터 타입</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
          {data.dataType === 'training' ? '훈련 데이터' : '테스트 데이터'}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">샘플 수</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
          {data.samples.toLocaleString()}개
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">특성 수</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">{data.features}개</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">데이터 형태</label>
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
          [{data.shape.join(', ')}]
        </div>
      </div>
    </div>
  )

  const getNodeIcon = () => {
    switch (selectedNodeData.data.type) {
      case 'input':
      case 'hidden':
      case 'output':
        return <Layers size={20} />
      case 'model':
        return <Settings size={20} />
      case 'data':
        return <Info size={20} />
      default:
        return <Info size={20} />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        {getNodeIcon()}
        <div>
          <h3 className="font-medium text-gray-900">{selectedNodeData.data.label}</h3>
          <p className="text-xs text-gray-500">ID: {selectedNodeData.id}</p>
        </div>
      </div>

      {/* 속성 내용 */}
      <div className="flex-1 p-4 overflow-auto">
        {selectedNodeData.data.type === 'model' &&
          renderModelProperties(selectedNodeData.data as ModelNodeData)}
        {['input', 'hidden', 'output'].includes(selectedNodeData.data.type) &&
          renderLayerProperties(selectedNodeData.data as LayerNodeData)}
        {selectedNodeData.data.type === 'data' &&
          renderDataProperties(selectedNodeData.data as DataNodeData)}
      </div>
    </div>
  )
}

export default NodeProperties

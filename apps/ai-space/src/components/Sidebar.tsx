import React from 'react'
import { useModelStore } from '@/stores/modelStore'
import { ModelRegistry } from '@/models/ModelRegistry'
import { 
  Brain, 
  Database, 
  Play, 
  Trash2, 
  Info,
  Layers,
  Zap,
  Target
} from 'lucide-react'

/**
 * 사이드바 컴포넌트
 */
const Sidebar: React.FC = () => {
  const {
    nodes,
    edges,
    selectedNodeId,
    addModelNode,
    addTrainingNode,
    addDataNode,
    removeNode,
    clearAll,
    getAvailableModelTypes,
    getDebugInfo
  } = useModelStore()

  const debugInfo = getDebugInfo()
  const selectedNode = nodes.find(node => node.id === selectedNodeId)

  /**
   * 노드 추가 핸들러
   */
  const handleAddNode = (type: 'data' | 'model', modelType?: string) => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100
    }

    switch (type) {
      case 'data':
        addDataNode(position)
        break
      case 'model':
        if (modelType) {
          addModelNode(modelType, position)
        }
        break
    }
  }

  /**
   * 학습 노드 추가 (선택된 모델 노드 기준)
   */
  const handleAddTrainingNode = () => {
    if (!selectedNode || !selectedNode.data?.modelId) return

    const position = {
      x: selectedNode.position.x + 350,
      y: selectedNode.position.y
    }

    // 모델 타입 추출
    const modelType = selectedNode.data.modelType || 'neural-network'
    addTrainingNode(modelType, position, selectedNode.data.modelId)
  }

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          AI Space v2
        </h2>
        <p className="text-sm text-gray-600 mt-1">새로운 아키텍처</p>
      </div>

      {/* 노드 추가 섹션 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          노드 추가
        </h3>

        <div className="space-y-2">
          {/* 데이터 노드 */}
          <button
            onClick={() => handleAddNode('data')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors"
          >
            <Database className="w-4 h-4 text-yellow-600" />
            훈련 데이터
          </button>

          {/* 모델 노드들 */}
          {getAvailableModelTypes().map(modelType => {
            const displayName = ModelRegistry.getDisplayName(modelType)
            return (
              <button
                key={modelType}
                onClick={() => handleAddNode('model', modelType)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <Brain className="w-4 h-4 text-blue-600" />
                {displayName}
              </button>
            )
          })}
        </div>
      </div>

      {/* 선택된 노드 정보 */}
      {selectedNode && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            선택된 노드
          </h3>

          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">타입:</span>
              <span className="font-mono">{selectedNode.type}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">ID:</span>
              <span className="font-mono">{selectedNode.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">라벨:</span>
              <span>{selectedNode.data?.label || 'N/A'}</span>
            </div>

            <div className="flex gap-2 pt-2">
              {/* 학습 노드 추가 (모델 노드인 경우) */}
              {selectedNode.data?.modelId && (
                <button
                  onClick={handleAddTrainingNode}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  학습 노드
                </button>
              )}

              {/* 노드 삭제 */}
              <button
                onClick={() => removeNode(selectedNode.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상태 정보 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          상태 정보
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">노드 수:</span>
            <span className="font-mono">{debugInfo.nodeCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">연결 수:</span>
            <span className="font-mono">{debugInfo.edgeCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">모델 인스턴스:</span>
            <span className="font-mono">{debugInfo.modelInstanceCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">등록된 모델:</span>
            <span className="font-mono">{debugInfo.registeredModelTypes.length}</span>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="p-4 mt-auto">
        <div className="space-y-2">
          <button
            onClick={clearAll}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            모두 삭제
          </button>
        </div>
      </div>

      {/* 디버그 정보 (개발 모드) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600 mb-2">디버그 정보</summary>
            <pre className="text-xs text-gray-500 overflow-auto max-h-32">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default Sidebar

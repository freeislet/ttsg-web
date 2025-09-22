import React from 'react'
import { useModelStore } from '@/stores/modelStore'
import { Brain, Database, Trash2, Info, Settings } from 'lucide-react'

/**
 * 노드 속성 패널 컴포넌트
 */
const NodeProperties: React.FC = () => {
  const {
    nodes,
    selectedNodeId,
    removeNode,
  } = useModelStore()

  const selectedNode = nodes.find((node) => node.id === selectedNodeId)

  console.log('🔍 NodeProperties render:', { selectedNodeId, selectedNode: !!selectedNode })

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            속성 패널
          </h3>
        </div>

        {/* 빈 상태 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">노드를 선택하면</p>
            <p className="text-sm">속성을 확인할 수 있습니다</p>
          </div>
        </div>
      </div>
    )
  }

  const handleRemoveNode = () => {
    if (selectedNode) {
      removeNode(selectedNode.id)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {selectedNode.type === 'model' ? (
              <Brain className="w-5 h-5 text-blue-500" />
            ) : (
              <Database className="w-5 h-5 text-yellow-500" />
            )}
            {selectedNode.type === 'model' ? '모델 노드' : '데이터 노드'}
          </h3>
          <button
            onClick={handleRemoveNode}
            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="노드 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 노드 정보 */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-4">
          {/* 기본 정보 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">기본 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-xs">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">타입:</span>
                <span className="capitalize">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">라벨:</span>
                <span>{selectedNode.data?.label || '라벨 없음'}</span>
              </div>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">위치</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">X:</span>
                <span>{Math.round(selectedNode.position.x)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Y:</span>
                <span>{Math.round(selectedNode.position.y)}</span>
              </div>
            </div>
          </div>

          {/* 모델 노드 전용 정보 */}
          {selectedNode.type === 'model' && (
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">모델 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">모델 타입:</span>
                  <span>{selectedNode.data?.modelType || '알 수 없음'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">상태:</span>
                  <span className="capitalize">{selectedNode.data?.state || 'definition'}</span>
                </div>
              </div>
            </div>
          )}

          {/* 데이터 노드 전용 정보 */}
          {selectedNode.type === 'data' && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">데이터 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">샘플 수:</span>
                  <span>{selectedNode.data?.samples || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">입력 특성:</span>
                  <span>{selectedNode.data?.inputFeatures || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">출력 특성:</span>
                  <span>{selectedNode.data?.outputFeatures || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* 디버그 정보 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">원시 데이터</h4>
            <pre className="text-xs text-gray-600 overflow-auto max-h-32 bg-white p-2 rounded border">
              {JSON.stringify(selectedNode.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NodeProperties

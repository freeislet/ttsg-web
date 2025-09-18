import React from 'react'
import { Settings, Info, Brain, Database } from 'lucide-react'
import { useModelStore } from '@/stores/modelStore'

const NodeProperties: React.FC = () => {
  const { selectedNodeId, nodes, getModelInstance } = useModelStore()

  const selectedNodeData = selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) : null

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

  const getNodeIcon = () => {
    switch (selectedNodeData.type) {
      case 'neural-network-model':
        return <Brain size={20} />
      case 'neural-network-training':
        return <Settings size={20} />
      case 'data':
        return <Database size={20} />
      default:
        return <Info size={20} />
    }
  }

  const getNodeTypeName = () => {
    switch (selectedNodeData.type) {
      case 'neural-network-model':
        return '신경망 모델'
      case 'neural-network-training':
        return '신경망 학습'
      case 'data':
        return '데이터'
      default:
        return '알 수 없음'
    }
  }

  const renderNodeProperties = () => {
    const data = selectedNodeData.data
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">노드 타입</label>
          <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
            {getNodeTypeName()}
          </div>
        </div>

        {data.modelId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모델 ID</label>
            <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm font-mono text-xs">
              {data.modelId}
            </div>
          </div>
        )}

        {data.config && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설정</label>
            <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(data.config, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {data.status && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <div className={`px-3 py-2 border rounded-md text-sm ${
              data.status === 'ready' ? 'bg-green-50 text-green-700' :
              data.status === 'training' ? 'bg-blue-50 text-blue-700' :
              data.status === 'error' ? 'bg-red-50 text-red-700' :
              'bg-gray-50 text-gray-700'
            }`}>
              {data.status}
            </div>
          </div>
        )}

        {data.progress !== undefined && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">진행률</label>
            <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
              {Math.round(data.progress * 100)}%
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        {getNodeIcon()}
        <div>
          <h3 className="font-medium text-gray-900">{selectedNodeData.data.label || getNodeTypeName()}</h3>
          <p className="text-xs text-gray-500">ID: {selectedNodeData.id}</p>
        </div>
      </div>

      {/* 속성 내용 */}
      <div className="flex-1 p-4 overflow-auto">
        {renderNodeProperties()}
      </div>
    </div>
  )
}

export default NodeProperties

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { LayerNodeData } from '@/types'
import { modelActions } from '@/stores/modelStore'

const LayerNode: React.FC<NodeProps<LayerNodeData>> = ({ id, data, selected }) => {
  const handleNeuronsChange = (neurons: number) => {
    modelActions.updateNode(id, { neurons })
  }

  const handleActivationChange = (activation: LayerNodeData['activation']) => {
    modelActions.updateNode(id, { activation })
  }

  const getNodeColor = () => {
    switch (data.type) {
      case 'input':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'hidden':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'output':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getActivationColor = (activation?: string) => {
    switch (activation) {
      case 'relu':
        return 'bg-orange-100 text-orange-800'
      case 'sigmoid':
        return 'bg-purple-100 text-purple-800'
      case 'tanh':
        return 'bg-indigo-100 text-indigo-800'
      case 'softmax':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[200px]
        ${getNodeColor()}
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${data.isActive ? 'animate-pulse' : ''}
        transition-all duration-200
      `}
    >
      {/* 입력 핸들 */}
      {data.type !== 'input' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}

      {/* 노드 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{data.label}</h3>
        <span className="text-xs px-2 py-1 bg-white rounded-full font-mono">
          {data.neurons}
        </span>
      </div>

      {/* 뉴런 수 설정 */}
      <div className="mb-2">
        <label className="block text-xs font-medium mb-1">뉴런 수</label>
        <input
          type="number"
          min="1"
          max="1000"
          value={data.neurons}
          onChange={(e) => handleNeuronsChange(parseInt(e.target.value) || 1)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 활성화 함수 설정 (입력 레이어 제외) */}
      {data.type !== 'input' && (
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">활성화 함수</label>
          <select
            value={data.activation || 'relu'}
            onChange={(e) => handleActivationChange(e.target.value as LayerNodeData['activation'])}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="relu">ReLU</option>
            <option value="sigmoid">Sigmoid</option>
            <option value="tanh">Tanh</option>
            <option value="linear">Linear</option>
            {data.type === 'output' && <option value="softmax">Softmax</option>}
          </select>
        </div>
      )}

      {/* 활성화 함수 표시 */}
      {data.activation && (
        <div className="mb-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getActivationColor(data.activation)}`}>
            {data.activation.toUpperCase()}
          </span>
        </div>
      )}

      {/* 가중치 정보 */}
      {data.weights && data.weights.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <div>가중치: {data.weights.length} × {data.weights[0]?.length || 0}</div>
          {data.biases && <div>편향: {data.biases.length}</div>}
        </div>
      )}

      {/* 학습 상태 표시 */}
      {data.isActive && (
        <div className="mt-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-700">활성</span>
        </div>
      )}

      {/* 출력 핸들 */}
      {data.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}
    </div>
  )
}

export default LayerNode

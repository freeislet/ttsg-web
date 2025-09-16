import React from 'react'
import { Plus, Brain, Database, Layers } from 'lucide-react'
import { modelActions } from '@/stores/modelStore'

const Sidebar: React.FC = () => {
  const addLayerNode = (type: 'input' | 'hidden' | 'output') => {
    modelActions.addNode(type, { x: Math.random() * 400, y: Math.random() * 400 })
  }

  const addModelNode = () => {
    modelActions.addNode('model', { x: Math.random() * 400, y: Math.random() * 400 })
  }

  const addDataNode = () => {
    modelActions.addNode('data', { x: Math.random() * 400, y: Math.random() * 400 })
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">노드 팔레트</h2>

      {/* 레이어 노드들 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">레이어</h3>
        <div className="space-y-2">
          <button
            onClick={() => addLayerNode('input')}
            className="w-full flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Layers className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">입력 레이어</span>
          </button>

          <button
            onClick={() => addLayerNode('hidden')}
            className="w-full flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">은닉 레이어</span>
          </button>

          <button
            onClick={() => addLayerNode('output')}
            className="w-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Layers className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">출력 레이어</span>
          </button>
        </div>
      </div>

      {/* 모델 노드 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">모델</h3>
        <button
          onClick={addModelNode}
          className="w-full flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <Brain className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-purple-800">신경망 모델</span>
        </button>
      </div>

      {/* 데이터 노드 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">데이터</h3>
        <button
          onClick={addDataNode}
          className="w-full flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <Database className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">훈련 데이터</span>
        </button>
      </div>

      {/* 도움말 */}
      <div className="mt-8 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-700 mb-1">사용법</h4>
        <p className="text-xs text-gray-600">
          노드를 클릭하여 캔버스에 추가하고, 노드들을 연결하여 신경망을 구성하세요.
        </p>
      </div>
    </div>
  )
}

export default Sidebar

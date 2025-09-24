import { Panel } from '@xyflow/react'

import { useModelStore } from '@/stores/modelStore'
import { Flow } from '../Flow'
import DataNode from './DataNode'
import ModelNode from './ModelNode'

// 노드 타입 정의
const nodeTypes = {
  data: DataNode,
  model: ModelNode,
}

/**
 * Model Editor 컴포넌트
 */
export const ModelEditor = () => {
  const {
    nodes,
    edges,
    isLoading,
    error,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    addModelNode,
    addDataNode,
    clearAll,
  } = useModelStore()

  return (
    <Flow
      nodes={nodes as any}
      edges={edges as any}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange as any}
    >
      {/* 툴바 패널 */}
      <Panel
        position="top-left"
        className="bg-white border border-gray-300 rounded-lg shadow-lg p-3"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {/* 데이터 노드 */}
            <button
              onClick={() => addDataNode({ x: 100, y: 100 })}
              className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              데이터 노드
            </button>

            {/* 모델 노드 */}
            <button
              onClick={() => addModelNode('neural-network', { x: 300, y: 100 })}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              신경망 모델
            </button>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={clearAll}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              모두 삭제
            </button>
          </div>
        </div>
      </Panel>

      {/* 오류 표시 */}
      {error && (
        <Panel
          position="bottom-center"
          className="bg-red-100 border border-red-300 rounded-lg shadow-lg p-3"
        >
          <div className="text-red-700 text-sm">❌ {error}</div>
        </Panel>
      )}

      {/* 로딩 표시 */}
      {isLoading && (
        <Panel
          position="bottom-center"
          className="bg-blue-100 border border-blue-300 rounded-lg shadow-lg p-3"
        >
          <div className="text-blue-700 text-sm flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            로딩 중...
          </div>
        </Panel>
      )}
    </Flow>
  )
}

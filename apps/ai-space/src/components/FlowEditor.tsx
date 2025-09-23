import React, { useMemo } from 'react'
import { Panel } from '@xyflow/react'

import { useModelStore } from '@/stores/modelStore'
import { ReactFlow } from '@/components/ReactFlow'
import DataNode from '@/components/nodes/DataNode'
import ModelNode from '@/components/nodes/ModelNode'

// 동적 import를 위한 컴포넌트 로더
const DynamicNodeComponent = ({ type, ...props }: any) => {
  const Component = useMemo(() => {
    switch (type) {
      case 'model':
        return ModelNode
      case 'data':
        return DataNode
      default:
        return () => (
          <div className="p-4 bg-red-100 border border-red-300 rounded">
            Unknown node type: {type}
          </div>
        )
    }
  }, [type])

  return (
    <React.Suspense fallback={<div className="p-4 bg-gray-100 border rounded">Loading...</div>}>
      <Component {...props} />
    </React.Suspense>
  )
}

/**
 * Flow Editor 컴포넌트
 */
export const FlowEditor = () => {
  const {
    nodes,
    edges,
    selectedNodeId,
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

  // 노드 타입 정의
  const nodeTypes = useMemo(
    () => ({
      model: DynamicNodeComponent,
      data: DataNode,
    }),
    []
  )

  return (
    <ReactFlow
      nodes={nodes as any}
      edges={edges as any}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange}
      nodeTypes={nodeTypes}
    >
      {/* 툴바 패널 */}
      <Panel
        position="top-left"
        className="bg-white border border-gray-300 rounded-lg shadow-lg p-3"
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-700">노드 추가</h3>

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

      {/* 상태 패널 */}
      <Panel
        position="top-right"
        className="bg-white border border-gray-300 rounded-lg shadow-lg p-3"
      >
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">노드:</span>
            <span className="font-mono">{nodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">연결:</span>
            <span className="font-mono">{edges.length}</span>
          </div>
          {selectedNodeId && (
            <div className="flex justify-between">
              <span className="text-gray-600">선택:</span>
              <span className="font-mono text-xs">{selectedNodeId.slice(0, 8)}...</span>
            </div>
          )}
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
    </ReactFlow>
  )
}

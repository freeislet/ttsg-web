import { Panel, Connection, Node } from '@xyflow/react'

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
 * Connection 타입 가드
 */
const isConnection = (connection: any): connection is Connection => {
  return (
    connection && typeof connection.source === 'string' && typeof connection.target === 'string'
  )
}

/**
 * 모델 에디터용 연결 유효성 검사 함수
 * 모델 노드의 data-input 핸들에는 데이터 노드만 연결 가능
 */
const isValidModelConnection = (connection: any, nodes: Node[]) => {
  // Connection 타입인지 확인
  if (!isConnection(connection)) {
    return false
  }

  const { source, target, targetHandle } = connection

  // 소스와 타겟 노드 찾기
  const sourceNode = nodes.find((node) => node.id === source)
  const targetNode = nodes.find((node) => node.id === target)

  if (!sourceNode || !targetNode) {
    return false
  }

  // 모델 노드의 data-input 핸들에 연결하는 경우
  if (targetNode.type === 'model' && targetHandle === 'data-input') {
    // 소스가 데이터 노드이고 data-output 핸들인 경우만 허용
    return sourceNode.type === 'data' && connection.sourceHandle === 'data-output'
  }

  // 다른 연결은 모두 허용
  return true
}

/**
 * Model Flow 컴포넌트
 */
export const ModelFlow = () => {
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
  } = useModelStore()

  return (
    <Flow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange}
      isValidConnection={(connection) => isValidModelConnection(connection, nodes)}
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
              onClick={() => addModelNode('neural-network', { x: 400, y: 100 })}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              신경망 모델
            </button>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={() => {
                // TODO: clearAll 기능 구현 필요
                console.log('모두 삭제 기능 예정')
              }}
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

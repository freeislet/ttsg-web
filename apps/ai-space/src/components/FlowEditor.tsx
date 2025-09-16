import React, { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useSnapshot } from 'valtio'
import { modelState, modelActions } from '@/stores/modelStore'
import LayerNode from './nodes/LayerNode'
import ModelNode from './nodes/ModelNode'
import DataNode from './nodes/DataNode'

// 노드 타입 정의
const nodeTypes: NodeTypes = {
  layer: LayerNode,
  model: ModelNode,
  data: DataNode,
}

const FlowEditor: React.FC = () => {
  const snap = useSnapshot(modelState)

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      modelActions.setSelectedNode(node.id)
    },
    []
  )

  const onPaneClick = useCallback(() => {
    modelActions.setSelectedNode(null)
  }, [])

  return (
    <div className="flex-1 bg-gray-50">
      <ReactFlow
        nodes={snap.nodes}
        edges={snap.edges}
        onNodesChange={modelActions.onNodesChange}
        onEdgesChange={modelActions.onEdgesChange}
        onConnect={modelActions.onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#f1f5f9" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.data?.type) {
              case 'input':
                return '#10b981'
              case 'hidden':
                return '#3b82f6'
              case 'output':
                return '#ef4444'
              case 'model':
                return '#8b5cf6'
              case 'data':
                return '#f59e0b'
              default:
                return '#6b7280'
            }
          }}
          className="bg-white border border-gray-200 rounded-lg"
        />
      </ReactFlow>
    </div>
  )
}

export default FlowEditor

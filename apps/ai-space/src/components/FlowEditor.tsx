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
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useModelSnapshot, modelActions } from '@/stores/modelStore'
import ModelNode from './nodes/ModelNode'
import TrainingNode from './nodes/TrainingNode'
import TrainedModelNode from './nodes/TrainedModelNode'
import TrainingDataNode from './nodes/TrainingDataNode'

// 노드 타입 정의
const nodeTypes = {
  model: ModelNode,
  training: TrainingNode,
  'trained-model': TrainedModelNode,
  'training-data': TrainingDataNode,
}

const FlowEditor: React.FC = () => {
  const snap = useModelSnapshot()

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    modelActions.setSelectedNode(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    modelActions.setSelectedNode(null)
  }, [])

  return (
    <div className="flex-1 bg-gray-50">
      <ReactFlow
        nodes={snap.nodes as any}
        edges={snap.edges as any}
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
              case 'model-definition':
                return '#3b82f6' // 파란색 - 모델 정의
              case 'training':
                return '#10b981' // 초록색 - 학습
              case 'trained-model':
                return '#8b5cf6' // 보라색 - 학습된 모델
              case 'training-data':
                return '#f59e0b' // 노란색 - 훈련 데이터
              default:
                return '#6b7280' // 회색 - 기본
            }
          }}
          className="bg-white border border-gray-200 rounded-lg"
        />
      </ReactFlow>
    </div>
  )
}

export default FlowEditor

import {
  ReactFlow,
  ReactFlowProps,
  Background,
  Controls,
  MiniMap,
  SelectionMode,
  Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

/**
 * 커스터마이징된 ReactFlow 컴포넌트
 * 기본 설정과 Background, Controls, MiniMap이 포함됨
 */
export interface FlowProps extends ReactFlowProps {
  nodeColor?: (node: Node) => string
}

export const Flow = ({ nodeColor, children, ...props }: FlowProps) => {
  return (
    <ReactFlow
      fitView
      panOnScroll
      panOnDrag={false}
      selectionOnDrag
      selectionMode={SelectionMode.Partial}
      {...props}
    >
      <Background />
      <Controls />
      <MiniMap nodeColor={nodeColor} />
      {children}
    </ReactFlow>
  )
}

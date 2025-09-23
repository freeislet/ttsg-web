import {
  ReactFlow as _ReactFlow,
  ReactFlowProps,
  Background,
  Controls,
  MiniMap,
  SelectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

/**
 * 커스터마이징된 ReactFlow 컴포넌트
 * 기본 설정과 Background, Controls, MiniMap이 포함됨
 */
export const ReactFlow = ({ children, ...props }: ReactFlowProps) => {
  return (
    <_ReactFlow
      fitView
      panOnScroll
      panOnDrag={false}
      selectionOnDrag
      selectionMode={SelectionMode.Partial}
      {...props}
    >
      <Background />
      <Controls />
      <MiniMap />
      {children}
    </_ReactFlow>
  )
}

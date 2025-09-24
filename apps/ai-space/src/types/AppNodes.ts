import { Edge } from '@xyflow/react'
import { DataNode, DataNodeData } from './DataNode'
import { ModelNode, ModelNodeData } from './ModelNode'
import { VisualizationNode, VisualizationNodeData } from './VisualizationNode'

/**
 * 앱에서 사용하는 모든 노드 타입의 Union
 */
export type AppNode = DataNode | ModelNode | VisualizationNode

/**
 * 앱에서 사용하는 모든 노드 데이터 타입의 Union
 */
export type AppNodeData = DataNodeData | ModelNodeData | VisualizationNodeData

/**
 * 앱에서 사용하는 엣지 타입
 */
export type AppEdge = Edge

/**
 * 노드 타입 매핑
 */
export interface AppNodeTypes {
  data: DataNode
  model: ModelNode
  visualization: VisualizationNode
}

/**
 * 노드 타입 문자열
 */
export type NodeType = keyof AppNodeTypes

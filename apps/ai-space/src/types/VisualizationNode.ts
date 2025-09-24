import { Node } from '@xyflow/react'

/**
 * 데이터 시각화 모드 (DataInspector와 호환)
 */
export type DataVisualizationMode = 'table' | 'chart' | 'image'

/**
 * 시각화 노드 데이터 인터페이스
 */
export interface VisualizationNodeData {
  // 인덱스 시그니처 (React Flow v12 호환성)
  [key: string]: unknown
  
  label: string
  sourceNodeId?: string
  visualizationMode?: DataVisualizationMode
  showDataTable?: boolean
  data?: any
  config?: any
}

/**
 * 시각화 노드 타입
 */
export type VisualizationNode = Node<VisualizationNodeData, 'visualization'>

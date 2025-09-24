import { Node } from '@xyflow/react'

/**
 * 데이터 노드 데이터 인터페이스
 */
export interface DataNodeData {
  // 인덱스 시그니처 (React Flow v12 호환성)
  [key: string]: unknown
  
  label: string
  samples?: number
  inputFeatures?: number
  outputFeatures?: number
  dataType?: string
  inputShape?: number[]
  outputShape?: number[]
  selectedPresetId?: string
  dataset?: any
}

/**
 * 데이터 노드 타입
 */
export type DataNode = Node<DataNodeData, 'data'>

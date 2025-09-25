import { Node } from '@xyflow/react'

/**
 * 데이터 분할 설정 인터페이스
 */
export interface DataSplitConfig {
  trainRatio: number      // 학습 데이터 비율 (0-1)
  validationRatio: number // 검증 데이터 비율 (0-1)
  testRatio: number       // 테스트 데이터 비율 (0-1)
}

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
  
  // 데이터 분할 설정
  splitConfig?: DataSplitConfig
}

/**
 * 데이터 노드 타입
 */
export type DataNode = Node<DataNodeData, 'data'>

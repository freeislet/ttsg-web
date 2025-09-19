import * as tf from '@tensorflow/tfjs'

/**
 * 데이터 소스 타입
 */
export type DataSourceType = 'preset' | 'url' | 'computed'

/**
 * 데이터 프리셋 설정
 */
export interface DataPresetConfig {
  id: string
  name: string
  description: string
  url: string
  inputColumns: string[]
  outputColumns: string[]
  sampleSize?: number
}

/**
 * URL 데이터 설정
 */
export interface URLDataConfig {
  url: string
  format: 'json' | 'csv'
  inputColumns: string[]
  outputColumns: string[]
  headers?: boolean
}

/**
 * 계산된 데이터 함수 타입
 */
export type ComputedDataFunction =
  | 'linear'
  | 'quadratic'
  | 'cubic'
  | 'polynomial'
  | 'sine'
  | 'cosine'
  | 'tangent'
  | 'sigmoid'
  | 'gaussian'

/**
 * 계산된 데이터 설정
 */
export interface ComputedDataConfig {
  functionType: ComputedDataFunction
  parameters: {
    minX: number
    maxX: number
    numPoints: number
    trainSplit: number
    noiseAmount: number
    [key: string]: number // 함수별 추가 파라미터
  }
}

/**
 * 통합 데이터 노드 설정
 */
export interface DataNodeConfig {
  sourceType: DataSourceType
  presetConfig?: DataPresetConfig
  urlConfig?: URLDataConfig
  computedConfig?: ComputedDataConfig
}

/**
 * 데이터셋 인터페이스
 */
export interface Dataset {
  id: string
  name: string
  description: string

  // 원본 데이터
  rawData: any[]

  // 텐서 데이터
  inputs: tf.Tensor
  outputs: tf.Tensor

  // 메타데이터
  inputShape: number[]
  outputShape: number[]
  inputColumns: string[]
  outputColumns: string[]

  // 통계
  sampleCount: number
  trainCount: number
  testCount: number

  // 분할된 데이터
  trainInputs?: tf.Tensor
  trainOutputs?: tf.Tensor
  testInputs?: tf.Tensor
  testOutputs?: tf.Tensor
}

/**
 * 데이터 뷰어 모드
 */
export type DataViewMode = 'table' | 'chart' | 'scatter' | 'histogram'

/**
 * 데이터 노드 상태
 */
export interface DataNodeState {
  config: DataNodeConfig
  dataset?: Dataset
  isLoading: boolean
  error?: string
  viewMode: DataViewMode
}

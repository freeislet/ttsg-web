import { Node } from '@xyflow/react'

/**
 * 모델 노드의 상태 타입
 */
export type ModelNodeState = 
  | 'definition'     // 모델 정의 단계
  | 'configured'     // 모델 설정 완료
  | 'training'       // 학습 중
  | 'trained'        // 학습 완료
  | 'error'          // 오류 상태

/**
 * 레이어 설정 인터페이스
 */
export interface LayerConfig {
  type: 'dense' | 'conv2d' | 'lstm' | 'dropout' | 'flatten'
  units?: number
  activation?: string
  inputShape?: number[]
  filters?: number
  kernelSize?: number | [number, number]
  rate?: number
  [key: string]: any
}

/**
 * 학습 설정 인터페이스
 */
export interface TrainingConfig {
  optimizer: 'adam' | 'sgd' | 'rmsprop'
  loss: 'meanSquaredError' | 'categoricalCrossentropy' | 'binaryCrossentropy' | '' // 빈 문자열은 자동 추론 의미
  metrics: string[]
  epochs: number
  batchSize: number
  validationSplit: number
  learningRate?: number
}

/**
 * 학습 진행 상황 인터페이스
 */
export interface TrainingProgress {
  epoch: number
  totalEpochs: number
  loss: number
  accuracy?: number
  valLoss?: number
  valAccuracy?: number
  isTraining: boolean
  startTime?: Date
  endTime?: Date
}

/**
 * 모델 성능 지표 인터페이스
 */
export interface ModelMetrics {
  loss: number
  accuracy?: number
  valLoss?: number
  valAccuracy?: number
  trainTime?: number
  predictions?: any[]
}

/**
 * 연결된 데이터 노드 정보 인터페이스
 */
export interface ConnectedDataNode {
  id: string
  name: string
  type: string
  shape?: number[]
  size?: number
}

/**
 * 통합 모델 노드 데이터 인터페이스
 */
export interface ModelNodeData {
  // 인덱스 시그니처 (React Flow v12 호환성)
  [key: string]: unknown
  
  // 기본 정보
  label: string
  modelType: string
  modelId: string
  state: ModelNodeState
  
  // 모델 정의
  inputShape?: number[]
  outputUnits?: number
  layers: LayerConfig[]
  
  // 학습 설정
  trainingConfig?: TrainingConfig
  
  // 학습 진행 상황
  trainingProgress?: TrainingProgress
  
  // 성능 지표
  metrics?: ModelMetrics
  
  // 연결된 데이터 노드 정보
  dataNodeId?: string
  connectedDataNode?: ConnectedDataNode
  
  // 오류 정보
  error?: string
  
  // 시각화 데이터
  weights?: number[][]
  activations?: number[]
  lossHistory?: number[]
  accuracyHistory?: number[]
}

/**
 * 모델 노드 타입
 */
export type ModelNode = Node<ModelNodeData, 'model'>

/**
 * 모델 컴포넌트 렌더링 모드
 */
export type ModelComponentMode = 'node' | 'panel'


/**
 * 모델 액션 인터페이스
 */
export interface ModelActions {
  // 모델 정의 액션
  updateLayers: (layers: LayerConfig[]) => void
  setInputShape: (shape: number[]) => void
  setOutputUnits: (units: number) => void
  
  // 학습 액션
  startTraining: (config: TrainingConfig) => Promise<void>
  stopTraining: () => void
  resetModel: () => void
  
  // 예측 액션
  predict: (input: number[]) => Promise<number[]>
  
  // 상태 업데이트
  updateState: (state: ModelNodeState) => void
  updateProgress: (progress: Partial<TrainingProgress>) => void
  updateMetrics: (metrics: Partial<ModelMetrics>) => void
}

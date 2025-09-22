import { Node } from 'reactflow'

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
  loss: 'meanSquaredError' | 'categoricalCrossentropy' | 'binaryCrossentropy'
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
 * 통합 모델 노드 데이터 인터페이스
 */
export interface ModelNodeData {
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
  
  // 연결된 데이터 노드 ID
  dataNodeId?: string
  
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
export type ModelNode = Node<ModelNodeData>

/**
 * 모델 컴포넌트 렌더링 모드
 */
export type ModelComponentMode = 'node' | 'panel'

/**
 * 모델 컴포넌트 인터페이스
 */
export interface IModelComponent {
  // 컴포넌트 정보
  type: string
  name: string
  description: string
  
  // 렌더링 메서드
  renderNode: (data: ModelNodeData, onUpdate: (data: Partial<ModelNodeData>) => void) => React.ReactNode
  renderPanel: (data: ModelNodeData, onUpdate: (data: Partial<ModelNodeData>) => void) => React.ReactNode
  
  // 기본 설정 제공
  getDefaultConfig: () => Partial<ModelNodeData>
  
  // 검증 메서드
  validateConfig: (data: ModelNodeData) => { isValid: boolean; errors: string[] }
}

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

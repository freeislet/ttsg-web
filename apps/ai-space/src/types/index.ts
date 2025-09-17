import { Node, Edge } from 'reactflow'

// 노드 타입 정의
export type NodeType =
  | 'model-definition' // 모델 정의 노드
  | 'training' // 모델 학습 노드
  | 'trained-model' // 학습된 모델 노드
  | 'training-data' // 훈련 데이터 노드

// AI 모델 타입
export type ModelType =
  | 'neural-network'
  | 'cnn'
  | 'rnn'
  | 'linear-regression'
  | 'logistic-regression'
  | 'decision-tree'

// 레이어 타입
export type LayerType = 'dense' | 'conv2d' | 'lstm' | 'dropout' | 'flatten'

// 활성화 함수 타입 (TensorFlow.js 호환)
export type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'linear' | 'softmax'

// 손실 함수 타입
export type LossType =
  | 'mse'
  | 'mae'
  | 'categorical-crossentropy'
  | 'binary-crossentropy'
  | 'sparse-categorical-crossentropy'

// 옵티마이저 타입
export type OptimizerType = 'adam' | 'sgd' | 'rmsprop' | 'adagrad' | 'adamax'

// 노드 데이터 인터페이스
export interface BaseNodeData {
  label: string
  type: NodeType
  isTraining?: boolean
  isActive?: boolean
}

// 레이어 구성 정보
export interface LayerConfig {
  type: LayerType
  units: number
  activation: ActivationType
  // 추가 레이어별 설정 (향후 확장)
  dropout?: number
  kernelSize?: number[]
  strides?: number[]
  padding?: 'valid' | 'same'
}

// 모델 정의 노드 데이터
export interface ModelDefinitionNodeData extends BaseNodeData {
  type: 'model-definition'
  modelType: ModelType
  inputShape: number[] | 'auto' // 직접 입력 또는 데이터에서 자동 추론
  outputUnits: number | 'auto' // 직접 입력 또는 데이터에서 자동 추론
  layers: LayerConfig[] // 히든 레이어 구성
  isCompiled: boolean
  // 연결된 노드 정보
  connectedDataNodeId?: string
  connectedTrainingNodeId?: string
}

// 모델 학습 노드 데이터
export interface TrainingNodeData extends BaseNodeData {
  type: 'training'
  // Compile 옵션
  optimizer: OptimizerType
  learningRate: number
  loss: LossType
  metrics: string[]
  // Fit 옵션
  epochs: number
  batchSize: number
  validationSplit: number
  // 상태
  isTraining: boolean
  trainingProgress?: {
    epoch: number
    totalEpochs: number
    loss: number
    accuracy?: number
    valLoss?: number
    valAccuracy?: number
  }
  // 연결된 노드 정보
  connectedModelNodeId?: string
  connectedDataNodeId?: string
  connectedTrainedModelNodeId?: string
}

// 학습된 모델 노드 데이터
export interface TrainedModelNodeData extends BaseNodeData {
  type: 'trained-model'
  modelId: string // 연결된 모델 정의 노드 ID
  trainingId: string // 연결된 학습 노드 ID
  // 성능 지표
  finalLoss: number
  finalAccuracy?: number
  trainingHistory: {
    epochs: number[]
    loss: number[]
    accuracy?: number[]
    valLoss?: number[]
    valAccuracy?: number[]
  }
  // 모델 상태
  isReady: boolean
  modelWeights?: any // TensorFlow.js 가중치 데이터
}

// 훈련 데이터 노드 데이터 (기존 DataNodeData 확장)
export interface TrainingDataNodeData extends BaseNodeData {
  type: 'training-data'
  dataType: 'training' | 'validation' | 'test'
  // 데이터 형태
  inputShape: number[] // [samples, features]
  outputShape: number[] // [samples, labels]
  // 실제 데이터
  data?: {
    inputs: number[][]
    labels: number[][]
  }
  // 메타데이터
  samples: number
  inputFeatures: number
  outputFeatures: number
  // 데이터 통계
  dataStats?: {
    inputMean?: number[]
    inputStd?: number[]
    labelDistribution?: { [key: string]: number }
  }
}

// 통합 노드 데이터 타입
export type NodeData =
  | ModelDefinitionNodeData
  | TrainingNodeData
  | TrainedModelNodeData
  | TrainingDataNodeData

// React Flow 노드 타입 확장
export type FlowNode = Node<NodeData>
export type FlowEdge = Edge

// 학습 상태
export interface TrainingState {
  isTraining: boolean
  currentEpoch: number
  totalEpochs: number
  currentLoss: number
  currentAccuracy?: number
  history: Array<{
    epoch: number
    loss: number
    accuracy: number
  }>
}

// 모델 상태
export interface ModelState {
  nodes: FlowNode[]
  edges: FlowEdge[]
  selectedNode: string | null
  trainingState: TrainingState
  // 새로운 노드들을 위한 상태
  modelDefinitions: { [id: string]: ModelDefinitionNodeData }
  trainingSessions: { [id: string]: TrainingNodeData }
  trainedModels: { [id: string]: TrainedModelNodeData }
  trainingDatasets: { [id: string]: TrainingDataNodeData }
  // 노드 그룹 관리
  nodeGroups: NodeGroup[]
  activeGroupId?: string
}

// Weight 매트릭스 시각화 데이터
export interface WeightMatrix {
  weights: number[][]
  inputLabels: string[]
  outputLabels: string[]
  minValue: number
  maxValue: number
}

// 노드 연결 정보
export interface NodeConnection {
  sourceId: string
  targetId: string
  sourceHandle?: string
  targetHandle?: string
}

// 모델 실행 결과
export interface ModelPrediction {
  input: number[]
  output: number[]
  layerOutputs: number[][]
  confidence?: number
}

// 노드 그룹 (프리셋) 정의
export interface NodeGroup {
  id: string
  name: string
  description: string
  nodes: FlowNode[]
  edges: FlowEdge[]
}

// 모델 학습 그룹 프리셋 설정
export interface ModelTrainingGroupConfig {
  position: { x: number; y: number }
  dataConfig: {
    samples: number
    inputFeatures: number
    outputFeatures: number
    dataType: 'training' | 'validation' | 'test'
  }
  modelConfig: {
    modelType: ModelType
    layers: LayerConfig[]
  }
  trainingConfig: {
    optimizer: OptimizerType
    learningRate: number
    loss: LossType
    epochs: number
    batchSize: number
  }
}

// 노드 연결 타입 확장
export interface NodeConnectionInfo {
  sourceId: string
  targetId: string
  sourceHandle?: string
  targetHandle?: string
  connectionType: 'data-to-model' | 'model-to-training' | 'training-to-result' | 'data-to-training'
}

// 자동 연결 규칙
export interface AutoConnectionRule {
  sourceType: NodeType
  targetType: NodeType
  connectionType: NodeConnectionInfo['connectionType']
  isRequired: boolean
}

// 노드 생성 팩토리 함수 타입
export type NodeFactory<T extends NodeData> = (
  id: string,
  position: { x: number; y: number },
  data: Partial<T>
) => FlowNode

import { Node, Edge } from 'reactflow'

// 노드 타입 정의
export type NodeType = 'input' | 'hidden' | 'output' | 'model' | 'data'

// AI 모델 타입
export type ModelType = 'neural-network' | 'linear-regression' | 'logistic-regression' | 'decision-tree'

// 활성화 함수 타입
export type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'linear' | 'softmax'

// 손실 함수 타입
export type LossType = 'mse' | 'mae' | 'categorical-crossentropy' | 'binary-crossentropy'

// 옵티마이저 타입
export type OptimizerType = 'adam' | 'sgd' | 'rmsprop' | 'adagrad'

// 노드 데이터 인터페이스
export interface BaseNodeData {
  label: string
  type: NodeType
  isTraining?: boolean
  isActive?: boolean
}

// 신경망 레이어 노드 데이터
export interface LayerNodeData extends BaseNodeData {
  type: 'input' | 'hidden' | 'output'
  neurons: number
  activation?: ActivationType
  weights?: number[][]
  biases?: number[]
  activations?: number[]
  gradients?: number[]
}

// 모델 노드 데이터
export interface ModelNodeData extends BaseNodeData {
  type: 'model'
  modelType: ModelType
  hyperparameters: {
    learningRate: number
    epochs: number
    batchSize: number
    optimizer: OptimizerType
    loss: LossType
  }
  isCompiled: boolean
  isTrained: boolean
  trainingProgress?: {
    epoch: number
    loss: number
    accuracy?: number
  }
}

// 데이터 노드 데이터
export interface DataNodeData extends BaseNodeData {
  type: 'data'
  dataType: 'training' | 'validation' | 'test'
  shape: number[]
  samples: number
  features: number
  data?: {
    x: number[][]
    y: number[][]
  }
}

// 통합 노드 데이터 타입
export type NodeData = LayerNodeData | ModelNodeData | DataNodeData

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
  compiledModel?: any // TensorFlow.js 모델
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

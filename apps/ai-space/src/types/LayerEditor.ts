import { Node, Edge } from '@xyflow/react'

/**
 * 레이어 에디터용 노드 타입
 */
export type LayerNodeType =
  | 'input' // 입력 노드 (동그라미)
  | 'output' // 출력 노드 (동그라미)
  | 'dense' // Dense 레이어
  | 'conv2d' // Conv2D 레이어
  | 'lstm' // LSTM 레이어
  | 'dropout' // Dropout 레이어
  | 'flatten' // Flatten 레이어
  | 'batchNorm' // Batch Normalization 레이어
  | 'layerNorm' // Layer Normalization 레이어
  | 'attention' // Multi-Head Attention 레이어
  | 'embedding' // Embedding 레이어
  | 'conv1d' // Conv1D 레이어
  | 'maxPool2d' // MaxPooling2D 레이어
  | 'avgPool2d' // AveragePooling2D 레이어
  | 'globalMaxPool2d' // GlobalMaxPooling2D 레이어
  | 'globalAvgPool2d' // GlobalAveragePooling2D 레이어

/**
 * 레이어 노드 데이터 인터페이스
 */
export interface LayerNodeData {
  // 인덱스 시그니처 (React Flow v12 호환성)
  [key: string]: unknown

  // 기본 정보
  label: string
  layerType: LayerNodeType

  // Dense 레이어 설정
  units?: number
  activation?: string

  // Conv2D 레이어 설정
  filters?: number
  kernelSize?: number | [number, number]
  strides?: number | [number, number]
  padding?: 'valid' | 'same'

  // LSTM 레이어 설정
  returnSequences?: boolean

  // Dropout 레이어 설정
  rate?: number

  // Batch Normalization 설정
  momentum?: number
  epsilon?: number

  // Layer Normalization 설정
  axis?: number | number[]

  // Attention 레이어 설정
  numHeads?: number
  keyDim?: number
  valueDim?: number

  // Embedding 레이어 설정
  inputDim?: number
  outputDim?: number
  inputLength?: number

  // Conv1D 레이어 설정
  // (filters, kernelSize, strides, padding, activation은 이미 정의됨)

  // Pooling 레이어 설정
  poolSize?: number | [number, number]

  // 레이어 인덱스 및 배치 정보
  layerIndex?: number
  isAutoPositioned?: boolean
}

/**
 * 레이어 에디터 노드 타입
 */
export type LayerNode = Node<LayerNodeData>

/**
 * 레이어 에디터 엣지 타입
 */
export type LayerEdge = Edge

/**
 * 레이어 에디터 상태 인터페이스
 */
export interface LayerEditorState {
  nodes: LayerNode[]
  edges: LayerEdge[]
  selectedNodeId?: string
  isAutoLayoutEnabled: boolean
}

/**
 * 레이어 에디터 액션 인터페이스
 */
export interface LayerEditorActions {
  // 노드 관리
  addLayer: (layerType: LayerNodeType, position?: { x: number; y: number }) => void
  removeLayer: (nodeId: string) => void
  updateLayer: (nodeId: string, data: Partial<LayerNodeData>) => void

  // 연결 관리
  connectLayers: (sourceId: string, targetId: string) => void
  disconnectLayers: (edgeId: string) => void

  // 레이아웃 관리
  autoLayout: () => void
  resetLayout: () => void

  // 데이터 변환
  exportToLayerConfig: () => import('./ModelNode').LayerConfig[]
  importFromLayerConfig: (layers: import('./ModelNode').LayerConfig[]) => void
}

/**
 * 레이어 타입별 기본 설정
 */
export const DEFAULT_LAYER_CONFIGS: Record<LayerNodeType, Partial<LayerNodeData>> = {
  input: {
    label: 'Input',
    layerType: 'input',
  },
  output: {
    label: 'Output',
    layerType: 'output',
  },
  dense: {
    label: 'Dense',
    layerType: 'dense',
    units: 64,
    activation: 'relu',
  },
  conv2d: {
    label: 'Conv2D',
    layerType: 'conv2d',
    filters: 32,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same',
  },
  conv1d: {
    label: 'Conv1D',
    layerType: 'conv1d',
    filters: 32,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same',
  },
  lstm: {
    label: 'LSTM',
    layerType: 'lstm',
    units: 50,
    activation: 'tanh',
    returnSequences: false,
  },
  dropout: {
    label: 'Dropout',
    layerType: 'dropout',
    rate: 0.2,
  },
  flatten: {
    label: 'Flatten',
    layerType: 'flatten',
  },
  batchNorm: {
    label: 'BatchNorm',
    layerType: 'batchNorm',
    momentum: 0.99,
    epsilon: 0.001,
  },
  layerNorm: {
    label: 'LayerNorm',
    layerType: 'layerNorm',
    epsilon: 0.001,
  },
  attention: {
    label: 'Attention',
    layerType: 'attention',
    numHeads: 8,
    keyDim: 64,
  },
  embedding: {
    label: 'Embedding',
    layerType: 'embedding',
    inputDim: 1000,
    outputDim: 64,
  },
  maxPool2d: {
    label: 'MaxPool2D',
    layerType: 'maxPool2d',
    poolSize: 2,
  },
  avgPool2d: {
    label: 'AvgPool2D',
    layerType: 'avgPool2d',
    poolSize: 2,
  },
  globalMaxPool2d: {
    label: 'GlobalMaxPool2D',
    layerType: 'globalMaxPool2d',
  },
  globalAvgPool2d: {
    label: 'GlobalAvgPool2D',
    layerType: 'globalAvgPool2d',
  },
}

/**
 * 자동 레이아웃 설정
 */
export interface AutoLayoutConfig {
  nodeSpacing: number // 노드 간 간격
  layerSpacing: number // 레이어 간 간격
  startX: number // 시작 X 좌표
  startY: number // 시작 Y 좌표
  nodeWidth: number // 노드 너비
  nodeHeight: number // 노드 높이
}

export const DEFAULT_LAYOUT_CONFIG: AutoLayoutConfig = {
  nodeSpacing: 150,
  layerSpacing: 200,
  startX: 0,
  startY: 0,
  nodeWidth: 120,
  nodeHeight: 80,
}

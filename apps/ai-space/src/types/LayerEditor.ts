import { Node, Edge } from 'reactflow'

/**
 * 레이어 에디터용 노드 타입
 */
export type LayerNodeType = 
  | 'input'      // 입력 노드 (동그라미)
  | 'output'     // 출력 노드 (동그라미)  
  | 'dense'      // Dense 레이어
  | 'conv2d'     // Conv2D 레이어
  | 'lstm'       // LSTM 레이어
  | 'dropout'    // Dropout 레이어
  | 'flatten'    // Flatten 레이어

/**
 * 레이어 노드 데이터 인터페이스
 */
export interface LayerNodeData {
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
  
  // 자동 배치용 위치 정보
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
    label: '입력',
    layerType: 'input'
  },
  output: {
    label: '출력', 
    layerType: 'output'
  },
  dense: {
    label: 'Dense',
    layerType: 'dense',
    units: 64,
    activation: 'relu'
  },
  conv2d: {
    label: 'Conv2D',
    layerType: 'conv2d',
    filters: 32,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same'
  },
  lstm: {
    label: 'LSTM',
    layerType: 'lstm',
    units: 50,
    activation: 'tanh',
    returnSequences: false
  },
  dropout: {
    label: 'Dropout',
    layerType: 'dropout',
    rate: 0.2
  },
  flatten: {
    label: 'Flatten',
    layerType: 'flatten'
  }
}

/**
 * 자동 레이아웃 설정
 */
export interface AutoLayoutConfig {
  nodeSpacing: number      // 노드 간 간격
  layerSpacing: number     // 레이어 간 간격
  startX: number          // 시작 X 좌표
  startY: number          // 시작 Y 좌표
  nodeWidth: number       // 노드 너비
  nodeHeight: number      // 노드 높이
}

export const DEFAULT_LAYOUT_CONFIG: AutoLayoutConfig = {
  nodeSpacing: 150,
  layerSpacing: 200,
  startX: 100,
  startY: 100,
  nodeWidth: 120,
  nodeHeight: 80
}

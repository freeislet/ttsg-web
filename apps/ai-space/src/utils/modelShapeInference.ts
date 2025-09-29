import {
  AppNode,
  AppEdge,
  DataNode,
  ModelNode,
} from '@/types/AppNodes'
import { ConnectedDataNode } from '@/types/ModelNode'

/**
 * 데이터 타입별 기본 shape 매핑
 */
const DATA_TYPE_SHAPES: Record<string, number[]> = {
  // 샘플 데이터
  mnist: [28, 28, 1], // MNIST 이미지
  iris: [4], // Iris 특성 4개
  'car-mpg': [1], // Car MPG 특성 1개 (horsepower)

  // 계산된 데이터
  linear: [1], // 1차원 입력
  sine: [1], // 1차원 입력
  quadratic: [1], // 1차원 입력
  sigmoid: [1], // 1차원 입력
  gaussian: [1], // 1차원 입력
}

/**
 * 데이터 타입별 출력 유닛 수 매핑
 */
const DATA_TYPE_OUTPUT_UNITS: Record<string, number> = {
  // 분류 문제
  mnist: 10, // 0-9 숫자 분류
  iris: 3, // 3개 품종 분류

  // 회귀 문제
  'car-mpg': 1, // 연비 예측
  linear: 1, // 선형 함수 출력
  sine: 1, // 사인 함수 출력
  quadratic: 1, // 이차 함수 출력
  sigmoid: 1, // 시그모이드 출력
  gaussian: 1, // 가우시안 출력
}

/**
 * 연결된 데이터 노드에서 입력 shape 추론 (레거시 지원)
 */
export function inferInputShapeFromDataNode(
  modelNode: ModelNode,
  dataNodes: DataNode[],
  edges: AppEdge[]
): number[] | null {
  // 캐시 기반 버전 사용 권장
  return inferInputShapeFromDataNodeCached(modelNode, dataNodes, edges)
}

/**
 * 연결된 데이터 노드에서 출력 유닛 수 추론 (레거시 지원)
 */
export function inferOutputUnitsFromDataNode(
  modelNode: ModelNode,
  dataNodes: DataNode[],
  edges: AppEdge[]
): number | null {
  // 캐시 기반 버전 사용 권장
  return inferOutputUnitsFromDataNodeCached(modelNode, dataNodes, edges)
}

/**
 * 데이터 노드에서 ConnectedDataNode 정보 추출
 */
export function extractConnectedDataInfo(dataNode: DataNode): ConnectedDataNode {
  const now = new Date()
  return {
    id: dataNode.id,
    name: dataNode.data.label || '데이터',
    datasetId: dataNode.data.selectedPresetId || '',
    type: dataNode.data.dataType || 'unknown',
    inputShape: dataNode.data.dataset?.inputShape,
    outputShape: dataNode.data.dataset?.outputShape,
    outputUnits: dataNode.data.dataset?.outputShape?.reduce((a: number, b: number) => a * b, 1),
    size: dataNode.data.dataset?.size,
    samples: dataNode.data.samples,
    features: dataNode.data.inputFeatures,
    dataset: dataNode.data.dataset,
    lastUpdated: now,
    isConnected: true,
  }
}

/**
 * 캐시된 정보가 유효한지 확인
 */
export function isConnectedDataCacheValid(
  connectedData: ConnectedDataNode | undefined,
  dataNode: DataNode | null,
  maxCacheAge: number = 5000 // 5초
): boolean {
  if (!connectedData || !dataNode) {
    return false
  }

  // ID 변경 확인
  if (connectedData.id !== dataNode.id) {
    return false
  }

  // 데이터셋 ID 변경 확인
  if (connectedData.datasetId !== dataNode.data.selectedPresetId) {
    return false
  }

  // 캐시 나이 확인
  if (connectedData.lastUpdated) {
    const cacheAge = Date.now() - connectedData.lastUpdated.getTime()
    if (cacheAge > maxCacheAge) {
      return false
    }
  }

  return true
}

/**
 * 캐시 기반 연결된 데이터 노드 정보 가져오기
 */
export function getConnectedDataNodeCached(
  modelNode: ModelNode,
  dataNodes: DataNode[],
  edges: AppEdge[]
): ConnectedDataNode | null {
  // 기존 캐시 확인
  if (modelNode.data.connectedDataNode) {
    // 연결된 데이터 노드 찾기
    const connectedDataNode = dataNodes.find(
      (node) => node.id === modelNode.data.connectedDataNode!.id
    )

    // 캐시 유효성 검사
    if (isConnectedDataCacheValid(modelNode.data.connectedDataNode, connectedDataNode || null)) {
      console.log(`🚀 Using cached data connection for model: ${modelNode.id}`)
      return modelNode.data.connectedDataNode
    }
  }

  // 캐시가 없거나 무효한 경우 새로 찾기
  const incomingEdges = edges.filter((edge) => edge.target === modelNode.id)
  if (incomingEdges.length === 0) {
    return null
  }

  const connectedDataNode = dataNodes.find((node) =>
    incomingEdges.some((edge) => edge.source === node.id)
  )

  if (!connectedDataNode) {
    return null
  }

  console.log(`🔄 Refreshing data connection cache for model: ${modelNode.id}`)
  return extractConnectedDataInfo(connectedDataNode)
}

/**
 * 캐시 기반 입력 shape 추론
 */
export function inferInputShapeFromDataNodeCached(
  modelNode: ModelNode,
  dataNodes: DataNode[],
  edges: AppEdge[]
): number[] | null {
  const connectedData = getConnectedDataNodeCached(modelNode, dataNodes, edges)
  
  if (!connectedData || !connectedData.datasetId) {
    return null
  }

  // 실제 데이터셋에서 shape 추론 (우선)
  if (connectedData.inputShape) {
    console.log(`📊 Using cached inputShape: ${connectedData.inputShape}`)
    return connectedData.inputShape
  }

  // 데이터셋 ID에서 shape 추론 (fallback)
  const fallbackShape = DATA_TYPE_SHAPES[connectedData.datasetId] || [1]
  console.log(`📊 Fallback to preset shape for ${connectedData.datasetId}: ${fallbackShape}`)
  return fallbackShape
}

/**
 * 캐시 기반 출력 유닛 수 추론
 */
export function inferOutputUnitsFromDataNodeCached(
  modelNode: ModelNode,
  dataNodes: DataNode[],
  edges: AppEdge[]
): number | null {
  const connectedData = getConnectedDataNodeCached(modelNode, dataNodes, edges)
  
  if (!connectedData || !connectedData.datasetId) {
    return null
  }

  // 실제 데이터셋에서 출력 유닛 추론 (우선)
  if (connectedData.outputUnits) {
    console.log(`🎯 Using cached outputUnits: ${connectedData.outputUnits}`)
    return connectedData.outputUnits
  }

  // 데이터셋 ID에서 출력 유닛 수 추론 (fallback)
  const fallbackUnits = DATA_TYPE_OUTPUT_UNITS[connectedData.datasetId] || 1
  console.log(`🎯 Fallback to preset output units for ${connectedData.datasetId}: ${fallbackUnits}`)
  return fallbackUnits
}

/**
 * 모든 모델 노드의 shape 자동 업데이트 (캐시 기반)
 */
export function updateModelShapes(nodes: AppNode[], edges: AppEdge[]): AppNode[] {
  const dataNodes = nodes.filter((node) => node.type === 'data') as DataNode[]

  return nodes.map((node) => {
    if (node.type !== 'model') {
      return node
    }

    const modelNode = node as ModelNode
    
    // 캐시 기반 추론 사용
    const connectedData = getConnectedDataNodeCached(modelNode, dataNodes, edges)
    const inputShape = inferInputShapeFromDataNodeCached(modelNode, dataNodes, edges)
    const outputUnits = inferOutputUnitsFromDataNodeCached(modelNode, dataNodes, edges)

    // shape이 변경된 경우에만 업데이트
    const needsUpdate =
      (inputShape && JSON.stringify(inputShape) !== JSON.stringify(modelNode.data.inputShape)) ||
      (outputUnits && outputUnits !== modelNode.data.outputUnits) ||
      (!modelNode.data.connectedDataNode && connectedData)

    if (needsUpdate) {
      const now = new Date()
      return {
        ...modelNode,
        data: {
          ...modelNode.data,
          ...(inputShape && { inputShape }),
          ...(outputUnits && { outputUnits }),
          ...(connectedData && { 
            connectedDataNode: connectedData,
            dataNodeId: connectedData.id,
            shapeLastUpdated: now,
          }),
        },
      }
    }

    return node
  })
}

/**
 * 데이터셋 타입에 따른 권장 레이어 구성 제안
 */
export function suggestLayerConfiguration(inputShape: number[], outputUnits: number) {
  const isImageData = inputShape.length >= 2 && inputShape[0] > 1 && inputShape[1] > 1
  const isSequenceData = inputShape.length === 1 && inputShape[0] > 10
  const isClassification = outputUnits > 1

  if (isImageData) {
    // 이미지 데이터: CNN 구조 제안
    return [
      { type: 'conv2d', filters: 32, kernelSize: 3, activation: 'relu' },
      { type: 'conv2d', filters: 64, kernelSize: 3, activation: 'relu' },
      { type: 'flatten' },
      { type: 'dense', units: 128, activation: 'relu' },
      { type: 'dropout', rate: 0.5 },
      { type: 'dense', units: outputUnits, activation: isClassification ? 'softmax' : 'linear' },
    ]
  } else if (isSequenceData) {
    // 시퀀스 데이터: RNN 구조 제안
    return [
      { type: 'lstm', units: 50, activation: 'tanh' },
      { type: 'dropout', rate: 0.2 },
      { type: 'dense', units: outputUnits, activation: isClassification ? 'softmax' : 'linear' },
    ]
  } else {
    // 일반 테이블 데이터: MLP 구조 제안
    const hiddenUnits = Math.max(64, Math.min(256, inputShape[0] * 4))
    return [
      { type: 'dense', units: hiddenUnits, activation: 'relu' },
      { type: 'dropout', rate: 0.3 },
      { type: 'dense', units: Math.floor(hiddenUnits / 2), activation: 'relu' },
      { type: 'dropout', rate: 0.3 },
      { type: 'dense', units: outputUnits, activation: isClassification ? 'softmax' : 'linear' },
    ]
  }
}

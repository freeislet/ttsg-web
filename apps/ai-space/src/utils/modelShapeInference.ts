import {
  AppNode,
  AppEdge,
  DataNode,
  ModelNode,
} from '@/types/AppNodes'

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
 * 연결된 데이터 노드에서 입력 shape 추론
 */
export function inferInputShapeFromDataNode(
  modelNode: ModelNode,
  dataNodes: DataNode[],
  edges: AppEdge[]
): number[] | null {
  // 모델 노드로 연결되는 엣지 찾기
  const incomingEdges = edges.filter((edge) => edge.target === modelNode.id)

  if (incomingEdges.length === 0) {
    return null
  }

  // 첫 번째 연결된 데이터 노드 찾기
  const connectedDataNode = dataNodes.find((node) =>
    incomingEdges.some((edge) => edge.source === node.id)
  )

  if (!connectedDataNode || !connectedDataNode.data.selectedPresetId) {
    return null
  }

  // 실제 데이터셋에서 shape 추론 (우선)
  if (connectedDataNode.data.dataset && connectedDataNode.data.dataset.inputShape) {
    console.log(`📊 Using actual dataset inputShape: ${connectedDataNode.data.dataset.inputShape}`)
    return connectedDataNode.data.dataset.inputShape
  }

  // 데이터셋 ID에서 shape 추론 (fallback)
  const datasetId = connectedDataNode.data.selectedPresetId
  const inferredShape = DATA_TYPE_SHAPES[datasetId] || [1]
  console.log(`📊 Fallback to preset shape for ${datasetId}: ${inferredShape}`)
  return inferredShape
}

/**
 * 연결된 데이터 노드에서 출력 유닛 수 추론
 */
export function inferOutputUnitsFromDataNode(
  modelNode: ModelNode,
  dataNodes: DataNode[],
  edges: AppEdge[]
): number | null {
  // 모델 노드로 연결되는 엣지 찾기
  const incomingEdges = edges.filter((edge) => edge.target === modelNode.id)

  if (incomingEdges.length === 0) {
    return null
  }

  // 첫 번째 연결된 데이터 노드 찾기
  const connectedDataNode = dataNodes.find((node) =>
    incomingEdges.some((edge) => edge.source === node.id)
  )

  if (!connectedDataNode || !connectedDataNode.data.selectedPresetId) {
    return null
  }

  // 실제 데이터셋에서 출력 shape 추론 (우선)
  if (connectedDataNode.data.dataset && connectedDataNode.data.dataset.outputShape) {
    const outputUnits = connectedDataNode.data.dataset.outputShape.reduce(
      (a: number, b: number) => a * b,
      1
    )
    console.log(
      `🎯 Using actual dataset outputShape: ${connectedDataNode.data.dataset.outputShape} -> ${outputUnits} units`
    )
    return outputUnits
  }

  // 데이터셋 ID에서 출력 유닛 수 추론 (fallback)
  const datasetId = connectedDataNode.data.selectedPresetId
  const inferredUnits = DATA_TYPE_OUTPUT_UNITS[datasetId] || 1
  console.log(`🎯 Fallback to preset output units for ${datasetId}: ${inferredUnits}`)
  return inferredUnits
}

/**
 * 모든 모델 노드의 shape 자동 업데이트
 */
export function updateModelShapes(nodes: AppNode[], edges: AppEdge[]): AppNode[] {
  const dataNodes = nodes.filter((node) => node.type === 'data') as DataNode[]

  return nodes.map((node) => {
    if (node.type !== 'model') {
      return node
    }

    const modelNode = node as ModelNode
    const inputShape = inferInputShapeFromDataNode(modelNode, dataNodes, edges)
    const outputUnits = inferOutputUnitsFromDataNode(modelNode, dataNodes, edges)

    // shape이 변경된 경우에만 업데이트
    const needsUpdate =
      (inputShape && JSON.stringify(inputShape) !== JSON.stringify(modelNode.data.inputShape)) ||
      (outputUnits && outputUnits !== modelNode.data.outputUnits)

    if (needsUpdate) {
      return {
        ...modelNode,
        data: {
          ...modelNode.data,
          ...(inputShape && { inputShape }),
          ...(outputUnits && { outputUnits }),
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

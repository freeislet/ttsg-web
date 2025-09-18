import {
  FlowNode,
  FlowEdge,
  ModelDefinitionNodeData,
  TrainingNodeData,
  TrainedModelNodeData,
  TrainingDataNodeData,
  NodeGroup,
  ModelTrainingGroupConfig,
  LayerConfig,
  NodeConnectionInfo,
} from '@/types'

/**
 * 노드 생성 팩토리 함수들
 */

// 고유 ID 생성 함수
const generateNodeId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 모델 정의 노드 생성
 */
export const createModelDefinitionNode = (
  position: { x: number; y: number },
  config?: Partial<ModelDefinitionNodeData>
): FlowNode => {
  const id = generateNodeId('model_def')

  const defaultData: ModelDefinitionNodeData = {
    label: '모델 정의',
    type: 'model-definition',
    modelType: 'neural-network',
    inputShape: 'auto',
    outputUnits: 'auto',
    layers: [
      { type: 'dense', units: 64, activation: 'relu' },
      { type: 'dense', units: 32, activation: 'relu' },
    ],
    isCompiled: false,
    ...config,
  }

  return {
    id,
    type: 'model-definition',
    position,
    data: defaultData,
  }
}

/**
 * 모델 학습 노드 생성
 */
export const createTrainingNode = (
  position: { x: number; y: number },
  modelNodeId: string,
  config?: Partial<TrainingNodeData>
): FlowNode => {
  const id = generateNodeId('training')

  const defaultData: TrainingNodeData = {
    label: '모델 학습',
    type: 'training',
    optimizer: 'adam',
    learningRate: 0.001,
    loss: 'mse',
    metrics: ['accuracy'],
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    isTraining: false,
    connectedModelNodeId: modelNodeId,
    ...config,
  }

  return {
    id,
    type: 'training',
    position,
    data: defaultData,
  }
}

/**
 * 학습된 모델 노드 생성
 */
export const createTrainedModelNode = (
  position: { x: number; y: number },
  modelId: string,
  trainingId: string,
  config?: Partial<TrainedModelNodeData>
): FlowNode => {
  const id = generateNodeId('trained_model')

  const defaultData: TrainedModelNodeData = {
    label: '학습된 모델',
    type: 'trained-model',
    modelId,
    trainingId,
    finalLoss: 0,
    trainingHistory: {
      epochs: [],
      loss: [],
      accuracy: [],
      valLoss: [],
      valAccuracy: [],
    },
    isReady: false,
    ...config,
  }

  return {
    id,
    type: 'trained-model',
    position,
    data: defaultData,
  }
}

/**
 * 훈련 데이터 노드 생성
 */
export const createTrainingDataNode = (
  position: { x: number; y: number },
  config?: Partial<TrainingDataNodeData>
): FlowNode => {
  const id = generateNodeId('training_data')

  const defaultData: TrainingDataNodeData = {
    label: '훈련 데이터',
    type: 'training-data',
    dataType: 'training',
    inputShape: [1000, 4],
    outputShape: [1000, 1],
    shape: [1000, 4], // inputShape와 동일
    outputClasses: 10, // 기본 10개 클래스
    samples: 1000,
    inputFeatures: 4,
    outputFeatures: 1,
    ...config,
  }

  return {
    id,
    type: 'training-data',
    position,
    data: defaultData,
  }
}

/**
 * 노드 간 연결 생성
 */
export const createNodeConnection = (
  sourceId: string,
  targetId: string,
  connectionType: NodeConnectionInfo['connectionType'],
  sourceHandle?: string,
  targetHandle?: string
): FlowEdge => {
  return {
    id: `${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    sourceHandle,
    targetHandle,
    type: 'default',
    data: { connectionType },
  }
}

/**
 * 모델 학습 그룹 프리셋 생성
 * 4개 노드를 한 번에 생성하고 연결
 */
export const createModelTrainingGroup = (config: ModelTrainingGroupConfig): NodeGroup => {
  const { position, dataConfig, modelConfig, trainingConfig } = config
  const groupId = generateNodeId('group')

  // 1. 훈련 데이터 노드 생성
  const dataNode = createTrainingDataNode(
    { x: position.x, y: position.y },
    {
      samples: dataConfig.samples,
      inputFeatures: dataConfig.inputFeatures,
      outputFeatures: dataConfig.outputFeatures,
      dataType: dataConfig.dataType,
      inputShape: [dataConfig.samples, dataConfig.inputFeatures],
      outputShape: [dataConfig.samples, dataConfig.outputFeatures],
    }
  )

  // 2. 모델 정의 노드 생성
  const modelDefNode = createModelDefinitionNode(
    { x: position.x + 300, y: position.y },
    {
      modelType: modelConfig.modelType,
      layers: modelConfig.layers,
      inputShape: 'auto', // 데이터 노드에서 자동 설정
      outputUnits: 'auto',
      connectedDataNodeId: dataNode.id,
    }
  )

  // 3. 모델 학습 노드 생성
  const trainingNode = createTrainingNode({ x: position.x + 600, y: position.y }, modelDefNode.id, {
    optimizer: trainingConfig.optimizer,
    learningRate: trainingConfig.learningRate,
    loss: trainingConfig.loss,
    epochs: trainingConfig.epochs,
    batchSize: trainingConfig.batchSize,
    connectedDataNodeId: dataNode.id,
  })

  // 4. 학습된 모델 노드 생성
  const trainedModelNode = createTrainedModelNode(
    { x: position.x + 900, y: position.y },
    modelDefNode.id,
    trainingNode.id
  )

  // 노드 간 연결 생성
  const edges: FlowEdge[] = [
    createNodeConnection(dataNode.id, modelDefNode.id, 'data-to-model'),
    createNodeConnection(modelDefNode.id, trainingNode.id, 'model-to-training'),
    createNodeConnection(dataNode.id, trainingNode.id, 'data-to-training'),
    createNodeConnection(trainingNode.id, trainedModelNode.id, 'training-to-result'),
  ]

  return {
    id: groupId,
    name: '모델 학습 그룹',
    description: '신경망 모델 정의부터 학습까지의 완전한 파이프라인',
    nodes: [dataNode, modelDefNode, trainingNode, trainedModelNode],
    edges,
  }
}

/**
 * 기본 신경망 레이어 구성 프리셋들
 */
export const layerPresets: { [key: string]: LayerConfig[] } = {
  simple: [{ type: 'dense', units: 32, activation: 'relu' }],
  medium: [
    { type: 'dense', units: 64, activation: 'relu' },
    { type: 'dense', units: 32, activation: 'relu' },
  ],
  deep: [
    { type: 'dense', units: 128, activation: 'relu' },
    { type: 'dense', units: 64, activation: 'relu' },
    { type: 'dense', units: 32, activation: 'relu' },
    { type: 'dense', units: 16, activation: 'relu' },
  ],
  classification: [
    { type: 'dense', units: 64, activation: 'relu' },
    { type: 'dense', units: 32, activation: 'relu' },
    { type: 'dense', units: 16, activation: 'relu' },
  ],
  regression: [
    { type: 'dense', units: 64, activation: 'relu' },
    { type: 'dense', units: 32, activation: 'relu' },
  ],
}

/**
 * 모델 타입별 기본 설정
 */
export const modelTypeDefaults = {
  'neural-network': {
    layers: layerPresets.medium,
    optimizer: 'adam' as const,
    loss: 'mse' as const,
    learningRate: 0.001,
  },
  cnn: {
    layers: [
      { type: 'conv2d' as const, units: 32, activation: 'relu' as const },
      { type: 'flatten' as const, units: 0, activation: 'linear' as const },
      { type: 'dense' as const, units: 64, activation: 'relu' as const },
    ],
    optimizer: 'adam' as const,
    loss: 'categorical-crossentropy' as const,
    learningRate: 0.001,
  },
  rnn: {
    layers: [
      { type: 'lstm' as const, units: 50, activation: 'tanh' as const },
      { type: 'dense' as const, units: 32, activation: 'relu' as const },
    ],
    optimizer: 'adam' as const,
    loss: 'mse' as const,
    learningRate: 0.001,
  },
}

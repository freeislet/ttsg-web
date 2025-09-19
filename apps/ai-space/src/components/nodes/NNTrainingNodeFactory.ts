import { NNTrainingConfig } from '@/models/NNModel'
import NNTrainingNode from './NNTrainingNode'

/**
 * 고유 ID 생성 함수
 */
const generateNodeId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 신경망 학습 노드 생성 팩토리
 */
export const createNNTrainingNode = (
  position: { x: number; y: number },
  modelId: string,
  config?: Partial<NNTrainingConfig>
) => {
  const nodeId = generateNodeId('nn_training')

  const defaultTrainingConfig: NNTrainingConfig = {
    optimizer: 'adam',
    learningRate: 0.001,
    loss: 'mse',
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2,
    ...config,
  }

  return {
    id: nodeId,
    type: 'neural-network-training',
    position,
    data: {
      label: '신경망 학습',
      modelId, // 연결된 모델 노드의 ID
      isTraining: false,
      trainingProgress: undefined,
      trainingConfig: defaultTrainingConfig,
    },
  }
}

/**
 * 신경망 학습 노드 팩토리 객체
 */
export const NNTrainingNodeFactory = {
  nodeType: 'neural-network-training',
  displayName: '신경망 학습',
  TrainingNodeComponent: NNTrainingNode,
  createTrainingNode: createNNTrainingNode,
}

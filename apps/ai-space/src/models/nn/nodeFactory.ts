import { NodeComponentFactory } from '@/components/nodes/NodeRegistry'
import { NNModel, NNModelConfig } from './NNModel'
import { ModelRegistry } from '../ModelRegistry'
import NNModelNode from '@/components/nodes/NNModelNode'
import NNTrainingNode from '@/components/nodes/NNTrainingNode'

/**
 * 고유 ID 생성 함수
 */
const generateNodeId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 신경망 모델 노드 생성
 */
const createNNModelNode = (
  position: { x: number; y: number },
  config?: Partial<NNModelConfig>
) => {
  const nodeId = generateNodeId('nn_model')
  
  // 모델 인스턴스 생성
  const model = ModelRegistry.createModel<NNModel>('neural-network', config)
  
  return {
    id: nodeId,
    type: 'neural-network-model',
    position,
    data: {
      label: '신경망 모델',
      modelId: model.id,
      modelType: 'neural-network'
    },
    // 모델 인스턴스를 노드에 연결
    model
  }
}

/**
 * 신경망 학습 노드 생성
 */
const createNNTrainingNode = (
  position: { x: number; y: number },
  modelId: string,
  config?: any
) => {
  const nodeId = generateNodeId('nn_training')
  
  // 모델 인스턴스 가져오기
  const model = ModelRegistry.getInstance<NNModel>(modelId)
  
  return {
    id: nodeId,
    type: 'neural-network-training',
    position,
    data: {
      label: '신경망 학습',
      modelId,
      isTraining: false,
      trainingProgress: undefined
    },
    // 모델 인스턴스를 노드에 연결
    model
  }
}

/**
 * 신경망 노드 컴포넌트 팩토리
 */
export const NNNodeFactory: NodeComponentFactory<NNModel> = {
  modelType: 'neural-network',
  displayName: '신경망 모델',
  
  ModelNodeComponent: NNModelNode,
  TrainingNodeComponent: NNTrainingNode,
  
  createModelNode: createNNModelNode,
  createTrainingNode: createNNTrainingNode
}

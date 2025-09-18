import { NNModel, NNModelConfig, createNNModel } from '@/models/nn/NNModel'
import NNModelNode from './NNModelNode'

/**
 * 고유 ID 생성 함수
 */
const generateNodeId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 신경망 모델 노드 생성 팩토리
 */
export const createNNModelNode = (
  position: { x: number; y: number },
  config?: Partial<NNModelConfig>
) => {
  const nodeId = generateNodeId('nn_model')
  
  // 모델 정의 인스턴스 생성
  const model = createNNModel(config)
  
  return {
    id: nodeId,
    type: 'neural-network-model',
    position,
    data: {
      label: '신경망 모델',
      modelId: model.id,
      modelType: 'neural-network',
      model // 모델 정의를 노드 데이터에 직접 저장
    }
  }
}

/**
 * 신경망 모델 노드 팩토리 객체
 */
export const NNModelNodeFactory = {
  nodeType: 'neural-network-model',
  displayName: '신경망 모델',
  ModelNodeComponent: NNModelNode,
  createModelNode: createNNModelNode
}

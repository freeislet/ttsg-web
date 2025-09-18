import { NodeComponentFactory } from './NodeRegistry'
import { NNModelNodeFactory, createNNModelNode } from './NNModelNodeFactory'
import { NNTrainingNodeFactory, createNNTrainingNode } from './NNTrainingNodeFactory'

/**
 * 신경망 노드 팩토리 통합
 * 레거시 NodeComponentFactory 인터페이스 지원
 */
export const NeuralNetworkNodeFactory: NodeComponentFactory = {
  modelType: 'neural-network',
  displayName: '신경망 모델',
  
  ModelNodeComponent: NNModelNodeFactory.ModelNodeComponent,
  TrainingNodeComponent: NNTrainingNodeFactory.TrainingNodeComponent,
  
  createModelNode: createNNModelNode,
  createTrainingNode: createNNTrainingNode
}

// 개별 팩토리들도 export
export { NNModelNodeFactory, NNTrainingNodeFactory }
export { createNNModelNode, createNNTrainingNode }
export { NNTrainedModelNodeFactory, createNNTrainedModelNode } from './NNTrainedModelNodeFactory'

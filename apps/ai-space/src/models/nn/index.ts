import { NodeRegistry } from '@/components/nodes/NodeRegistry'
import { NNModel, createNNModel } from './NNModel'
import { NeuralNetworkNodeFactory } from '@/components/nodes/NeuralNetworkNodeFactories'

// 신경망 노드 컴포넌트 자동 등록
NodeRegistry.register(NeuralNetworkNodeFactory)

export { NNModel, createNNModel }
export type { LayerConfig, NNModelConfig, NNTrainingConfig, TrainingResult } from './NNModel'

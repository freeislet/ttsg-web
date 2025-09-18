import { ModelRegistry } from '../ModelRegistry'
import { NodeRegistry } from '@/components/nodes/NodeRegistry'
import { NNModel, NNModelFactory } from './NNModel'
import { NNNodeFactory } from './nodeFactory'

// 신경망 모델 자동 등록
ModelRegistry.register(NNModelFactory)

// 신경망 노드 컴포넌트 자동 등록
NodeRegistry.register(NNNodeFactory)

export { NNModel, NNModelFactory, NNNodeFactory }
export type { LayerConfig, NNModelConfig, NNTrainingConfig, TrainingResult } from './NNModel'

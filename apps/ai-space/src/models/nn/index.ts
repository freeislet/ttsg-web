import { NNModel, createNNModel } from './NNModel'

/**
 * 신경망 모델 모듈
 * 모델 클래스와 팩토리 함수만 export
 * 노드 등록은 /components/nodes/index.ts에서 처리
 */

export { NNModel, createNNModel }
export type { LayerConfig, NNModelConfig, NNTrainingConfig, TrainingResult } from './NNModel'

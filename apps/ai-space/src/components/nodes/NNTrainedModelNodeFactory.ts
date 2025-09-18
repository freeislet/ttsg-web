import * as tf from '@tensorflow/tfjs'
import { TrainingResult } from '@/models/nn/NNModel'

/**
 * 고유 ID 생성 함수
 */
const generateNodeId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 훈련된 모델 노드 데이터 인터페이스
 */
export interface TrainedModelNodeData {
  label: string
  modelId: string
  trainingNodeId: string
  trainedModel: tf.Sequential
  trainingResult: TrainingResult
  createdAt: Date
}

/**
 * 훈련된 모델 노드 생성 팩토리
 */
export const createNNTrainedModelNode = (
  position: { x: number; y: number },
  trainedModel: tf.Sequential,
  trainingResult: TrainingResult,
  modelId: string,
  trainingNodeId: string
) => {
  const nodeId = generateNodeId('nn_trained_model')
  
  return {
    id: nodeId,
    type: 'neural-network-trained-model',
    position,
    data: {
      label: '훈련된 모델',
      modelId,
      trainingNodeId,
      trainedModel,
      trainingResult,
      createdAt: new Date()
    } as TrainedModelNodeData
  }
}

/**
 * 훈련된 모델 노드 팩토리 객체
 */
export const NNTrainedModelNodeFactory = {
  nodeType: 'neural-network-trained-model',
  displayName: '훈련된 모델',
  createTrainedModelNode: createNNTrainedModelNode
}

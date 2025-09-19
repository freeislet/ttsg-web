import * as tf from '@tensorflow/tfjs'
import { BatchNormalizationLayerConfig } from './types'

/**
 * BatchNormalization 레이어 팩토리 함수
 * @param config BatchNormalization 레이어 설정
 * @returns TensorFlow.js BatchNormalization 레이어 인스턴스
 */
export const createBatchNormalizationLayer = (config: BatchNormalizationLayerConfig): tf.layers.Layer => {
  return tf.layers.batchNormalization({
    axis: config.axis ?? -1,
    momentum: config.momentum ?? 0.99,
    epsilon: config.epsilon ?? 0.001,
  })
}

/**
 * BatchNormalization 레이어 기본 설정
 */
export const getDefaultBatchNormalizationConfig = (): BatchNormalizationLayerConfig => ({
  type: 'batchNormalization',
  axis: -1,
  momentum: 0.99,
  epsilon: 0.001,
})

/**
 * BatchNormalization 레이어 설정 검증
 */
export const validateBatchNormalizationConfig = (config: BatchNormalizationLayerConfig): boolean => {
  return (
    (config.momentum === undefined || (config.momentum >= 0 && config.momentum <= 1)) &&
    (config.epsilon === undefined || config.epsilon > 0)
  )
}

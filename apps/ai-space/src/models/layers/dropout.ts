import * as tf from '@tensorflow/tfjs'
import { DropoutLayerConfig } from './types'

/**
 * Dropout 레이어 팩토리 함수
 * @param config Dropout 레이어 설정
 * @returns TensorFlow.js Dropout 레이어 인스턴스
 */
export const createDropoutLayer = (config: DropoutLayerConfig): tf.layers.Layer => {
  return tf.layers.dropout({
    rate: config.rate,
  })
}

/**
 * Dropout 레이어 기본 설정
 */
export const getDefaultDropoutConfig = (rate: number = 0.2): DropoutLayerConfig => ({
  type: 'dropout',
  rate,
})

/**
 * Dropout 레이어 설정 검증
 */
export const validateDropoutConfig = (config: DropoutLayerConfig): boolean => {
  return config.rate >= 0 && config.rate < 1
}

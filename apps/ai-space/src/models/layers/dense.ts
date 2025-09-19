import * as tf from '@tensorflow/tfjs'
import { DenseLayerConfig } from './types'

/**
 * Dense 레이어 팩토리 함수
 * @param config Dense 레이어 설정
 * @returns TensorFlow.js Dense 레이어 인스턴스
 */
export const createDenseLayer = (config: DenseLayerConfig): tf.layers.Layer => {
  return tf.layers.dense({
    units: config.units,
    activation: config.activation || 'linear',
    useBias: config.useBias ?? true,
    kernelInitializer: config.kernelInitializer || 'glorotNormal',
    biasInitializer: config.biasInitializer || 'zeros',
  })
}

/**
 * Dense 레이어 기본 설정
 */
export const getDefaultDenseConfig = (units: number = 32): DenseLayerConfig => ({
  type: 'dense',
  units,
  activation: 'relu',
  useBias: true,
})

/**
 * Dense 레이어 설정 검증
 */
export const validateDenseConfig = (config: DenseLayerConfig): boolean => {
  return config.units > 0
}

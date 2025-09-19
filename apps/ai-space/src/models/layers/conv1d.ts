import * as tf from '@tensorflow/tfjs'
import { Conv1DLayerConfig } from './types'

/**
 * Conv1D 레이어 팩토리 함수 (확장용)
 * @param config Conv1D 레이어 설정
 * @returns TensorFlow.js Conv1D 레이어 인스턴스
 */
export const createConv1DLayer = (config: Conv1DLayerConfig): tf.layers.Layer => {
  return tf.layers.conv1d({
    filters: config.filters,
    kernelSize: config.kernelSize,
    strides: config.strides ?? 1,
    padding: config.padding ?? 'valid',
    activation: config.activation || 'linear',
  })
}

/**
 * Conv1D 레이어 기본 설정
 */
export const getDefaultConv1DConfig = (filters: number = 32, kernelSize: number = 3): Conv1DLayerConfig => ({
  type: 'conv1d',
  filters,
  kernelSize,
  strides: 1,
  padding: 'valid',
  activation: 'relu',
})

/**
 * Conv1D 레이어 설정 검증
 */
export const validateConv1DConfig = (config: Conv1DLayerConfig): boolean => {
  return (
    config.filters > 0 &&
    config.kernelSize > 0 &&
    (config.strides === undefined || config.strides > 0)
  )
}

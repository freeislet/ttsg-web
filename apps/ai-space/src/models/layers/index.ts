import * as tf from '@tensorflow/tfjs'
import { LayerConfig, LayerType } from './types'
import { createDenseLayer, validateDenseConfig } from './dense'
import { createDropoutLayer, validateDropoutConfig } from './dropout'
import { createBatchNormalizationLayer, validateBatchNormalizationConfig } from './batchNorm'
import { createConv1DLayer, validateConv1DConfig } from './conv1d'

/**
 * 레이어 팩토리 레지스트리
 */
const layerFactories = {
  dense: createDenseLayer,
  dropout: createDropoutLayer,
  batchNormalization: createBatchNormalizationLayer,
  conv1d: createConv1DLayer,
} as const

/**
 * 레이어 검증 함수 레지스트리
 */
const layerValidators = {
  dense: validateDenseConfig,
  dropout: validateDropoutConfig,
  batchNormalization: validateBatchNormalizationConfig,
  conv1d: validateConv1DConfig,
} as const

/**
 * 레이어 설정으로부터 TensorFlow.js 레이어 인스턴스 생성
 * @param config 레이어 설정
 * @returns TensorFlow.js 레이어 인스턴스
 */
export const createLayer = (config: LayerConfig): tf.layers.Layer => {
  const factory = layerFactories[config.type]
  
  if (!factory) {
    throw new Error(`Unsupported layer type: ${config.type}`)
  }

  // 타입 안전성을 위한 타입 단언
  return (factory as any)(config)
}

/**
 * 레이어 설정 검증
 * @param config 레이어 설정
 * @returns 검증 결과
 */
export const validateLayerConfig = (config: LayerConfig): boolean => {
  const validator = layerValidators[config.type]
  
  if (!validator) {
    console.warn(`No validator found for layer type: ${config.type}`)
    return true
  }

  return (validator as any)(config)
}

/**
 * 지원되는 레이어 타입 목록 반환
 */
export const getSupportedLayerTypes = (): LayerType[] => {
  return Object.keys(layerFactories) as LayerType[]
}

/**
 * 레이어 타입별 기본 설정 생성
 */
export const createDefaultLayerConfig = (type: LayerType): LayerConfig => {
  switch (type) {
    case 'dense':
      return { type: 'dense', units: 32, activation: 'relu' }
    case 'dropout':
      return { type: 'dropout', rate: 0.2 }
    case 'batchNormalization':
      return { type: 'batchNormalization' }
    case 'conv1d':
      return { type: 'conv1d', filters: 32, kernelSize: 3, activation: 'relu' }
    default:
      throw new Error(`Unsupported layer type: ${type}`)
  }
}

// 타입 및 팩토리 함수들 re-export
export * from './types'
export * from './dense'
export * from './dropout'
export * from './batchNorm'
export * from './conv1d'

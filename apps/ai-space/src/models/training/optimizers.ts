import * as tf from '@tensorflow/tfjs'
import { OptimizerType, OptimizerConfig } from './types'

/**
 * 옵티마이저 팩토리 함수
 * @param type 옵티마이저 타입
 * @param learningRate 학습률
 * @returns TensorFlow.js 옵티마이저 인스턴스
 */
export const createOptimizer = (
  type: OptimizerType, 
  learningRate: number
): tf.Optimizer => {
  switch (type) {
    case 'adam':
      return tf.train.adam(learningRate)
    
    case 'sgd':
      return tf.train.sgd(learningRate)
    
    case 'rmsprop':
      return tf.train.rmsprop(learningRate)
    
    case 'adagrad':
      return tf.train.adagrad(learningRate)
    
    case 'adadelta':
      return tf.train.adadelta(learningRate)
    
    default:
      console.warn(`Unknown optimizer type: ${type}, falling back to adam`)
      return tf.train.adam(learningRate)
  }
}

/**
 * 고급 옵티마이저 설정으로 옵티마이저 생성
 * @param config 옵티마이저 설정
 * @returns TensorFlow.js 옵티마이저 인스턴스
 */
export const createOptimizerWithConfig = (config: OptimizerConfig): tf.Optimizer => {
  const { type, learningRate, beta1, beta2, momentum, decay, epsilon } = config

  switch (type) {
    case 'adam':
      return tf.train.adam({
        learningRate,
        beta1: beta1 ?? 0.9,
        beta2: beta2 ?? 0.999,
        epsilon: epsilon ?? 1e-8,
      })
    
    case 'sgd':
      return tf.train.sgd({
        learningRate,
        momentum: momentum ?? 0,
      })
    
    case 'rmsprop':
      return tf.train.rmsprop({
        learningRate,
        decay: decay ?? 0.9,
        momentum: momentum ?? 0,
        epsilon: epsilon ?? 1e-8,
      })
    
    case 'adagrad':
      return tf.train.adagrad({
        learningRate,
        initialAccumulatorValue: 0.1,
      })
    
    case 'adadelta':
      return tf.train.adadelta({
        learningRate,
        rho: 0.95,
        epsilon: epsilon ?? 1e-8,
      })
    
    default:
      return createOptimizer(type, learningRate)
  }
}

/**
 * 옵티마이저별 기본 설정 반환
 * @param type 옵티마이저 타입
 * @param learningRate 학습률
 * @returns 기본 옵티마이저 설정
 */
export const getDefaultOptimizerConfig = (
  type: OptimizerType,
  learningRate: number = 0.001
): OptimizerConfig => {
  const baseConfig = { type, learningRate }

  switch (type) {
    case 'adam':
      return {
        ...baseConfig,
        beta1: 0.9,
        beta2: 0.999,
        epsilon: 1e-8,
      }
    
    case 'sgd':
      return {
        ...baseConfig,
        momentum: 0,
      }
    
    case 'rmsprop':
      return {
        ...baseConfig,
        decay: 0.9,
        momentum: 0,
        epsilon: 1e-8,
      }
    
    case 'adagrad':
    case 'adadelta':
      return {
        ...baseConfig,
        epsilon: 1e-8,
      }
    
    default:
      return baseConfig
  }
}

/**
 * 지원되는 옵티마이저 타입 목록
 */
export const getSupportedOptimizerTypes = (): OptimizerType[] => {
  return ['adam', 'sgd', 'rmsprop', 'adagrad', 'adadelta']
}

/**
 * 옵티마이저 타입별 설명
 */
export const getOptimizerDescription = (type: OptimizerType): string => {
  const descriptions: Record<OptimizerType, string> = {
    adam: 'Adaptive Moment Estimation - 대부분의 경우에 좋은 성능',
    sgd: 'Stochastic Gradient Descent - 단순하고 안정적',
    rmsprop: 'Root Mean Square Propagation - RNN에 적합',
    adagrad: 'Adaptive Gradient - 희소 데이터에 적합',
    adadelta: 'Adaptive Delta - Adagrad의 개선된 버전',
  }
  
  return descriptions[type] || '알 수 없는 옵티마이저'
}

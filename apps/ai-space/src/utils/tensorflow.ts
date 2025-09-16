import * as tf from '@tensorflow/tfjs'
import { LayerNodeData, ModelNodeData } from '@/types'

/**
 * TensorFlow.js 모델 생성 및 관리 유틸리티
 */

export interface ModelLayer {
  type: 'input' | 'hidden' | 'output'
  neurons: number
  activation?: string
  weights?: number[][]
  biases?: number[]
}

export interface ModelConfig {
  layers: ModelLayer[]
  hyperparameters: {
    learningRate: number
    optimizer: string
    loss: string
    epochs: number
    batchSize: number
  }
}

/**
 * 레이어 노드들로부터 TensorFlow.js 모델 생성
 */
export const createModelFromNodes = (
  layerNodes: LayerNodeData[]
): tf.Sequential => {
  // 레이어들을 순서대로 정렬 (입력 -> 히든 -> 출력)
  const sortedLayers = layerNodes.sort((a, b) => {
    const order = { input: 0, hidden: 1, output: 2 }
    return order[a.type] - order[b.type]
  })

  const model = tf.sequential()

  sortedLayers.forEach((layer, index) => {
    if (layer.type === 'input') {
      // 입력 레이어
      model.add(tf.layers.dense({
        inputShape: [layer.neurons],
        units: sortedLayers[index + 1]?.neurons || layer.neurons,
        activation: sortedLayers[index + 1]?.activation || 'linear',
        name: `input_layer_${index}`
      }))
    } else if (layer.type === 'hidden') {
      // 히든 레이어
      model.add(tf.layers.dense({
        units: layer.neurons,
        activation: layer.activation || 'relu',
        name: `hidden_layer_${index}`
      }))
    } else if (layer.type === 'output') {
      // 출력 레이어
      model.add(tf.layers.dense({
        units: layer.neurons,
        activation: layer.activation || 'linear',
        name: `output_layer_${index}`
      }))
    }
  })

  return model
}

/**
 * 모델 컴파일
 */
export const compileModel = (
  model: tf.Sequential,
  hyperparameters: ModelNodeData['hyperparameters']
): void => {
  let optimizer: tf.Optimizer

  switch (hyperparameters.optimizer) {
    case 'adam':
      optimizer = tf.train.adam(hyperparameters.learningRate)
      break
    case 'sgd':
      optimizer = tf.train.sgd(hyperparameters.learningRate)
      break
    case 'rmsprop':
      optimizer = tf.train.rmsprop(hyperparameters.learningRate)
      break
    case 'adagrad':
      optimizer = tf.train.adagrad(hyperparameters.learningRate)
      break
    default:
      optimizer = tf.train.adam(hyperparameters.learningRate)
  }

  model.compile({
    optimizer,
    loss: hyperparameters.loss,
    metrics: ['accuracy']
  })
}

/**
 * 샘플 데이터 생성
 */
export const generateSampleData = (
  samples: number,
  inputFeatures: number,
  outputFeatures: number
): { x: tf.Tensor, y: tf.Tensor } => {
  // 입력 데이터 (정규분포)
  const x = tf.randomNormal([samples, inputFeatures])
  
  // 출력 데이터 (간단한 선형 관계 + 노이즈)
  const weights = tf.randomNormal([inputFeatures, outputFeatures])
  const bias = tf.randomNormal([outputFeatures])
  const noise = tf.randomNormal([samples, outputFeatures], 0, 0.1)
  
  const y = tf.add(tf.add(tf.matMul(x, weights), bias), noise)

  return { x, y }
}

/**
 * 모델 학습
 */
export const trainModel = async (
  model: tf.Sequential,
  x: tf.Tensor,
  y: tf.Tensor,
  hyperparameters: ModelNodeData['hyperparameters'],
  onEpochEnd?: (epoch: number, logs: any) => void
): Promise<tf.History> => {
  return await model.fit(x, y, {
    epochs: hyperparameters.epochs,
    batchSize: hyperparameters.batchSize,
    validationSplit: 0.2,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (onEpochEnd) {
          onEpochEnd(epoch, logs)
        }
      }
    }
  })
}

/**
 * 모델 예측
 */
export const predictModel = (
  model: tf.Sequential,
  x: tf.Tensor
): tf.Tensor => {
  return model.predict(x) as tf.Tensor
}

/**
 * 레이어 가중치 추출
 */
export const extractLayerWeights = (
  model: tf.Sequential,
  layerIndex: number
): { weights: number[][], biases: number[] } | null => {
  try {
    const layer = model.layers[layerIndex]
    if (!layer) return null

    const weights = layer.getWeights()
    if (weights.length === 0) return null

    const weightMatrix = weights[0].arraySync() as number[][]
    const biasVector = weights[1] ? weights[1].arraySync() as number[] : []

    return {
      weights: weightMatrix,
      biases: biasVector
    }
  } catch (error) {
    console.error('가중치 추출 실패:', error)
    return null
  }
}

/**
 * 모델 메모리 정리
 */
export const disposeModel = (model: tf.Sequential): void => {
  model.dispose()
}

/**
 * 텐서 메모리 정리
 */
export const disposeTensors = (...tensors: tf.Tensor[]): void => {
  tensors.forEach(tensor => {
    if (tensor && !tensor.isDisposed) {
      tensor.dispose()
    }
  })
}

/**
 * 메모리 사용량 확인
 */
export const getMemoryInfo = (): tf.MemoryInfo => {
  return tf.memory()
}

/**
 * 가중치 통계 계산
 */
export const calculateWeightStats = (weights: number[][]): {
  mean: number
  std: number
  min: number
  max: number
} => {
  const flatWeights = weights.flat()
  const mean = flatWeights.reduce((sum, w) => sum + w, 0) / flatWeights.length
  const variance = flatWeights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / flatWeights.length
  const std = Math.sqrt(variance)
  const min = Math.min(...flatWeights)
  const max = Math.max(...flatWeights)

  return { mean, std, min, max }
}

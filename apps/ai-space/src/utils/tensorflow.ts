import * as tf from '@tensorflow/tfjs'
import { ModelNodeData, TrainingDataNodeData, TrainingNodeData, LayerConfig } from '@/types'

/**
 * TensorFlow.js 모델 생성 및 관리 유틸리티
 */

/**
 * 모델 정의 노드로부터 TensorFlow.js 모델 생성
 */
export const createModelFromDefinition = (
  modelDef: ModelNodeData,
  trainingData?: TrainingDataNodeData
): tf.Sequential => {
  const model = tf.sequential()

  // inputShape 결정 (자동 추론 또는 직접 입력)
  let inputShape: number[]
  if (modelDef.inputShape === 'auto' && trainingData) {
    inputShape = [trainingData.inputFeatures]
  } else if (Array.isArray(modelDef.inputShape)) {
    inputShape = modelDef.inputShape
  } else {
    throw new Error('inputShape를 결정할 수 없습니다. 데이터를 연결하거나 직접 입력하세요.')
  }

  // outputUnits 결정 (자동 추론 또는 직접 입력)
  let outputUnits: number
  if (modelDef.outputUnits === 'auto' && trainingData) {
    outputUnits = trainingData.outputFeatures
  } else if (typeof modelDef.outputUnits === 'number') {
    outputUnits = modelDef.outputUnits
  } else {
    throw new Error('outputUnits를 결정할 수 없습니다. 데이터를 연결하거나 직접 입력하세요.')
  }

  // 첫 번째 레이어 (입력 레이어 역할)
  if (modelDef.layers.length > 0) {
    const firstLayer = modelDef.layers[0]
    model.add(
      tf.layers.dense({
        inputShape,
        units: firstLayer.units,
        activation: firstLayer.activation,
        name: 'input_layer',
      })
    )

    // 나머지 히든 레이어들
    modelDef.layers.slice(1).forEach((layer: LayerConfig, index: number) => {
      if (layer.type === 'dense') {
        model.add(
          tf.layers.dense({
            units: layer.units,
            activation: layer.activation,
            name: `hidden_layer_${index + 1}`,
          })
        )
      }
      // 향후 다른 레이어 타입들 추가 가능
    })
  }

  // 출력 레이어
  model.add(
    tf.layers.dense({
      units: outputUnits,
      activation: 'linear', // 기본값, 문제 타입에 따라 조정 가능
      name: 'output_layer',
    })
  )

  return model
}

/**
 * 학습 노드 설정으로 모델 컴파일
 */
export const compileModelFromTrainingNode = (
  model: tf.Sequential,
  trainingNode: TrainingNodeData
): void => {
  let optimizer: tf.Optimizer

  switch (trainingNode.optimizer) {
    case 'adam':
      optimizer = tf.train.adam(trainingNode.learningRate)
      break
    case 'sgd':
      optimizer = tf.train.sgd(trainingNode.learningRate)
      break
    case 'rmsprop':
      optimizer = tf.train.rmsprop(trainingNode.learningRate)
      break
    case 'adagrad':
      optimizer = tf.train.adagrad(trainingNode.learningRate)
      break
    default:
      optimizer = tf.train.adam(trainingNode.learningRate)
  }

  model.compile({
    optimizer,
    loss: trainingNode.loss,
    metrics: trainingNode.metrics,
  })
}

/**
 * 샘플 데이터 생성
 */
export const generateSampleData = (
  samples: number,
  inputFeatures: number,
  outputFeatures: number
): { x: tf.Tensor; y: tf.Tensor } => {
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
 * 학습 노드 설정으로 모델 학습
 */
export const trainModelFromTrainingNode = async (
  model: tf.Sequential,
  trainingData: TrainingDataNodeData,
  trainingNode: TrainingNodeData,
  onEpochEnd?: (epoch: number, logs: any) => void
): Promise<tf.History> => {
  if (!trainingData.data) {
    throw new Error('훈련 데이터가 없습니다.')
  }

  // 데이터를 텐서로 변환
  const x = tf.tensor2d(trainingData.data.inputs)
  const y = tf.tensor2d(trainingData.data.labels)

  try {
    return await model.fit(x, y, {
      epochs: trainingNode.epochs,
      batchSize: trainingNode.batchSize,
      validationSplit: trainingNode.validationSplit,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onEpochEnd) {
            onEpochEnd(epoch, logs)
          }
        },
      },
    })
  } finally {
    // 메모리 정리
    x.dispose()
    y.dispose()
  }
}

/**
 * 모델 예측
 */
export const predictModel = (model: tf.Sequential, x: tf.Tensor): tf.Tensor => {
  return model.predict(x) as tf.Tensor
}

/**
 * 레이어 가중치 추출
 */
export const extractLayerWeights = (
  model: tf.Sequential,
  layerIndex: number
): { weights: number[][]; biases: number[] } | null => {
  try {
    const layer = model.layers[layerIndex]
    if (!layer) return null

    const weights = layer.getWeights()
    if (weights.length === 0) return null

    const weightMatrix = weights[0].arraySync() as number[][]
    const biasVector = weights[1] ? (weights[1].arraySync() as number[]) : []

    return {
      weights: weightMatrix,
      biases: biasVector,
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
  tensors.forEach((tensor) => {
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
export const calculateWeightStats = (
  weights: number[][]
): {
  mean: number
  std: number
  min: number
  max: number
} => {
  const flatWeights = weights.flat()
  const mean = flatWeights.reduce((sum, w) => sum + w, 0) / flatWeights.length
  const variance =
    flatWeights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / flatWeights.length
  const std = Math.sqrt(variance)
  const min = Math.min(...flatWeights)
  const max = Math.max(...flatWeights)

  return { mean, std, min, max }
}

/**
 * 훈련 데이터 노드용 샘플 데이터 생성
 */
export const generateTrainingData = (
  samples: number,
  inputFeatures: number,
  outputFeatures: number,
  dataType: 'linear' | 'classification' | 'polynomial' = 'linear'
): { inputs: number[][]; labels: number[][] } => {
  const inputs: number[][] = []
  const labels: number[][] = []

  for (let i = 0; i < samples; i++) {
    // 입력 데이터 생성 (정규분포)
    const input = Array.from(
      { length: inputFeatures },
      () => Math.random() * 2 - 1 // -1 ~ 1 범위
    )
    inputs.push(input)

    // 출력 데이터 생성 (데이터 타입에 따라)
    let output: number[]
    switch (dataType) {
      case 'linear':
        // 선형 관계 + 노이즈
        output = Array.from({ length: outputFeatures }, (_, j) => {
          const sum = input.reduce((acc, val, idx) => acc + val * (idx + j + 1), 0)
          return sum + (Math.random() - 0.5) * 0.1 // 노이즈 추가
        })
        break

      case 'classification':
        // 분류 문제 (원-핫 인코딩)
        const classIndex = Math.floor(Math.random() * outputFeatures)
        output = Array.from({ length: outputFeatures }, (_, j) => (j === classIndex ? 1 : 0))
        break

      case 'polynomial':
        // 다항식 관계
        output = Array.from({ length: outputFeatures }, (_, j) => {
          const sum = input.reduce(
            (acc, val, idx) => acc + val * val * (idx + j + 1) + val * (idx + j + 1),
            0
          )
          return sum + (Math.random() - 0.5) * 0.1
        })
        break

      default:
        output = [0]
    }

    labels.push(output)
  }

  return { inputs, labels }
}

/**
 * 전체 파이프라인 실행
 */
export const executeTrainingPipeline = async (
  modelData: ModelNodeData,
  trainingData: TrainingDataNodeData,
  trainingNodeData: TrainingNodeData,
  onProgress?: (epoch: number, logs: any) => void
): Promise<{
  model: tf.Sequential
  history: tf.History
  finalMetrics: { loss: number; accuracy?: number }
}> => {
  // 1. 모델 생성
  const model = createModelFromDefinition(modelData, trainingData)

  // 2. 모델 컴파일
  compileModelFromTrainingNode(model, trainingNodeData)

  // 3. 모델 학습
  const history = await trainModelFromTrainingNode(
    model,
    trainingData,
    trainingNodeData,
    onProgress
  )

  // 4. 최종 성능 지표 추출
  const finalLoss = history.history.loss[history.history.loss.length - 1] as number
  const finalAccuracy = history.history.acc
    ? (history.history.acc[history.history.acc.length - 1] as number)
    : undefined

  return {
    model,
    history,
    finalMetrics: {
      loss: finalLoss,
      accuracy: finalAccuracy,
    },
  }
}

import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from '../BaseDataset'
import { IDataset, ProgressCallback } from '../../types'

// Iris 클래스 정의
export const IRIS_CLASSES = ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica']
export const IRIS_NUM_CLASSES = IRIS_CLASSES.length

// Iris 데이터 (sepal_length, sepal_width, petal_length, petal_width, class)
// Source: https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data
const IRIS_DATA = [
  [5.1, 3.5, 1.4, 0.2, 0], [4.9, 3.0, 1.4, 0.2, 0], [4.7, 3.2, 1.3, 0.2, 0],
  [4.6, 3.1, 1.5, 0.2, 0], [5.0, 3.6, 1.4, 0.2, 0], [5.4, 3.9, 1.7, 0.4, 0],
  [4.6, 3.4, 1.4, 0.3, 0], [5.0, 3.4, 1.5, 0.2, 0], [4.4, 2.9, 1.4, 0.2, 0],
  [4.9, 3.1, 1.5, 0.1, 0], [5.4, 3.7, 1.5, 0.2, 0], [4.8, 3.4, 1.6, 0.2, 0],
  [4.8, 3.0, 1.4, 0.1, 0], [4.3, 3.0, 1.1, 0.1, 0], [5.8, 4.0, 1.2, 0.2, 0],
  [5.7, 4.4, 1.5, 0.4, 0], [5.4, 3.9, 1.3, 0.4, 0], [5.1, 3.5, 1.4, 0.3, 0],
  [5.7, 3.8, 1.7, 0.3, 0], [5.1, 3.8, 1.5, 0.3, 0], [5.4, 3.4, 1.7, 0.2, 0],
  [5.1, 3.7, 1.5, 0.4, 0], [4.6, 3.6, 1.0, 0.2, 0], [5.1, 3.3, 1.7, 0.5, 0],
  [4.8, 3.4, 1.9, 0.2, 0], [5.0, 3.0, 1.6, 0.2, 0], [5.0, 3.4, 1.6, 0.4, 0],
  [5.2, 3.5, 1.5, 0.2, 0], [5.2, 3.4, 1.4, 0.2, 0], [4.7, 3.2, 1.6, 0.2, 0],
  [4.8, 3.1, 1.6, 0.2, 0], [5.4, 3.4, 1.5, 0.4, 0], [5.2, 4.1, 1.5, 0.1, 0],
  [5.5, 4.2, 1.4, 0.2, 0], [4.9, 3.1, 1.5, 0.1, 0], [5.0, 3.2, 1.2, 0.2, 0],
  [5.5, 3.5, 1.3, 0.2, 0], [4.9, 3.1, 1.5, 0.1, 0], [4.4, 3.0, 1.3, 0.2, 0],
  [5.1, 3.4, 1.5, 0.2, 0], [5.0, 3.5, 1.3, 0.3, 0], [4.5, 2.3, 1.3, 0.3, 0],
  [4.4, 3.2, 1.3, 0.2, 0], [5.0, 3.5, 1.6, 0.6, 0], [5.1, 3.8, 1.9, 0.4, 0],
  [4.8, 3.0, 1.4, 0.3, 0], [5.1, 3.8, 1.6, 0.2, 0], [4.6, 3.2, 1.4, 0.2, 0],
  [5.3, 3.7, 1.5, 0.2, 0], [5.0, 3.3, 1.4, 0.2, 0], [7.0, 3.2, 4.7, 1.4, 1],
  [6.4, 3.2, 4.5, 1.5, 1], [6.9, 3.1, 4.9, 1.5, 1], [5.5, 2.3, 4.0, 1.3, 1],
  [6.5, 2.8, 4.6, 1.5, 1], [5.7, 2.8, 4.5, 1.3, 1], [6.3, 3.3, 4.7, 1.6, 1],
  [4.9, 2.4, 3.3, 1.0, 1], [6.6, 2.9, 4.6, 1.3, 1], [5.2, 2.7, 3.9, 1.4, 1],
  [5.0, 2.0, 3.5, 1.0, 1], [5.9, 3.0, 4.2, 1.5, 1], [6.0, 2.2, 4.0, 1.0, 1],
  [6.1, 2.9, 4.7, 1.4, 1], [5.6, 2.9, 3.6, 1.3, 1], [6.7, 3.1, 4.4, 1.4, 1],
  [5.6, 3.0, 4.5, 1.5, 1], [5.8, 2.7, 4.1, 1.0, 1], [6.2, 2.2, 4.5, 1.5, 1],
  [5.6, 2.5, 3.9, 1.1, 1], [5.9, 3.2, 4.8, 1.8, 1], [6.1, 2.8, 4.0, 1.3, 1],
  [6.3, 2.5, 4.9, 1.5, 1], [6.1, 2.8, 4.7, 1.2, 1], [6.4, 2.9, 4.3, 1.3, 1],
  [6.6, 3.0, 4.4, 1.4, 1], [6.8, 2.8, 4.8, 1.4, 1], [6.7, 3.0, 5.0, 1.7, 1],
  [6.0, 2.9, 4.5, 1.5, 1], [5.7, 2.6, 3.5, 1.0, 1], [5.5, 2.4, 3.8, 1.1, 1],
  [5.5, 2.4, 3.7, 1.0, 1], [5.8, 2.7, 3.9, 1.2, 1], [6.0, 2.7, 5.1, 1.6, 1],
  [5.4, 3.0, 4.5, 1.5, 1], [6.0, 3.4, 4.5, 1.6, 1], [6.7, 3.1, 4.7, 1.5, 1],
  [6.3, 2.3, 4.4, 1.3, 1], [5.6, 3.0, 4.1, 1.3, 1], [5.5, 2.5, 4.0, 1.3, 1],
  [5.5, 2.6, 4.4, 1.2, 1], [6.1, 3.0, 4.6, 1.4, 1], [5.8, 2.6, 4.0, 1.2, 1],
  [5.0, 2.3, 3.3, 1.0, 1], [5.6, 2.7, 4.2, 1.3, 1], [5.7, 3.0, 4.2, 1.2, 1],
  [5.7, 2.9, 4.2, 1.3, 1], [6.2, 2.9, 4.3, 1.3, 1], [5.1, 2.5, 3.0, 1.1, 1],
  [5.7, 2.8, 4.1, 1.3, 1], [6.3, 3.3, 6.0, 2.5, 2], [5.8, 2.7, 5.1, 1.9, 2],
  [7.1, 3.0, 5.9, 2.1, 2], [6.3, 2.9, 5.6, 1.8, 2], [6.5, 3.0, 5.8, 2.2, 2],
  [7.6, 3.0, 6.6, 2.1, 2], [4.9, 2.5, 4.5, 1.7, 2], [7.3, 2.9, 6.3, 1.8, 2],
  [6.7, 2.5, 5.8, 1.8, 2], [7.2, 3.6, 6.1, 2.5, 2], [6.5, 3.2, 5.1, 2.0, 2],
  [6.4, 2.7, 5.3, 1.9, 2], [6.8, 3.0, 5.5, 2.1, 2], [5.7, 2.5, 5.0, 2.0, 2],
  [5.8, 2.8, 5.1, 2.4, 2], [6.4, 3.2, 5.3, 2.3, 2], [6.5, 3.0, 5.5, 1.8, 2],
  [7.7, 3.8, 6.7, 2.2, 2], [7.7, 2.6, 6.9, 2.3, 2], [6.0, 2.2, 5.0, 1.5, 2],
  [6.9, 3.2, 5.7, 2.3, 2], [5.6, 2.8, 4.9, 2.0, 2], [7.7, 2.8, 6.7, 2.0, 2],
  [6.3, 2.7, 4.9, 1.8, 2], [6.7, 3.3, 5.7, 2.1, 2], [7.2, 3.2, 6.0, 1.8, 2],
  [6.2, 2.8, 4.8, 1.8, 2], [6.1, 3.0, 4.9, 1.8, 2], [6.4, 2.8, 5.6, 2.1, 2],
  [7.2, 3.0, 5.8, 1.6, 2], [7.4, 2.8, 6.1, 1.9, 2], [7.9, 3.8, 6.4, 2.0, 2],
  [6.4, 2.8, 5.6, 2.2, 2], [6.3, 2.8, 5.1, 1.5, 2], [6.1, 2.6, 5.6, 1.4, 2],
  [7.7, 3.0, 6.1, 2.3, 2], [6.3, 3.4, 5.6, 2.4, 2], [6.4, 3.1, 5.5, 1.8, 2],
  [6.0, 3.0, 4.8, 1.8, 2], [6.9, 3.1, 5.4, 2.1, 2], [6.7, 3.1, 5.6, 2.4, 2],
  [6.9, 3.1, 5.1, 2.3, 2], [5.8, 2.7, 5.1, 1.9, 2], [6.8, 3.2, 5.9, 2.3, 2],
  [6.7, 3.3, 5.7, 2.5, 2], [6.7, 3.0, 5.2, 2.3, 2], [6.3, 2.5, 5.0, 1.9, 2],
  [6.5, 3.0, 5.2, 2.0, 2], [6.2, 3.4, 5.4, 2.3, 2], [5.9, 3.0, 5.1, 1.8, 2]
]

/**
 * Iris 데이터셋 클래스
 */
class IrisDataset extends BaseDataset {
  readonly inputs: tf.Tensor
  readonly labels: tf.Tensor
  readonly inputShape: number[] = [4]
  readonly outputShape: number[] = [3]
  readonly inputColumns: string[] = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']
  readonly outputColumns: string[] = ['species']
  readonly sampleCount: number
  
  readonly trainInputs: tf.Tensor
  readonly trainLabels: tf.Tensor
  readonly testInputs: tf.Tensor
  readonly testLabels: tf.Tensor
  readonly trainCount: number
  readonly testCount: number
  
  constructor(
    trainInputs: tf.Tensor,
    trainLabels: tf.Tensor,
    testInputs: tf.Tensor,
    testLabels: tf.Tensor
  ) {
    super()
    
    this.trainInputs = trainInputs
    this.trainLabels = trainLabels
    this.testInputs = testInputs
    this.testLabels = testLabels
    
    this.trainCount = trainInputs.shape[0]
    this.testCount = testInputs.shape[0]
    this.sampleCount = this.trainCount + this.testCount
    
    // 전체 데이터 결합
    this.inputs = tf.concat([trainInputs, testInputs], 0)
    this.labels = tf.concat([trainLabels, testLabels], 0)
  }
}

/**
 * 데이터를 텐서로 변환하고 훈련/테스트 분할
 */
function convertToTensors(testSplit: number = 0.2): [tf.Tensor, tf.Tensor, tf.Tensor, tf.Tensor] {
  return tf.tidy(() => {
    const numExamples = IRIS_DATA.length
    
    // 데이터 셔플
    const indices = tf.util.createShuffledIndices(numExamples)
    const shuffledData: number[][] = []
    const shuffledTargets: number[] = []
    
    for (let i = 0; i < numExamples; i++) {
      const idx = indices[i]
      const example = IRIS_DATA[idx]
      shuffledData.push(example.slice(0, 4)) // 특성 데이터
      shuffledTargets.push(example[4]) // 레이블
    }
    
    // 훈련/테스트 분할
    const numTestExamples = Math.round(numExamples * testSplit)
    const numTrainExamples = numExamples - numTestExamples
    
    // 특성 데이터 텐서 생성
    const xs = tf.tensor2d(shuffledData, [numExamples, 4])
    
    // 레이블을 원-핫 인코딩
    const ys = tf.oneHot(tf.tensor1d(shuffledTargets, 'int32'), IRIS_NUM_CLASSES)
    
    // 훈련/테스트 분할
    const xTrain = xs.slice([0, 0], [numTrainExamples, 4])
    const xTest = xs.slice([numTrainExamples, 0], [numTestExamples, 4])
    const yTrain = ys.slice([0, 0], [numTrainExamples, IRIS_NUM_CLASSES])
    const yTest = ys.slice([numTrainExamples, 0], [numTestExamples, IRIS_NUM_CLASSES])
    
    return [xTrain, yTrain, xTest, yTest]
  })
}

/**
 * Iris 데이터셋 로더
 */
export async function loadIris(onProgress?: ProgressCallback): Promise<IDataset> {
  console.log('🌸 Loading Iris dataset...')
  onProgress?.(0, 'initializing', 'Iris 데이터셋 초기화...')
  
  try {
    onProgress?.(20, 'processing', '데이터 변환 중...')
    const [trainInputs, trainLabels, testInputs, testLabels] = convertToTensors(0.2)
    
    onProgress?.(80, 'creating', '데이터셋 생성 중...')
    const dataset = new IrisDataset(trainInputs, trainLabels, testInputs, testLabels)
    
    onProgress?.(100, 'completed', '로딩 완료!')
    console.log('✅ Iris dataset loaded successfully')
    console.log(`📊 Train samples: ${dataset.trainCount}, Test samples: ${dataset.testCount}`)
    console.log(`🏷️ Classes: ${IRIS_CLASSES.join(', ')}`)
    
    return dataset
    
  } catch (error) {
    console.error('❌ Failed to load Iris dataset:', error)
    throw error
  }
}

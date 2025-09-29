import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from '../BaseDataset'
import { IDataset, ProgressCallback } from '../../types'
import { dataRegistry } from '../../registry'

// Iris 클래스 정의
export const IRIS_CLASSES = ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica']
export const IRIS_NUM_CLASSES = IRIS_CLASSES.length

// Iris 데이터 (sepal_length, sepal_width, petal_length, petal_width, class)
// Source: https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data
const IRIS_DATA = [
  [5.1, 3.5, 1.4, 0.2, 0],
  [4.9, 3.0, 1.4, 0.2, 0],
  [4.7, 3.2, 1.3, 0.2, 0],
  [4.6, 3.1, 1.5, 0.2, 0],
  [5.0, 3.6, 1.4, 0.2, 0],
  [5.4, 3.9, 1.7, 0.4, 0],
  [4.6, 3.4, 1.4, 0.3, 0],
  [5.0, 3.4, 1.5, 0.2, 0],
  [4.4, 2.9, 1.4, 0.2, 0],
  [4.9, 3.1, 1.5, 0.1, 0],
  [5.4, 3.7, 1.5, 0.2, 0],
  [4.8, 3.4, 1.6, 0.2, 0],
  [4.8, 3.0, 1.4, 0.1, 0],
  [4.3, 3.0, 1.1, 0.1, 0],
  [5.8, 4.0, 1.2, 0.2, 0],
  [5.7, 4.4, 1.5, 0.4, 0],
  [5.4, 3.9, 1.3, 0.4, 0],
  [5.1, 3.5, 1.4, 0.3, 0],
  [5.7, 3.8, 1.7, 0.3, 0],
  [5.1, 3.8, 1.5, 0.3, 0],
  [5.4, 3.4, 1.7, 0.2, 0],
  [5.1, 3.7, 1.5, 0.4, 0],
  [4.6, 3.6, 1.0, 0.2, 0],
  [5.1, 3.3, 1.7, 0.5, 0],
  [4.8, 3.4, 1.9, 0.2, 0],
  [5.0, 3.0, 1.6, 0.2, 0],
  [5.0, 3.4, 1.6, 0.4, 0],
  [5.2, 3.5, 1.5, 0.2, 0],
  [5.2, 3.4, 1.4, 0.2, 0],
  [4.7, 3.2, 1.6, 0.2, 0],
  [4.8, 3.1, 1.6, 0.2, 0],
  [5.4, 3.4, 1.5, 0.4, 0],
  [5.2, 4.1, 1.5, 0.1, 0],
  [5.5, 4.2, 1.4, 0.2, 0],
  [4.9, 3.1, 1.5, 0.1, 0],
  [5.0, 3.2, 1.2, 0.2, 0],
  [5.5, 3.5, 1.3, 0.2, 0],
  [4.9, 3.1, 1.5, 0.1, 0],
  [4.4, 3.0, 1.3, 0.2, 0],
  [5.1, 3.4, 1.5, 0.2, 0],
  [5.0, 3.5, 1.3, 0.3, 0],
  [4.5, 2.3, 1.3, 0.3, 0],
  [4.4, 3.2, 1.3, 0.2, 0],
  [5.0, 3.5, 1.6, 0.6, 0],
  [5.1, 3.8, 1.9, 0.4, 0],
  [4.8, 3.0, 1.4, 0.3, 0],
  [5.1, 3.8, 1.6, 0.2, 0],
  [4.6, 3.2, 1.4, 0.2, 0],
  [5.3, 3.7, 1.5, 0.2, 0],
  [5.0, 3.3, 1.4, 0.2, 0],
  [7.0, 3.2, 4.7, 1.4, 1],
  [6.4, 3.2, 4.5, 1.5, 1],
  [6.9, 3.1, 4.9, 1.5, 1],
  [5.5, 2.3, 4.0, 1.3, 1],
  [6.5, 2.8, 4.6, 1.5, 1],
  [5.7, 2.8, 4.5, 1.3, 1],
  [6.3, 3.3, 4.7, 1.6, 1],
  [4.9, 2.4, 3.3, 1.0, 1],
  [6.6, 2.9, 4.6, 1.3, 1],
  [5.2, 2.7, 3.9, 1.4, 1],
  [5.0, 2.0, 3.5, 1.0, 1],
  [5.9, 3.0, 4.2, 1.5, 1],
  [6.0, 2.2, 4.0, 1.0, 1],
  [6.1, 2.9, 4.7, 1.4, 1],
  [5.6, 2.9, 3.6, 1.3, 1],
  [6.7, 3.1, 4.4, 1.4, 1],
  [5.6, 3.0, 4.5, 1.5, 1],
  [5.8, 2.7, 4.1, 1.0, 1],
  [6.2, 2.2, 4.5, 1.5, 1],
  [5.6, 2.5, 3.9, 1.1, 1],
  [5.9, 3.2, 4.8, 1.8, 1],
  [6.1, 2.8, 4.0, 1.3, 1],
  [6.3, 2.5, 4.9, 1.5, 1],
  [6.1, 2.8, 4.7, 1.2, 1],
  [6.4, 2.9, 4.3, 1.3, 1],
  [6.6, 3.0, 4.4, 1.4, 1],
  [6.8, 2.8, 4.8, 1.4, 1],
  [6.7, 3.0, 5.0, 1.7, 1],
  [6.0, 2.9, 4.5, 1.5, 1],
  [5.7, 2.6, 3.5, 1.0, 1],
  [5.5, 2.4, 3.8, 1.1, 1],
  [5.5, 2.4, 3.7, 1.0, 1],
  [5.8, 2.7, 3.9, 1.2, 1],
  [6.0, 2.7, 5.1, 1.6, 1],
  [5.4, 3.0, 4.5, 1.5, 1],
  [6.0, 3.4, 4.5, 1.6, 1],
  [6.7, 3.1, 4.7, 1.5, 1],
  [6.3, 2.3, 4.4, 1.3, 1],
  [5.6, 3.0, 4.1, 1.3, 1],
  [5.5, 2.5, 4.0, 1.3, 1],
  [5.5, 2.6, 4.4, 1.2, 1],
  [6.1, 3.0, 4.6, 1.4, 1],
  [5.8, 2.6, 4.0, 1.2, 1],
  [5.0, 2.3, 3.3, 1.0, 1],
  [5.6, 2.7, 4.2, 1.3, 1],
  [5.7, 3.0, 4.2, 1.2, 1],
  [5.7, 2.9, 4.2, 1.3, 1],
  [6.2, 2.9, 4.3, 1.3, 1],
  [5.1, 2.5, 3.0, 1.1, 1],
  [5.7, 2.8, 4.1, 1.3, 1],
  [6.3, 3.3, 6.0, 2.5, 2],
  [5.8, 2.7, 5.1, 1.9, 2],
  [7.1, 3.0, 5.9, 2.1, 2],
  [6.3, 2.9, 5.6, 1.8, 2],
  [6.5, 3.0, 5.8, 2.2, 2],
  [7.6, 3.0, 6.6, 2.1, 2],
  [4.9, 2.5, 4.5, 1.7, 2],
  [7.3, 2.9, 6.3, 1.8, 2],
  [6.7, 2.5, 5.8, 1.8, 2],
  [7.2, 3.6, 6.1, 2.5, 2],
  [6.5, 3.2, 5.1, 2.0, 2],
  [6.4, 2.7, 5.3, 1.9, 2],
  [6.8, 3.0, 5.5, 2.1, 2],
  [5.7, 2.5, 5.0, 2.0, 2],
  [5.8, 2.8, 5.1, 2.4, 2],
  [6.4, 3.2, 5.3, 2.3, 2],
  [6.5, 3.0, 5.5, 1.8, 2],
  [7.7, 3.8, 6.7, 2.2, 2],
  [7.7, 2.6, 6.9, 2.3, 2],
  [6.0, 2.2, 5.0, 1.5, 2],
  [6.9, 3.2, 5.7, 2.3, 2],
  [5.6, 2.8, 4.9, 2.0, 2],
  [7.7, 2.8, 6.7, 2.0, 2],
  [6.3, 2.7, 4.9, 1.8, 2],
  [6.7, 3.3, 5.7, 2.1, 2],
  [7.2, 3.2, 6.0, 1.8, 2],
  [6.2, 2.8, 4.8, 1.8, 2],
  [6.1, 3.0, 4.9, 1.8, 2],
  [6.4, 2.8, 5.6, 2.1, 2],
  [7.2, 3.0, 5.8, 1.6, 2],
  [7.4, 2.8, 6.1, 1.9, 2],
  [7.9, 3.8, 6.4, 2.0, 2],
  [6.4, 2.8, 5.6, 2.2, 2],
  [6.3, 2.8, 5.1, 1.5, 2],
  [6.1, 2.6, 5.6, 1.4, 2],
  [7.7, 3.0, 6.1, 2.3, 2],
  [6.3, 3.4, 5.6, 2.4, 2],
  [6.4, 3.1, 5.5, 1.8, 2],
  [6.0, 3.0, 4.8, 1.8, 2],
  [6.9, 3.1, 5.4, 2.1, 2],
  [6.7, 3.1, 5.6, 2.4, 2],
  [6.9, 3.1, 5.1, 2.3, 2],
  [5.8, 2.7, 5.1, 1.9, 2],
  [6.8, 3.2, 5.9, 2.3, 2],
  [6.7, 3.3, 5.7, 2.5, 2],
  [6.7, 3.0, 5.2, 2.3, 2],
  [6.3, 2.5, 5.0, 1.9, 2],
  [6.5, 3.0, 5.2, 2.0, 2],
  [6.2, 3.4, 5.4, 2.3, 2],
  [5.9, 3.0, 5.1, 1.8, 2],
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

  constructor(inputs: tf.Tensor, labels: tf.Tensor) {
    super()
    this.inputs = inputs
    this.labels = labels
    this.sampleCount = inputs.shape[0]
  }
}

/**
 * 데이터를 텐서로 변환
 */
function convertToTensors(): { inputs: tf.Tensor; labels: tf.Tensor } {
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

    // 특성 데이터 텐서 생성
    const inputs = tf.tensor2d(shuffledData, [numExamples, 4])

    // 레이블을 원-핫 인코딩
    const labels = tf.oneHot(tf.tensor1d(shuffledTargets, 'int32'), IRIS_NUM_CLASSES)

    return { inputs, labels }
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
    const { inputs, labels } = convertToTensors()

    onProgress?.(80, 'creating', '데이터셋 생성 중...')
    const dataset = new IrisDataset(inputs, labels)

    onProgress?.(100, 'completed', '로딩 완료!')
    console.log('✅ Iris dataset loaded successfully')
    console.log(`📊 Total samples: ${dataset.sampleCount}`)
    console.log(`🏷️ Classes: ${IRIS_CLASSES.join(', ')}`)

    return dataset
  } catch (error) {
    console.error('❌ Failed to load Iris dataset:', error)
    throw error
  }
}

// 레지스트리 등록
dataRegistry.register({
  id: 'iris',
  name: 'Iris Flower Classification',
  description: '붓꽃 분류 데이터셋 (꽃잎/꽃받침 크기 → 품종 분류)',
  category: 'sample',
  loader: loadIris,
  tags: ['classification', 'tabular', 'beginner'],
  difficulty: 'beginner',
  estimatedSize: '5KB',
  visualizations: [
    {
      type: 'scatter',
      title: '특성 산점도',
      description: '꽃잎 길이 vs 너비 산점도 (품종별 색상)',
      chartConfig: {
        type: 'scatter',
        xAxis: { column: 'petal_length', label: '꽃잎 길이 (cm)', type: 'continuous' },
        yAxis: { column: 'petal_width', label: '꽃잎 너비 (cm)', type: 'continuous' },
        colorBy: 'species',
        title: 'Iris 꽃잎 특성 분포',
      },
    },
    {
      type: 'chart',
      title: '특성 분포',
      description: '각 특성별 히스토그램',
      chartConfig: {
        type: 'histogram',
        xAxis: { column: 'sepal_length', label: '꽃받침 길이 (cm)', type: 'continuous' },
        yAxis: { column: 'count', label: '빈도', type: 'continuous' },
        colorBy: 'species',
        title: '꽃받침 길이 분포',
      },
    },
    {
      type: 'table',
      title: '데이터 테이블',
      description: '붓꽃 특성 및 품종 정보',
    },
  ],
  prediction: {
    display: {
      type: 'tabular',
      title: 'Iris 품종 예측 결과',
      description: '꽃잎/꽃받침 특성에 따른 붓꽃 품종 분류 결과',
      columns: [
        { key: 'sepal_length', label: '꽃받침 길이 (cm)', type: 'number', format: { precision: 1 } },
        { key: 'sepal_width', label: '꽃받침 너비 (cm)', type: 'number', format: { precision: 1 } },
        { key: 'petal_length', label: '꽃잎 길이 (cm)', type: 'number', format: { precision: 1 } },
        { key: 'petal_width', label: '꽃잎 너비 (cm)', type: 'number', format: { precision: 1 } },
        { key: 'predicted_class', label: '예측 품종', type: 'text' },
        { key: 'confidence', label: '신뢰도', type: 'probability', format: { precision: 2, percentage: true } },
        { key: 'actual_class', label: '실제 품종', type: 'text' },
      ],
      sampleLimit: 15,
      supportsRealtime: true,
    },
    input: {
      type: 'form',
      title: '붓꽃 특성 입력',
      description: '꽃받침과 꽃잎의 크기를 입력하여 품종을 예측해보세요',
      formFields: [
        { key: 'sepal_length', label: '꽃받침 길이 (cm)', type: 'number', min: 3.0, max: 8.0, step: 0.1, defaultValue: 5.8 },
        { key: 'sepal_width', label: '꽃받침 너비 (cm)', type: 'number', min: 1.5, max: 5.0, step: 0.1, defaultValue: 3.0 },
        { key: 'petal_length', label: '꽃잎 길이 (cm)', type: 'number', min: 0.5, max: 7.0, step: 0.1, defaultValue: 3.8 },
        { key: 'petal_width', label: '꽃잎 너비 (cm)', type: 'number', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.2 },
      ],
    },
    defaultSamples: { count: 15, useTestSet: true, shuffled: true },
  },
})

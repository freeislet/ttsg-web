import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from '../BaseDataset'
import { IDataset, ComputedDataFunction, ComputedDataConfig, FunctionInfo, ProgressCallback } from '../../types'

/**
 * 계산된 데이터 함수 정의
 */
export const COMPUTED_FUNCTIONS: Record<ComputedDataFunction, FunctionInfo> = {
  // Basic Functions
  linear: {
    name: 'Linear',
    description: 'Simple linear relationship',
    formula: 'y = ax + b',
    category: 'basic',
    defaultParams: { a: 1, b: 0 },
  },
  quadratic: {
    name: 'Quadratic',
    description: 'Parabolic curve',
    formula: 'y = ax² + bx + c',
    category: 'basic',
    defaultParams: { a: 1, b: 0, c: 0 },
  },
  cubic: {
    name: 'Cubic',
    description: 'S-shaped curve',
    formula: 'y = ax³ + bx² + cx + d',
    category: 'basic',
    defaultParams: { a: 1, b: 0, c: 0, d: 0 },
  },
  polynomial: {
    name: 'Polynomial',
    description: 'Complex curve',
    formula: 'y = ax⁴ + bx³ + cx² + dx + e',
    category: 'basic',
    defaultParams: { a: 0.1, b: 0, c: 1, d: 0, e: 0 },
  },

  // Trigonometric Functions
  sine: {
    name: 'Sine',
    description: 'Periodic wave',
    formula: 'y = A·sin(ωx + φ)',
    category: 'trigonometric',
    defaultParams: { amplitude: 1, frequency: 1, phase: 0 },
  },
  cosine: {
    name: 'Cosine',
    description: 'Shifted sine wave',
    formula: 'y = A·cos(ωx + φ)',
    category: 'trigonometric',
    defaultParams: { amplitude: 1, frequency: 1, phase: 0 },
  },
  tangent: {
    name: 'Tangent',
    description: 'Periodic with vertical asymptotes',
    formula: 'y = A·tan(ωx + φ)',
    category: 'trigonometric',
    defaultParams: { amplitude: 1, frequency: 1, phase: 0 },
  },

  // Advanced Functions
  sigmoid: {
    name: 'Sigmoid',
    description: 'S-shaped activation function',
    formula: 'y = 1 / (1 + e^(-kx))',
    category: 'advanced',
    defaultParams: { k: 1 },
  },
  gaussian: {
    name: 'Gaussian',
    description: 'Bell curve',
    formula: 'y = A·e^(-(x-μ)²/2σ²)',
    category: 'advanced',
    defaultParams: { amplitude: 1, mean: 0, stddev: 1 },
  },
}

/**
 * 함수별 계산 로직
 */
const computeFunctions: Record<ComputedDataFunction, (x: number, params: any) => number> = {
  linear: (x, p) => p.a * x + p.b,
  quadratic: (x, p) => p.a * x * x + p.b * x + p.c,
  cubic: (x, p) => p.a * x * x * x + p.b * x * x + p.c * x + p.d,
  polynomial: (x, p) => p.a * Math.pow(x, 4) + p.b * Math.pow(x, 3) + p.c * x * x + p.d * x + p.e,

  sine: (x, p) => p.amplitude * Math.sin(p.frequency * x + p.phase),
  cosine: (x, p) => p.amplitude * Math.cos(p.frequency * x + p.phase),
  tangent: (x, p) => p.amplitude * Math.tan(p.frequency * x + p.phase),

  sigmoid: (x, p) => 1 / (1 + Math.exp(-p.k * x)),
  gaussian: (x, p) => p.amplitude * Math.exp(-Math.pow(x - p.mean, 2) / (2 * p.stddev * p.stddev)),
}

/**
 * 계산된 데이터셋 클래스
 */
class ComputedDataset extends BaseDataset {
  readonly inputs: tf.Tensor
  readonly labels: tf.Tensor
  readonly inputShape: number[] = [1]
  readonly outputShape: number[] = [1]
  readonly inputColumns: string[] = ['x']
  readonly outputColumns: string[] = ['y']
  readonly sampleCount: number

  readonly trainInputs: tf.Tensor
  readonly trainLabels: tf.Tensor
  readonly testInputs: tf.Tensor
  readonly testLabels: tf.Tensor
  readonly trainCount: number
  readonly testCount: number

  constructor(
    inputs: tf.Tensor,
    labels: tf.Tensor,
    trainInputs: tf.Tensor,
    trainLabels: tf.Tensor,
    testInputs: tf.Tensor,
    testLabels: tf.Tensor
  ) {
    super()

    this.inputs = inputs
    this.labels = labels
    this.sampleCount = inputs.shape[0]

    this.trainInputs = trainInputs
    this.trainLabels = trainLabels
    this.testInputs = testInputs
    this.testLabels = testLabels

    this.trainCount = trainInputs.shape[0]
    this.testCount = testInputs.shape[0]
  }
}

/**
 * 계산된 데이터 로더 팩토리
 */
export function createComputedDataLoader(config: ComputedDataConfig) {
  return async (onProgress?: ProgressCallback): Promise<IDataset> => {
    console.log(`🧮 Generating ${config.functionType} data...`)
    onProgress?.(0, 'initializing', '데이터 생성 초기화...')

    const { minX, maxX, numPoints, trainSplit, noiseAmount } = config.parameters

    console.log(`🧮 Generating ${config.functionType} dataset with ${numPoints} points`)

    // X 값 생성
    onProgress?.(10, 'generating', 'X 값 생성 중...')
    const xValues = Array.from({ length: numPoints }, (_, i) => {
      return minX + (i / (numPoints - 1)) * (maxX - minX)
    })

    // 함수 파라미터 추출
    const funcInfo = COMPUTED_FUNCTIONS[config.functionType]
    const funcParams = { ...funcInfo.defaultParams, ...config.parameters }
    const computeFunc = computeFunctions[config.functionType]

    // Y 값 계산
    onProgress?.(30, 'computing', 'Y 값 계산 중...')
    const yValues = xValues.map((x) => {
      const baseY = computeFunc(x, funcParams)
      const noise = (Math.random() - 0.5) * 2 * noiseAmount
      return baseY + noise
    })

    // 텐서 생성
    onProgress?.(70, 'creating_tensors', '텐서 생성 중...')
    const inputs = tf.tensor2d(xValues.map((x) => [x]))
    const labels = tf.tensor2d(yValues.map((y) => [y]))

    // 훈련/테스트 분할
    onProgress?.(50, 'splitting', '데이터 분할 중...')
    const trainCount = Math.floor((numPoints * trainSplit) / 100)
    const testCount = numPoints - trainCount

    const trainInputs = inputs.slice([0, 0], [trainCount, 1])
    const trainLabels = labels.slice([0, 0], [trainCount, 1])
    const testInputs = inputs.slice([trainCount, 0], [testCount, 1])
    const testLabels = labels.slice([trainCount, 0], [testCount, 1])

    // 데이터셋 생성
    onProgress?.(90, 'finalizing', '데이터셋 생성 중...')
    const dataset = new ComputedDataset(
      inputs,
      labels,
      trainInputs,
      trainLabels,
      testInputs,
      testLabels
    )

    onProgress?.(100, 'completed', '데이터 생성 완료!')
    console.log(
      `✅ Generated ${config.functionType} dataset: ${trainCount} train, ${testCount} test samples`
    )

    return dataset
  }
}

/**
 * 선형 데이터 로더 (기본 예제)
 */
export async function loadLinearData(onProgress?: ProgressCallback): Promise<IDataset> {
  const config: ComputedDataConfig = {
    functionType: 'linear',
    parameters: {
      minX: -1,
      maxX: 1,
      numPoints: 100,
      trainSplit: 80,
      noiseAmount: 0.1,
      a: 2,
      b: 1,
    },
  }

  const loader = createComputedDataLoader(config)
  return loader(onProgress)
}

/**
 * 사인파 데이터 로더
 */
export async function loadSineData(onProgress?: ProgressCallback): Promise<IDataset> {
  const config: ComputedDataConfig = {
    functionType: 'sine',
    parameters: {
      minX: -Math.PI * 2,
      maxX: Math.PI * 2,
      numPoints: 200,
      trainSplit: 80,
      noiseAmount: 0.05,
      amplitude: 1,
      frequency: 1,
      phase: 0,
    },
  }

  const loader = createComputedDataLoader(config)
  return loader(onProgress)
}

/**
 * 함수 카테고리별 그룹화
 */
export const getFunctionsByCategory = () => {
  const categories: Record<string, ComputedDataFunction[]> = {
    basic: [],
    trigonometric: [],
    advanced: [],
  }

  Object.entries(COMPUTED_FUNCTIONS).forEach(([key, info]) => {
    categories[info.category].push(key as ComputedDataFunction)
  })

  return categories
}

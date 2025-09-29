import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from '../BaseDataset'
import { IDataset, ProgressCallback } from '../../types'
import { dataRegistry } from '../../registry'

/**
 * 계산된 데이터 함수 타입
 */
export type ComputedDataFunction =
  | 'linear'
  | 'quadratic'
  | 'cubic'
  | 'polynomial'
  | 'sine'
  | 'cosine'
  | 'tangent'
  | 'sigmoid'
  | 'gaussian'

/**
 * 계산된 데이터 설정
 */
export interface ComputedDataConfig {
  functionType: ComputedDataFunction
  parameters: {
    minX: number
    maxX: number
    numPoints: number
    trainSplit: number
    noiseAmount: number
    [key: string]: number // 함수별 추가 파라미터
  }
}

/**
 * 함수 정보 (computed 데이터용)
 */
export interface FunctionInfo {
  name: string
  description: string
  formula: string
  category: 'basic' | 'trigonometric' | 'advanced'
  defaultParams?: Record<string, number>
}

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

  constructor(inputs: tf.Tensor, labels: tf.Tensor) {
    super()
    this.inputs = inputs
    this.labels = labels
    this.sampleCount = inputs.shape[0]
  }
}

/**
 * 계산된 데이터 로더 팩토리
 */
export function createComputedDataLoader(config: ComputedDataConfig) {
  return async (onProgress?: ProgressCallback): Promise<IDataset> => {
    console.log(`🧮 Generating ${config.functionType} data...`)
    onProgress?.(0, 'initializing', '데이터 생성 초기화...')

    const { minX, maxX, numPoints, noiseAmount } = config.parameters

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

    // 데이터셋 생성
    onProgress?.(90, 'finalizing', '데이터셋 생성 중...')
    const dataset = new ComputedDataset(inputs, labels)

    onProgress?.(100, 'completed', '데이터 생성 완료!')
    console.log(`✅ Generated ${config.functionType} dataset: ${numPoints} samples`)

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

// computed 데이터셋들을 레지스트리에 등록
dataRegistry.register({
  id: 'linear',
  name: 'Linear Function',
  description: '선형 함수 데이터 (y = ax + b)',
  category: 'computed',
  loader: loadLinearData,
  tags: ['regression', 'basic', 'beginner'],
  difficulty: 'beginner',
  estimatedSize: '1KB',
  visualizations: [
    {
      type: 'chart',
      title: '선형 함수 그래프',
      description: 'y = ax + b 형태의 선형 관계',
      chartConfig: {
        type: 'line',
        xAxis: { column: 'x', label: 'X', type: 'continuous' },
        yAxis: { column: 'y', label: 'Y', type: 'continuous' },
        title: '선형 함수 (y = ax + b)',
      },
    },
    {
      type: 'scatter',
      title: '데이터 포인트',
      description: '노이즈가 포함된 선형 데이터 포인트',
      chartConfig: {
        type: 'scatter',
        xAxis: { column: 'x', label: 'X', type: 'continuous' },
        yAxis: { column: 'y', label: 'Y', type: 'continuous' },
        title: '선형 데이터 포인트',
      },
    },
    {
      type: 'table',
      title: '데이터 테이블',
      description: 'X, Y 좌표 값',
    },
  ],
})

dataRegistry.register({
  id: 'sine',
  name: 'Sine Wave',
  description: '사인파 함수 데이터 (y = A·sin(ωx + φ))',
  category: 'computed',
  loader: loadSineData,
  tags: ['regression', 'trigonometric', 'intermediate'],
  difficulty: 'intermediate',
  estimatedSize: '2KB',
  visualizations: [
    {
      type: 'chart',
      title: '사인파 그래프',
      description: 'y = A·sin(ωx + φ) 형태의 주기적 함수',
      chartConfig: {
        type: 'line',
        xAxis: { column: 'x', label: 'X (라디안)', type: 'continuous' },
        yAxis: { column: 'y', label: 'Y', type: 'continuous' },
        title: '사인파 함수',
      },
    },
    {
      type: 'chart',
      title: '주파수 분석',
      description: '사인파의 주파수 스펙트럼',
      chartConfig: {
        type: 'area',
        xAxis: { column: 'frequency', label: '주파수 (Hz)', type: 'continuous' },
        yAxis: { column: 'amplitude', label: '진폭', type: 'continuous' },
        title: '주파수 스펙트럼',
      },
    },
    {
      type: 'table',
      title: '데이터 테이블',
      description: 'X, Y 좌표 값과 위상 정보',
    },
  ],
})

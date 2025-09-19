import * as tf from '@tensorflow/tfjs'
import { ComputedDataFunction, ComputedDataConfig, Dataset } from '@/types/DataTypes'

/**
 * 계산된 데이터 함수 정의
 */
export const COMPUTED_FUNCTIONS: Record<ComputedDataFunction, {
  name: string
  description: string
  formula: string
  category: 'basic' | 'trigonometric' | 'advanced'
  defaultParams?: Record<string, number>
}> = {
  // Basic Functions
  linear: {
    name: 'Linear',
    description: 'Simple linear relationship',
    formula: 'y = ax + b',
    category: 'basic',
    defaultParams: { a: 1, b: 0 }
  },
  quadratic: {
    name: 'Quadratic', 
    description: 'Parabolic curve',
    formula: 'y = ax² + bx + c',
    category: 'basic',
    defaultParams: { a: 1, b: 0, c: 0 }
  },
  cubic: {
    name: 'Cubic',
    description: 'S-shaped curve',
    formula: 'y = ax³ + bx² + cx + d',
    category: 'basic',
    defaultParams: { a: 1, b: 0, c: 0, d: 0 }
  },
  polynomial: {
    name: 'Polynomial',
    description: 'Complex curve',
    formula: 'y = ax⁴ + bx³ + cx² + dx + e',
    category: 'basic',
    defaultParams: { a: 0.1, b: 0, c: 1, d: 0, e: 0 }
  },
  
  // Trigonometric Functions
  sine: {
    name: 'Sine',
    description: 'Periodic wave',
    formula: 'y = A·sin(ωx + φ)',
    category: 'trigonometric',
    defaultParams: { amplitude: 1, frequency: 1, phase: 0 }
  },
  cosine: {
    name: 'Cosine',
    description: 'Shifted sine wave',
    formula: 'y = A·cos(ωx + φ)',
    category: 'trigonometric',
    defaultParams: { amplitude: 1, frequency: 1, phase: 0 }
  },
  tangent: {
    name: 'Tangent',
    description: 'Periodic with vertical asymptotes',
    formula: 'y = A·tan(ωx + φ)',
    category: 'trigonometric',
    defaultParams: { amplitude: 1, frequency: 1, phase: 0 }
  },
  
  // Advanced Functions
  sigmoid: {
    name: 'Sigmoid',
    description: 'S-shaped activation function',
    formula: 'y = 1 / (1 + e^(-kx))',
    category: 'advanced',
    defaultParams: { k: 1 }
  },
  gaussian: {
    name: 'Gaussian',
    description: 'Bell curve',
    formula: 'y = A·e^(-(x-μ)²/2σ²)',
    category: 'advanced',
    defaultParams: { amplitude: 1, mean: 0, stddev: 1 }
  }
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
  gaussian: (x, p) => p.amplitude * Math.exp(-Math.pow(x - p.mean, 2) / (2 * p.stddev * p.stddev))
}

/**
 * 계산된 데이터셋 생성
 */
export const generateComputedDataset = (config: ComputedDataConfig): Dataset => {
  const { functionType, parameters } = config
  const { minX, maxX, numPoints, trainSplit, noiseAmount } = parameters
  
  // X 값 생성
  const xValues: number[] = []
  const step = (maxX - minX) / (numPoints - 1)
  for (let i = 0; i < numPoints; i++) {
    xValues.push(minX + i * step)
  }
  
  // 함수 파라미터 추출
  const funcInfo = COMPUTED_FUNCTIONS[functionType]
  const funcParams = { ...funcInfo.defaultParams, ...parameters }
  const computeFunc = computeFunctions[functionType]
  
  // Y 값 계산 (노이즈 추가)
  const yValues = xValues.map(x => {
    const y = computeFunc(x, funcParams)
    const noise = noiseAmount > 0 ? (Math.random() - 0.5) * 2 * noiseAmount : 0
    return y + noise
  })
  
  // 원본 데이터 생성
  const rawData = xValues.map((x, i) => ({ x, y: yValues[i] }))
  
  // 텐서 생성
  const inputs = tf.tensor2d(xValues.map(x => [x]))
  const outputs = tf.tensor2d(yValues.map(y => [y]))
  
  // 훈련/테스트 분할
  const trainCount = Math.floor(numPoints * trainSplit / 100)
  const testCount = numPoints - trainCount
  
  const trainInputs = inputs.slice([0, 0], [trainCount, 1])
  const trainOutputs = outputs.slice([0, 0], [trainCount, 1])
  const testInputs = inputs.slice([trainCount, 0], [testCount, 1])
  const testOutputs = outputs.slice([trainCount, 0], [testCount, 1])
  
  return {
    id: `computed_${functionType}_${Date.now()}`,
    name: `${funcInfo.name} Function`,
    description: `${funcInfo.description} (${funcInfo.formula})`,
    
    rawData,
    inputs,
    outputs,
    
    inputShape: [1],
    outputShape: [1],
    inputColumns: ['x'],
    outputColumns: ['y'],
    
    sampleCount: numPoints,
    trainCount,
    testCount,
    
    trainInputs,
    trainOutputs,
    testInputs,
    testOutputs
  }
}

/**
 * 함수 카테고리별 그룹화
 */
export const getFunctionsByCategory = () => {
  const categories: Record<string, ComputedDataFunction[]> = {
    basic: [],
    trigonometric: [],
    advanced: []
  }
  
  Object.entries(COMPUTED_FUNCTIONS).forEach(([key, info]) => {
    categories[info.category].push(key as ComputedDataFunction)
  })
  
  return categories
}

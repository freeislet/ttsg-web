import { DataPreset } from './types'
import { loadMNIST } from './datasets/sample/mnist'
import { loadLinearData, loadSineData, createComputedDataLoader } from './datasets/computed'

/**
 * 사전 정의된 데이터셋 프리셋 배열
 */
export const DATA_PRESETS: DataPreset[] = [
  // Sample 데이터 (외부에서 로드)
  {
    id: 'mnist',
    name: 'MNIST Handwritten Digits',
    description: '손글씨 숫자 인식 데이터셋 (28x28 이미지 → 0-9 숫자)',
    category: 'sample',
    loader: loadMNIST,
    tags: ['classification', 'computer-vision', 'beginner'],
    difficulty: 'beginner',
    estimatedSize: '11MB'
  },
  
  // Computed 데이터 (프로그래밍 방식으로 생성)
  {
    id: 'linear',
    name: 'Linear Function',
    description: '선형 함수 데이터 (y = ax + b)',
    category: 'computed',
    loader: loadLinearData,
    tags: ['regression', 'basic', 'beginner'],
    difficulty: 'beginner',
    estimatedSize: '1KB'
  },
  
  {
    id: 'sine',
    name: 'Sine Wave',
    description: '사인파 함수 데이터 (y = A·sin(ωx + φ))',
    category: 'computed',
    loader: loadSineData,
    tags: ['regression', 'trigonometric', 'intermediate'],
    difficulty: 'intermediate',
    estimatedSize: '2KB'
  },
  
  {
    id: 'quadratic',
    name: 'Quadratic Function',
    description: '이차 함수 데이터 (y = ax² + bx + c)',
    category: 'computed',
    loader: createComputedDataLoader({
      functionType: 'quadratic',
      parameters: {
        minX: -2,
        maxX: 2,
        numPoints: 150,
        trainSplit: 80,
        noiseAmount: 0.1,
        a: 1,
        b: 0,
        c: 0
      }
    }),
    tags: ['regression', 'polynomial', 'intermediate'],
    difficulty: 'intermediate',
    estimatedSize: '1KB'
  },
  
  {
    id: 'sigmoid',
    name: 'Sigmoid Function',
    description: 'S자 형태의 시그모이드 함수 (y = 1/(1+e^(-kx)))',
    category: 'computed',
    loader: createComputedDataLoader({
      functionType: 'sigmoid',
      parameters: {
        minX: -5,
        maxX: 5,
        numPoints: 100,
        trainSplit: 80,
        noiseAmount: 0.05,
        k: 1
      }
    }),
    tags: ['regression', 'activation-function', 'advanced'],
    difficulty: 'advanced',
    estimatedSize: '1KB'
  },
  
  {
    id: 'gaussian',
    name: 'Gaussian (Normal) Distribution',
    description: '가우시안 분포 데이터 (y = A·e^(-(x-μ)²/2σ²))',
    category: 'computed',
    loader: createComputedDataLoader({
      functionType: 'gaussian',
      parameters: {
        minX: -3,
        maxX: 3,
        numPoints: 120,
        trainSplit: 80,
        noiseAmount: 0.02,
        amplitude: 1,
        mean: 0,
        stddev: 1
      }
    }),
    tags: ['regression', 'statistics', 'advanced'],
    difficulty: 'advanced',
    estimatedSize: '1KB'
  }
]

/**
 * ID를 키로 하는 프리셋 맵
 */
export const DATA_PRESETS_MAP: Record<string, DataPreset> = DATA_PRESETS.reduce(
  (map, preset) => {
    map[preset.id] = preset
    return map
  },
  {} as Record<string, DataPreset>
)

/**
 * 카테고리별 프리셋 그룹화
 */
export const getPresetsByCategory = () => {
  const categories: Record<string, DataPreset[]> = {
    sample: [],
    computed: []
  }
  
  DATA_PRESETS.forEach(preset => {
    categories[preset.category].push(preset)
  })
  
  return categories
}

/**
 * 태그별 프리셋 필터링
 */
export const getPresetsByTag = (tag: string): DataPreset[] => {
  return DATA_PRESETS.filter(preset => 
    preset.tags?.includes(tag)
  )
}

/**
 * 난이도별 프리셋 필터링
 */
export const getPresetsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): DataPreset[] => {
  return DATA_PRESETS.filter(preset => 
    preset.difficulty === difficulty
  )
}

/**
 * 프리셋 목록 반환
 */
export const getDataPresets = (): DataPreset[] => {
  return DATA_PRESETS
}

/**
 * 특정 프리셋 반환
 */
export const getDataPreset = (id: string): DataPreset | undefined => {
  return DATA_PRESETS_MAP[id]
}

import { DataPreset, VisualizationConfig } from './types'
import { loadMNIST } from './datasets/sample/mnist'
import { loadIris } from './datasets/sample/iris'
import { loadCarMPG } from './datasets/sample/car-mpg'
import { loadLinearData, loadSineData, createComputedDataLoader } from './datasets/computed'

/**
 * 사전 정의된 데이터셋 프리셋 배열
 */
export const DATA_PRESETS: DataPreset[] = [
  // Sample 데이터 (외부에서 로드)
  {
    id: 'mnist',
    name: 'MNIST Handwritten Digits (Full)',
    description: '손글씨 숫자 인식 데이터셋 (28x28 이미지 → 0-9 숫자, 70,000개)',
    category: 'sample',
    loader: loadMNIST,
    tags: ['classification', 'computer-vision', 'beginner'],
    difficulty: 'beginner',
    estimatedSize: '11MB',
    visualizations: [
      {
        type: 'image',
        title: '이미지 그리드',
        description: '28x28 손글씨 숫자 이미지들을 그리드 형태로 표시',
        imageConfig: {
          width: 28,
          height: 28,
          channels: 1,
          colormap: 'grayscale',
        },
      },
      {
        type: 'chart',
        title: '클래스 분포',
        description: '0-9 숫자별 샘플 수 분포',
        chartConfig: {
          type: 'bar',
          xAxis: { column: 'label', label: '숫자', type: 'categorical' },
          yAxis: { column: 'count', label: '샘플 수', type: 'continuous' },
          title: 'MNIST 클래스 분포',
        },
      },
      {
        type: 'table',
        title: '데이터 테이블',
        description: '이미지 데이터와 라벨 정보',
      },
    ],
  },

  {
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
  },

  {
    id: 'car-mpg',
    name: 'Car MPG Prediction',
    description: '자동차 연비 예측 데이터셋 (마력 → MPG 예측)',
    category: 'sample',
    loader: loadCarMPG,
    tags: ['regression', 'tabular', 'beginner'],
    difficulty: 'beginner',
    estimatedSize: '15KB',
    visualizations: [
      {
        type: 'scatter',
        title: '마력 vs 연비',
        description: '자동차 마력과 연비 간의 관계',
        chartConfig: {
          type: 'scatter',
          xAxis: { column: 'horsepower', label: '마력 (HP)', type: 'continuous' },
          yAxis: { column: 'mpg', label: '연비 (MPG)', type: 'continuous' },
          title: '마력과 연비의 상관관계',
        },
      },
      {
        type: 'chart',
        title: '연비 분포',
        description: '자동차 연비 히스토그램',
        chartConfig: {
          type: 'histogram',
          xAxis: { column: 'mpg', label: '연비 (MPG)', type: 'continuous' },
          yAxis: { column: 'count', label: '빈도', type: 'continuous' },
          title: '자동차 연비 분포',
        },
      },
      {
        type: 'table',
        title: '데이터 테이블',
        description: '자동차 특성 및 연비 정보',
      },
    ],
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
  },

  {
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
        c: 0,
      },
    }),
    tags: ['regression', 'polynomial', 'intermediate'],
    difficulty: 'intermediate',
    estimatedSize: '1KB',
    visualizations: [
      {
        type: 'chart',
        title: '이차 함수 그래프',
        description: 'y = ax² + bx + c 형태의 포물선',
        chartConfig: {
          type: 'line',
          xAxis: { column: 'x', label: 'X', type: 'continuous' },
          yAxis: { column: 'y', label: 'Y', type: 'continuous' },
          title: '이차 함수 (y = ax² + bx + c)',
        },
      },
      {
        type: 'scatter',
        title: '데이터 포인트',
        description: '노이즈가 포함된 이차 함수 데이터',
        chartConfig: {
          type: 'scatter',
          xAxis: { column: 'x', label: 'X', type: 'continuous' },
          yAxis: { column: 'y', label: 'Y', type: 'continuous' },
          title: '이차 함수 데이터 포인트',
        },
      },
      {
        type: 'table',
        title: '데이터 테이블',
        description: 'X, Y 좌표 값',
      },
    ],
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
        k: 1,
      },
    }),
    tags: ['regression', 'activation-function', 'advanced'],
    difficulty: 'advanced',
    estimatedSize: '1KB',
    visualizations: [
      {
        type: 'chart',
        title: '시그모이드 함수',
        description: 'S자 형태의 시그모이드 곡선',
        chartConfig: {
          type: 'line',
          xAxis: { column: 'x', label: 'X', type: 'continuous' },
          yAxis: { column: 'y', label: 'Y (0-1)', type: 'continuous' },
          title: '시그모이드 함수 (y = 1/(1+e^(-kx)))',
        },
      },
      {
        type: 'chart',
        title: '활성화 분포',
        description: '시그모이드 출력값의 분포',
        chartConfig: {
          type: 'histogram',
          xAxis: { column: 'y', label: '출력값', type: 'continuous' },
          yAxis: { column: 'count', label: '빈도', type: 'continuous' },
          title: '시그모이드 출력 분포',
        },
      },
      {
        type: 'table',
        title: '데이터 테이블',
        description: 'X, Y 좌표 값과 활성화 정보',
      },
    ],
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
        stddev: 1,
      },
    }),
    tags: ['regression', 'statistics', 'advanced'],
    difficulty: 'advanced',
    estimatedSize: '1KB',
    visualizations: [
      {
        type: 'chart',
        title: '가우시안 분포',
        description: '정규분포 곡선',
        chartConfig: {
          type: 'area',
          xAxis: { column: 'x', label: 'X', type: 'continuous' },
          yAxis: { column: 'y', label: '확률 밀도', type: 'continuous' },
          title: '가우시안 분포 (μ=0, σ=1)',
        },
      },
      {
        type: 'chart',
        title: '누적 분포',
        description: '누적 분포 함수 (CDF)',
        chartConfig: {
          type: 'line',
          xAxis: { column: 'x', label: 'X', type: 'continuous' },
          yAxis: { column: 'cdf', label: '누적 확률', type: 'continuous' },
          title: '누적 분포 함수',
        },
      },
      {
        type: 'table',
        title: '데이터 테이블',
        description: 'X, Y 좌표 값과 통계 정보',
      },
    ],
  },
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
    computed: [],
  }

  DATA_PRESETS.forEach((preset) => {
    categories[preset.category].push(preset)
  })

  return categories
}

/**
 * 태그별 프리셋 필터링
 */
export const getPresetsByTag = (tag: string): DataPreset[] => {
  return DATA_PRESETS.filter((preset) => preset.tags?.includes(tag))
}

/**
 * 난이도별 프리셋 필터링
 */
export const getPresetsByDifficulty = (
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): DataPreset[] => {
  return DATA_PRESETS.filter((preset) => preset.difficulty === difficulty)
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

/**
 * 프리셋의 기본 시각화 설정 반환 (첫 번째 시각화)
 */
export const getDefaultVisualization = (presetId: string): VisualizationConfig | undefined => {
  const preset = getDataPreset(presetId)
  return preset?.visualizations?.[0]
}

/**
 * 프리셋의 모든 시각화 설정 반환
 */
export const getVisualizationConfigs = (presetId: string): VisualizationConfig[] => {
  const preset = getDataPreset(presetId)
  return preset?.visualizations || []
}

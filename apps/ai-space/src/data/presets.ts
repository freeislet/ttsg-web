import { DataPreset, VisualizationConfig, PredictionConfig } from './types'
import { loadMNIST } from './datasets/sample/mnist'
import { loadIris } from './datasets/sample/iris'
import { loadCarMPG } from './datasets/sample/car-mpg'
import { loadLinearData, loadSineData, createComputedDataLoader } from './datasets/computed'
import { dataRegistry } from './registry'

/**
 * 사전 정의된 데이터셋 프리셋 배열
 */
// DEPRECATED: 정적 배열은 점진적으로 제거 예정
// 현재는 레지스트리 초기 시딩 용도로만 사용
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
    prediction: {
      display: {
        type: 'image-classification',
        title: 'MNIST 숫자 예측 결과',
        description: '28x28 이미지와 예측된 숫자를 함께 표시',
        imageConfig: {
          width: 28,
          height: 28,
          channels: 1,
          colormap: 'grayscale',
          showOriginal: true,
        },
        columns: [
          {
            key: 'image',
            label: '이미지',
            type: 'image',
            format: {
              width: 56, // 2배 크기로 표시
              height: 56,
              channels: 1,
              colormap: 'grayscale',
            },
          },
          {
            key: 'predicted_class',
            label: '예측 숫자',
            type: 'text',
          },
          {
            key: 'confidence',
            label: '신뢰도',
            type: 'probability',
            format: {
              precision: 2,
              percentage: true,
            },
          },
          {
            key: 'actual_class',
            label: '실제 숫자',
            type: 'text',
          },
        ],
        sampleLimit: 20,
        supportsRealtime: false,
      },
      input: {
        type: 'canvas',
        title: '손글씨 숫자 그리기',
        description: '캔버스에 0-9 숫자를 그려서 예측해보세요',
        canvasConfig: {
          width: 280,
          height: 280,
          backgroundColor: '#000000',
          strokeColor: '#ffffff',
          strokeWidth: 20,
        },
      },
      defaultSamples: {
        count: 10,
        useTestSet: true,
        shuffled: true,
      },
    },
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
    prediction: {
      display: {
        type: 'tabular',
        title: 'Iris 품종 예측 결과',
        description: '꽃잎/꽃받침 특성에 따른 붓꽃 품종 분류 결과',
        columns: [
          {
            key: 'sepal_length',
            label: '꽃받침 길이 (cm)',
            type: 'number',
            format: { precision: 1 },
          },
          {
            key: 'sepal_width',
            label: '꽃받침 너비 (cm)',
            type: 'number',
            format: { precision: 1 },
          },
          {
            key: 'petal_length',
            label: '꽃잎 길이 (cm)',
            type: 'number',
            format: { precision: 1 },
          },
          {
            key: 'petal_width',
            label: '꽃잎 너비 (cm)',
            type: 'number',
            format: { precision: 1 },
          },
          {
            key: 'predicted_class',
            label: '예측 품종',
            type: 'text',
          },
          {
            key: 'confidence',
            label: '신뢰도',
            type: 'probability',
            format: {
              precision: 2,
              percentage: true,
            },
          },
          {
            key: 'actual_class',
            label: '실제 품종',
            type: 'text',
          },
        ],
        sampleLimit: 15,
        supportsRealtime: true,
      },
      input: {
        type: 'form',
        title: '붓꽃 특성 입력',
        description: '꽃받침과 꽃잎의 크기를 입력하여 품종을 예측해보세요',
        formFields: [
          {
            key: 'sepal_length',
            label: '꽃받침 길이 (cm)',
            type: 'number',
            min: 3.0,
            max: 8.0,
            step: 0.1,
            defaultValue: 5.8,
          },
          {
            key: 'sepal_width',
            label: '꽃받침 너비 (cm)',
            type: 'number',
            min: 1.5,
            max: 5.0,
            step: 0.1,
            defaultValue: 3.0,
          },
          {
            key: 'petal_length',
            label: '꽃잎 길이 (cm)',
            type: 'number',
            min: 0.5,
            max: 7.0,
            step: 0.1,
            defaultValue: 3.8,
          },
          {
            key: 'petal_width',
            label: '꽃잎 너비 (cm)',
            type: 'number',
            min: 0.1,
            max: 3.0,
            step: 0.1,
            defaultValue: 1.2,
          },
        ],
      },
      defaultSamples: {
        count: 15,
        useTestSet: true,
        shuffled: true,
      },
    },
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
    prediction: {
      display: {
        type: 'tabular',
        title: '자동차 연비 예측 결과',
        description: '자동차 특성에 따른 연비(MPG) 예측 결과',
        columns: [
          {
            key: 'horsepower',
            label: '마력 (HP)',
            type: 'number',
            format: { precision: 0 },
          },
          {
            key: 'predicted_mpg',
            label: '예측 연비 (MPG)',
            type: 'number',
            format: { precision: 1 },
          },
          {
            key: 'actual_mpg',
            label: '실제 연비 (MPG)',
            type: 'number',
            format: { precision: 1 },
          },
          {
            key: 'error',
            label: '오차',
            type: 'number',
            format: { precision: 2 },
          },
        ],
        sampleLimit: 20,
        supportsRealtime: true,
      },
      input: {
        type: 'form',
        title: '자동차 특성 입력',
        description: '자동차의 마력을 입력하여 연비를 예측해보세요',
        formFields: [
          {
            key: 'horsepower',
            label: '마력 (HP)',
            type: 'number',
            min: 40,
            max: 250,
            step: 5,
            defaultValue: 120,
          },
        ],
      },
      defaultSamples: {
        count: 20,
        useTestSet: true,
        shuffled: true,
      },
    },
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

// 레지스트리 초기화 시딩
dataRegistry.registerMany(DATA_PRESETS)

/**
 * ID를 키로 하는 프리셋 맵 (레지스트리 기반)
 */
export const DATA_PRESETS_MAP: Record<string, DataPreset> = (() => {
  const map: Record<string, DataPreset> = {}
  for (const p of dataRegistry.all()) {
    map[p.id] = p
  }
  return map
})()

/**
 * 카테고리별 프리셋 그룹화
 */
export const getPresetsByCategory = () => {
  const categories: Record<string, DataPreset[]> = { sample: [], computed: [] }
  for (const p of dataRegistry.all()) {
    categories[p.category].push(p)
  }
  return categories
}

/**
 * 태그별 프리셋 필터링
 */
export const getPresetsByTag = (tag: string): DataPreset[] => {
  return dataRegistry.byTag(tag)
}

/**
 * 난이도별 프리셋 필터링
 */
export const getPresetsByDifficulty = (
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): DataPreset[] => {
  return dataRegistry.byDifficulty(difficulty)
}

/**
 * 프리셋 목록 반환
 */
export const getDataPresets = (): DataPreset[] => {
  return dataRegistry.all()
}

/**
 * 특정 프리셋 반환
 */
export const getDataPreset = (id: string): DataPreset | undefined => {
  return dataRegistry.get(id)
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

/**
 * 프리셋의 예측 설정 반환
 */
export const getPredictionConfig = (presetId: string): PredictionConfig | undefined => {
  const preset = getDataPreset(presetId)
  return preset?.prediction
}

/**
 * 프리셋의 예측 표시 설정 반환
 */
export const getPredictionDisplayConfig = (presetId: string) => {
  const preset = getDataPreset(presetId)
  return preset?.prediction?.display
}

/**
 * 프리셋의 예측 입력 설정 반환
 */
export const getPredictionInputConfig = (presetId: string) => {
  const preset = getDataPreset(presetId)
  return preset?.prediction?.input
}

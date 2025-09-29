import * as tf from '@tensorflow/tfjs'

/**
 * 데이터셋 설명 정의
 */
export interface DatasetDesc {
  id: string
  name: string
  description: string
  category: DataCategory
  loader: DataLoader

  // 메타데이터
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedSize?: string // '1.2MB', '50KB' 등

  // 시각화 설정
  visualizations?: VisualizationConfig[]

  // 예측 결과 표시 설정
  prediction?: PredictionConfig
}

/**
 * 데이터 카테고리 타입
 */
export type DataCategory = 'sample' | 'computed'

/**
 * 데이터 로더 함수 타입
 */
export type DataLoader = (onProgress?: ProgressCallback) => Promise<IDataset>

/**
 * 데이터셋 인터페이스
 */
export interface IDataset {
  // 필수 텐서 데이터
  readonly inputs: tf.Tensor
  readonly labels: tf.Tensor

  // 메타데이터
  readonly inputShape: number[]
  readonly outputShape: number[]
  readonly inputColumns: string[]
  readonly outputColumns: string[]
  readonly sampleCount: number

  // 메모리 정리 함수
  dispose(): void
}

/**
 * 프로그레스 콜백 타입
 */
export interface ProgressCallback {
  (progress: number, stage: string, message?: string): void
}

/**
 * 데이터 뷰어 모드
 */
export type DataViewMode = 'table' | 'chart' | 'scatter' | 'histogram'

/**
 * 시각화 타입
 */
export type VisualizationType =
  | 'table'
  | 'chart'
  | 'image'
  | 'scatter'
  | 'histogram'
  | 'heatmap'
  | 'distribution'

/**
 * 차트 타입
 */
export type ChartType = 'line' | 'bar' | 'scatter' | 'histogram' | 'pie' | 'area' | 'box'

/**
 * 축 데이터 설정
 */
export interface AxisConfig {
  column: string
  label?: string
  type?: 'continuous' | 'categorical'
}

/**
 * 차트 설정
 */
export interface ChartConfig {
  type: ChartType
  xAxis?: AxisConfig
  yAxis?: AxisConfig
  colorBy?: string
  title?: string
  description?: string
}

/**
 * 시각화 설정
 */
export interface VisualizationConfig {
  type: VisualizationType
  title: string
  description?: string
  chartConfig?: ChartConfig
  imageConfig?: {
    width: number
    height: number
    channels?: number
    colormap?: string
  }
}

/**
 * 데이터 노드 상태
 */
export interface DataNodeState {
  preset?: DatasetDesc
  dataset?: IDataset
  isLoading: boolean
  error?: string
  viewMode: DataViewMode

  // 프로그레스 정보
  progress?: {
    percentage: number
    stage: string
    message?: string
  }
}

/**
 * 데이터셋 통계
 */
export interface DatasetStats {
  inputStats: {
    min: number[]
    max: number[]
    mean: number[]
    std: number[]
  }
  outputStats: {
    min: number[]
    max: number[]
    mean: number[]
    std: number[]
  }
  memoryUsage: number // bytes
}

/**
 * 예측 결과 표시 타입
 */
export type PredictionDisplayType =
  | 'tabular'
  | 'image-classification'
  | 'image-grid'
  | 'chart'
  | 'custom'

/**
 * 예측 결과 컬럼 설정
 */
export interface PredictionColumn {
  key: string
  label: string
  type: 'image' | 'text' | 'number' | 'probability' | 'confidence'
  format?: {
    // 이미지 타입용
    width?: number
    height?: number
    channels?: number
    colormap?: string
    // 숫자 타입용
    precision?: number
    percentage?: boolean
    // 텍스트 타입용
    maxLength?: number
  }
}

/**
 * 예측 결과 표시 설정
 */
export interface PredictionDisplayConfig {
  type: PredictionDisplayType
  title: string
  description?: string

  // Tabular 타입용 설정
  columns?: PredictionColumn[]

  // Image Classification 타입용 설정
  imageConfig?: {
    width: number
    height: number
    channels?: number
    colormap?: string
    showOriginal?: boolean // 원본 이미지도 표시할지
  }

  // 차트 타입용 설정 (기존 ChartConfig 재사용)
  chartConfig?: ChartConfig

  // 커스텀 컴포넌트 설정
  customComponent?: string

  // 샘플 수 제한 (너무 많은 결과 방지)
  sampleLimit?: number

  // 실시간 예측 지원 여부
  supportsRealtime?: boolean
}

/**
 * 모델 예측 입력 방식
 */
export type PredictionInputType = 'form' | 'canvas' | 'graph-click' | 'file-upload' | 'slider'

/**
 * 예측 입력 설정
 */
export interface PredictionInputConfig {
  type: PredictionInputType
  title: string
  description?: string

  // Form 타입용 설정
  formFields?: Array<{
    key: string
    label: string
    type: 'number' | 'select'
    min?: number
    max?: number
    step?: number
    options?: string[]
    defaultValue?: any
  }>

  // Canvas 타입용 설정 (MNIST 등)
  canvasConfig?: {
    width: number
    height: number
    backgroundColor?: string
    strokeColor?: string
    strokeWidth?: number
  }

  // Graph Click 타입용 설정
  graphConfig?: {
    xAxis: AxisConfig
    yAxis: AxisConfig
    clickToPredict?: boolean
  }

  // File Upload 타입용 설정
  uploadConfig?: {
    acceptedTypes: string[]
    maxSize?: number
    multiple?: boolean
  }
}

/**
 * 통합 예측 설정
 */
export interface PredictionConfig {
  // 표시 설정
  display: PredictionDisplayConfig

  // 입력 설정 (모델 예측 노드용)
  input?: PredictionInputConfig

  // 기본 예측 샘플 (테스트용)
  defaultSamples?: {
    count: number
    useTestSet?: boolean
    shuffled?: boolean
  }
}

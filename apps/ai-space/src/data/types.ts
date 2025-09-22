import * as tf from '@tensorflow/tfjs'

/**
 * 데이터 카테고리 타입
 */
export type DataCategory = 'sample' | 'computed'

/**
 * 데이터셋 인터페이스
 * 모든 데이터는 이 형태로 통일됨
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
  
  // 선택적 분할 데이터 (훈련/테스트)
  readonly trainInputs?: tf.Tensor
  readonly trainLabels?: tf.Tensor
  readonly testInputs?: tf.Tensor
  readonly testLabels?: tf.Tensor
  
  // 통계 정보
  readonly trainCount?: number
  readonly testCount?: number
  
  // 메모리 정리 함수
  dispose(): void
}

/**
 * 데이터 로더 함수 타입
 */
export type DataLoader = () => Promise<IDataset>

/**
 * 데이터 프리셋 정의
 * name과 description은 여기서만 정의하여 중복 제거
 */
export interface DataPreset {
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
}

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
 * 데이터 뷰어 모드
 */
export type DataViewMode = 'table' | 'chart' | 'scatter' | 'histogram'

/**
 * 시각화 타입
 */
export type VisualizationType = 'table' | 'chart' | 'image' | 'scatter' | 'histogram' | 'heatmap' | 'distribution'

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
  preset?: DataPreset
  dataset?: IDataset
  isLoading: boolean
  error?: string
  viewMode: DataViewMode
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

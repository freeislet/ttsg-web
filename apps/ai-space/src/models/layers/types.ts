/**
 * 레이어 타입 정의
 */
export type LayerType = 'dense' | 'dropout' | 'batchNormalization' | 'conv1d' | 'conv2d' | 'lstm'

/**
 * 베이스 레이어 설정 인터페이스
 */
export interface BaseLayerConfig {
  type: LayerType
}

/**
 * Dense 레이어 설정
 */
export interface DenseLayerConfig extends BaseLayerConfig {
  type: 'dense'
  units: number
  activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear' | 'elu' | 'selu'
  useBias?: boolean
  kernelInitializer?: string
  biasInitializer?: string
}

/**
 * Dropout 레이어 설정
 */
export interface DropoutLayerConfig extends BaseLayerConfig {
  type: 'dropout'
  rate: number
}

/**
 * BatchNormalization 레이어 설정
 */
export interface BatchNormalizationLayerConfig extends BaseLayerConfig {
  type: 'batchNormalization'
  axis?: number
  momentum?: number
  epsilon?: number
}

/**
 * Conv1D 레이어 설정 (확장용)
 */
export interface Conv1DLayerConfig extends BaseLayerConfig {
  type: 'conv1d'
  filters: number
  kernelSize: number
  strides?: number
  padding?: 'valid' | 'same' | 'causal'
  activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear'
}

/**
 * 통합 레이어 설정 (유니온 타입)
 */
export type LayerConfig = 
  | DenseLayerConfig 
  | DropoutLayerConfig 
  | BatchNormalizationLayerConfig
  | Conv1DLayerConfig

/**
 * 레이어 팩토리 함수 타입
 */
export type LayerFactory<T extends LayerConfig> = (config: T) => import('@tensorflow/tfjs').layers.Layer

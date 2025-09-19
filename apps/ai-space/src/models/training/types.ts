import * as tf from '@tensorflow/tfjs'

/**
 * 옵티마이저 타입
 */
export type OptimizerType = 'adam' | 'sgd' | 'rmsprop' | 'adagrad' | 'adadelta'

/**
 * 손실 함수 타입
 */
export type LossFunction = 
  | 'mse' 
  | 'mae'
  | 'binaryCrossentropy' 
  | 'categoricalCrossentropy' 
  | 'sparseCategoricalCrossentropy'
  | 'huber'
  | 'logcosh'

/**
 * 기본 훈련 설정 인터페이스
 */
export interface BaseTrainingConfig {
  optimizer: OptimizerType
  learningRate: number
  epochs: number
  batchSize: number
  validationSplit?: number
  shuffle?: boolean
  verbose?: number
}

/**
 * 모델 훈련 설정 인터페이스 (TensorFlow.js 모델용)
 */
export interface ModelTrainingConfig extends BaseTrainingConfig {
  loss: LossFunction
  metrics?: string[]
  earlyStoppingPatience?: number
  learningRateSchedule?: 'constant' | 'exponential' | 'polynomial'
}

/**
 * 훈련 메트릭 히스토리
 */
export interface TrainingHistory {
  loss: number[]
  accuracy?: number[]
  valLoss?: number[]
  valAccuracy?: number[]
  [metricName: string]: number[] | undefined
}

/**
 * 훈련 결과 인터페이스
 */
export interface TrainingResult {
  history: TrainingHistory
  finalMetrics: Record<string, number>
  epochs: number
  duration: number
  bestEpoch?: number
  stopped: boolean
  stoppedReason?: 'completed' | 'early_stopping' | 'error'
}

/**
 * 훈련 진행 상황 정보
 */
export interface TrainingProgress {
  epoch: number
  totalEpochs: number
  logs: Record<string, number>
  elapsedTime: number
  estimatedTimeRemaining?: number
}

/**
 * 훈련 콜백 인터페이스
 */
export interface TrainingCallbacks {
  onTrainStart?: () => void | Promise<void>
  onTrainEnd?: (result: TrainingResult) => void | Promise<void>
  onEpochStart?: (epoch: number) => void | Promise<void>
  onEpochEnd?: (epoch: number, logs: Record<string, number>) => void | Promise<void>
  onProgress?: (progress: TrainingProgress) => void | Promise<void>
  onError?: (error: Error) => void | Promise<void>
}

/**
 * 훈련 가능한 모델 인터페이스
 */
export interface TrainableModel {
  model: tf.LayersModel
  compile(config: ModelTrainingConfig): void
  fit(
    x: tf.Tensor | tf.Tensor[],
    y: tf.Tensor | tf.Tensor[],
    args?: tf.ModelFitArgs
  ): Promise<tf.History>
}

/**
 * 옵티마이저 설정
 */
export interface OptimizerConfig {
  type: OptimizerType
  learningRate: number
  beta1?: number // Adam용
  beta2?: number // Adam용
  momentum?: number // SGD용
  decay?: number
  epsilon?: number
}

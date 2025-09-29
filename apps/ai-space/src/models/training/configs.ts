import { ModelTrainingConfig } from './types'

/**
 * 신경망 모델 기본 훈련 설정
 */
export const createNeuralNetworkConfig = (
  partial?: Partial<ModelTrainingConfig>
): ModelTrainingConfig => ({
  optimizer: 'adam',
  learningRate: 0.001,
  loss: 'mse',
  metrics: ['accuracy'],
  epochs: 1000,
  batchSize: 32,
  validationSplit: 0.2,
  shuffle: true,
  verbose: 0,
  earlyStoppingPatience: 15,
  ...partial,
})

/**
 * 분류 모델 기본 훈련 설정
 */
export const createClassificationConfig = (
  numClasses: number,
  partial?: Partial<ModelTrainingConfig>
): ModelTrainingConfig => ({
  optimizer: 'adam',
  learningRate: 0.001,
  loss: numClasses === 2 ? 'binaryCrossentropy' : 'categoricalCrossentropy',
  metrics: ['accuracy'],
  epochs: 150,
  batchSize: 32,
  validationSplit: 0.2,
  shuffle: true,
  verbose: 0,
  earlyStoppingPatience: 20,
  ...partial,
})

/**
 * 회귀 모델 기본 훈련 설정
 */
export const createRegressionConfig = (
  partial?: Partial<ModelTrainingConfig>
): ModelTrainingConfig => ({
  optimizer: 'adam',
  learningRate: 0.001,
  loss: 'mse',
  metrics: ['mae'],
  epochs: 200,
  batchSize: 32,
  validationSplit: 0.2,
  shuffle: true,
  verbose: 0,
  earlyStoppingPatience: 25,
  ...partial,
})

/**
 * CNN 모델 기본 훈련 설정
 */
export const createCNNConfig = (partial?: Partial<ModelTrainingConfig>): ModelTrainingConfig => ({
  optimizer: 'adam',
  learningRate: 0.0001, // CNN은 보통 더 낮은 학습률 사용
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy'],
  epochs: 50,
  batchSize: 16, // CNN은 보통 더 작은 배치 크기 사용
  validationSplit: 0.2,
  shuffle: true,
  verbose: 0,
  earlyStoppingPatience: 10,
  ...partial,
})

/**
 * RNN/LSTM 모델 기본 훈련 설정
 */
export const createRNNConfig = (partial?: Partial<ModelTrainingConfig>): ModelTrainingConfig => ({
  optimizer: 'rmsprop', // RNN에는 RMSprop이 일반적으로 좋음
  learningRate: 0.001,
  loss: 'mse',
  metrics: ['mae'],
  epochs: 100,
  batchSize: 64,
  validationSplit: 0.2,
  shuffle: false, // 시계열 데이터는 보통 셔플하지 않음
  verbose: 0,
  earlyStoppingPatience: 15,
  ...partial,
})

/**
 * 전이 학습 모델 기본 훈련 설정
 */
export const createTransferLearningConfig = (
  partial?: Partial<ModelTrainingConfig>
): ModelTrainingConfig => ({
  optimizer: 'adam',
  learningRate: 0.0001, // 전이 학습은 낮은 학습률 사용
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy'],
  epochs: 30, // 전이 학습은 적은 에포크로도 충분
  batchSize: 16,
  validationSplit: 0.2,
  shuffle: true,
  verbose: 0,
  earlyStoppingPatience: 5,
  ...partial,
})

/**
 * 빠른 프로토타이핑용 설정
 */
export const createQuickConfig = (partial?: Partial<ModelTrainingConfig>): ModelTrainingConfig => ({
  optimizer: 'adam',
  learningRate: 0.01, // 빠른 학습을 위한 높은 학습률
  loss: 'mse',
  metrics: ['accuracy'],
  epochs: 10, // 빠른 테스트를 위한 적은 에포크
  batchSize: 64,
  validationSplit: 0.2,
  shuffle: true,
  verbose: 1,
  earlyStoppingPatience: 3,
  ...partial,
})

/**
 * 모델 타입별 권장 설정 가져오기
 */
export const getRecommendedConfig = (
  modelType:
    | 'neural-network'
    | 'classification'
    | 'regression'
    | 'cnn'
    | 'rnn'
    | 'transfer'
    | 'quick',
  options?: any
): ModelTrainingConfig => {
  switch (modelType) {
    case 'neural-network':
      return createNeuralNetworkConfig(options)

    case 'classification':
      return createClassificationConfig(options?.numClasses || 2, options)

    case 'regression':
      return createRegressionConfig(options)

    case 'cnn':
      return createCNNConfig(options)

    case 'rnn':
      return createRNNConfig(options)

    case 'transfer':
      return createTransferLearningConfig(options)

    case 'quick':
      return createQuickConfig(options)

    default:
      return createNeuralNetworkConfig(options)
  }
}

/**
 * 설정 검증
 */
export const validateTrainingConfig = (config: ModelTrainingConfig): string[] => {
  const errors: string[] = []

  if (config.learningRate <= 0 || config.learningRate > 1) {
    errors.push('Learning rate must be between 0 and 1')
  }

  if (config.epochs <= 0) {
    errors.push('Epochs must be greater than 0')
  }

  if (config.batchSize <= 0) {
    errors.push('Batch size must be greater than 0')
  }

  if (config.validationSplit && (config.validationSplit <= 0 || config.validationSplit >= 1)) {
    errors.push('Validation split must be between 0 and 1')
  }

  if (config.earlyStoppingPatience && config.earlyStoppingPatience <= 0) {
    errors.push('Early stopping patience must be greater than 0')
  }

  return errors
}

/**
 * 모델 훈련 모듈 통합 export
 * 
 * 이 모듈은 TensorFlow.js 모델의 훈련을 위한 일반화된 시스템을 제공합니다.
 * NN, CNN, RNN 등 모든 모델 타입에서 재사용 가능합니다.
 */

// 타입 정의
export type {
  OptimizerType,
  LossFunction,
  BaseTrainingConfig,
  ModelTrainingConfig,
  TrainingHistory,
  TrainingResult,
  TrainingProgress,
  TrainingCallbacks,
  TrainableModel,
  OptimizerConfig
} from './types'

// 옵티마이저 관련
export {
  createOptimizer,
  createOptimizerWithConfig,
  getDefaultOptimizerConfig,
  getSupportedOptimizerTypes,
  getOptimizerDescription
} from './optimizers'

// 콜백 시스템
export {
  createDefaultCallbacks,
  createProgressCallback,
  createEarlyStoppingCallback,
  createMetricsLoggingCallback,
  combineCallbacks
} from './callbacks'

// 메트릭 처리
export {
  extractMetrics,
  calculateFinalMetrics,
  findBestEpoch,
  calculateMetricStats,
  analyzeTrainingProgress,
  detectOverfitting
} from './metrics'

// 트레이너 클래스
export { ModelTrainer } from './trainer'

// 설정 관련
export {
  createNeuralNetworkConfig,
  createClassificationConfig,
  createRegressionConfig,
  createCNNConfig,
  createRNNConfig,
  createTransferLearningConfig,
  createQuickConfig,
  getRecommendedConfig,
  validateTrainingConfig
} from './configs'

// 편의 함수들
export const createTrainer = () => new ModelTrainer()

/**
 * 기본 훈련 실행 함수 (간편 사용)
 */
export const trainModel = async (
  model: import('@tensorflow/tfjs').LayersModel,
  trainX: import('@tensorflow/tfjs').Tensor,
  trainY: import('@tensorflow/tfjs').Tensor,
  config?: Partial<ModelTrainingConfig>,
  onProgress?: (epoch: number, logs: Record<string, number>) => void
) => {
  const trainer = new ModelTrainer()
  const fullConfig = createNeuralNetworkConfig(config)
  const callbacks = createDefaultCallbacks(onProgress)
  
  return trainer.train(model, trainX, trainY, fullConfig, callbacks)
}

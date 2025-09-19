import * as tf from '@tensorflow/tfjs'
import { LayerConfig, createLayer, validateLayerConfig } from './layers'
import { 
  ModelTrainer, 
  ModelTrainingConfig, 
  TrainingResult as NewTrainingResult,
  createNeuralNetworkConfig,
  createDefaultCallbacks
} from './training'
import { IDataset } from '../data/types'

// 기존 LayerConfig와의 호환성을 위한 re-export
export type { LayerConfig } from './layers'

/**
 * 신경망 모델 설정 인터페이스
 */
export interface NNModelConfig {
  inputShape: number[]
  outputUnits: number
  layers: LayerConfig[]
  name?: string
}

/**
 * 신경망 학습 설정 인터페이스
 * @deprecated 새로운 training 모듈의 ModelTrainingConfig 사용 권장
 */
export interface NNTrainingConfig {
  optimizer: 'adam' | 'sgd' | 'rmsprop'
  learningRate: number
  loss: 'mse' | 'binaryCrossentropy' | 'categoricalCrossentropy'
  metrics?: string[]
  epochs: number
  batchSize: number
  validationSplit?: number
}

/**
 * 학습 결과 인터페이스
 * @deprecated 새로운 training 모듈의 TrainingResult 사용 권장
 */
export interface TrainingResult {
  history: {
    loss: number[]
    accuracy?: number[]
    valLoss?: number[]
    valAccuracy?: number[]
  }
  finalLoss: number
  finalAccuracy?: number
  epochs: number
}

/**
 * 기존 NNTrainingConfig를 새로운 ModelTrainingConfig로 변환
 */
function convertToModelTrainingConfig(config: NNTrainingConfig): ModelTrainingConfig {
  return createNeuralNetworkConfig({
    optimizer: config.optimizer,
    learningRate: config.learningRate,
    loss: config.loss,
    metrics: config.metrics,
    epochs: config.epochs,
    batchSize: config.batchSize,
    validationSplit: config.validationSplit
  })
}

/**
 * 새로운 TrainingResult를 기존 형식으로 변환 (하위 호환성)
 */
function convertToLegacyTrainingResult(result: NewTrainingResult): TrainingResult {
  return {
    history: {
      loss: result.history.loss || [],
      accuracy: result.history.accuracy,
      valLoss: result.history.valLoss,
      valAccuracy: result.history.valAccuracy
    },
    finalLoss: result.finalMetrics.loss || 0,
    finalAccuracy: result.finalMetrics.accuracy,
    epochs: result.epochs
  }
}

/**
 * 신경망 모델 정의 클래스
 * 모델 구조만 정의하고, 실제 tf.Sequential 인스턴스는 학습 시점에 생성
 */
export class NNModel {
  readonly id: string
  readonly modelType = 'neural-network'
  readonly displayName = '신경망 모델'
  readonly createdAt: Date

  public inputShapes: number[] | 'auto'
  public layers: LayerConfig[]
  public outputUnits: number
  public name?: string
  
  // 새로운 훈련 시스템
  private trainer: ModelTrainer

  constructor(config: NNModelConfig, id?: string) {
    this.id = id || `nn_model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.createdAt = new Date()
    this.inputShapes = config.inputShape
    this.layers = config.layers
    this.outputUnits = config.outputUnits
    this.name = config.name
    
    // 새로운 훈련 시스템 초기화
    this.trainer = new ModelTrainer()
  }

  /**
   * TensorFlow.js 모델 생성
   * 매번 새로운 인스턴스를 생성하여 반환
   */
  createTFModel(): tf.Sequential {
    const model = tf.sequential({
      name: this.name || `nn_model_${this.id}`,
    })

    // 레이어 설정 검증
    for (const layerConfig of this.layers) {
      if (!validateLayerConfig(layerConfig)) {
        throw new Error(`Invalid layer configuration: ${JSON.stringify(layerConfig)}`)
      }
    }

    // 첫 번째 레이어 (입력 형태 지정)
    if (this.layers.length > 0) {
      const firstLayer = this.layers[0]
      
      if (firstLayer.type === 'dense') {
        // Dense 레이어는 inputShape 설정 필요
        model.add(
          tf.layers.dense({
            inputShape: this.inputShapes as number[],
            units: (firstLayer as any).units || 32,
            activation: (firstLayer as any).activation || 'relu',
          })
        )
      } else {
        // Dense가 아닌 첫 번째 레이어의 경우 inputShape를 별도로 추가
        model.add(tf.layers.inputLayer({ inputShape: this.inputShapes as number[] }))
        model.add(createLayer(firstLayer))
      }

      // 나머지 레이어들 추가
      for (let i = 1; i < this.layers.length; i++) {
        const layer = createLayer(this.layers[i])
        model.add(layer)
      }
    }

    // 출력 레이어 추가
    model.add(
      tf.layers.dense({
        units: this.outputUnits,
        activation: this.outputUnits === 1 ? 'sigmoid' : 'softmax',
      })
    )

    console.log(`🧠 Neural Network model created: ${this.id} with ${this.layers.length} hidden layers`)
    return model
  }

  /**
   * 모델 학습 실행 (개선된 버전)
   * 외부에서 생성된 모델과 데이터셋을 받아 학습 수행
   * 
   * 새로운 training 모듈을 사용하여 개선된 훈련 기능 제공:
   * - 조기 종료 (Early Stopping)
   * - 과적합 감지 (Overfitting Detection)
   * - 향상된 메트릭 수집 및 분석
   * - 더 나은 진행 상황 추적
   */
  async train(
    model: tf.Sequential,
    dataset: IDataset,
    trainingConfig: ModelTrainingConfig,
    onProgress?: (epoch: number, logs: any) => void
  ): Promise<{ model: tf.Sequential; result: NewTrainingResult }> {
    console.log(`🏃 Starting training with modern system: ${this.id}`)

    // 콜백 설정
    const callbacks = createDefaultCallbacks(onProgress)

    try {
      // 훈련 데이터 추출 (훈련용 데이터가 있으면 사용, 없으면 전체 데이터 사용)
      const trainX = dataset.trainInputs || dataset.inputs
      const trainY = dataset.trainLabels || dataset.labels

      console.log(`📊 Training data shape: inputs ${trainX.shape}, labels ${trainY.shape}`)
      
      // 새로운 훈련 시스템으로 학습 실행
      const result = await this.trainer.train(
        model,
        trainX,
        trainY,
        trainingConfig,
        callbacks
      )

      console.log(`✅ Training completed: ${this.id}`)
      console.log(`📊 Final metrics:`, result.finalMetrics)
      
      // 과적합 경고 표시
      if (result.stoppedReason === 'early_stopping') {
        console.log(`⏹️ Training stopped early at epoch ${result.epochs} (best: ${result.bestEpoch! + 1})`)
      }

      return { model, result }
      
    } catch (error) {
      console.error(`❌ Training failed for ${this.id}:`, error)
      throw error
    }
  }

  /**
   * 레거시 train 메서드 (하위 호환성)
   * @deprecated 새로운 train(model, dataset, config) 메서드 사용 권장
   */
  async trainLegacy(
    trainX: tf.Tensor,
    trainY: tf.Tensor,
    trainingConfig: NNTrainingConfig,
    onProgress?: (epoch: number, logs: any) => void
  ): Promise<{ model: tf.Sequential; result: TrainingResult }> {
    console.log(`🏃 Starting legacy training: ${this.id}`)

    // 새로운 모델 인스턴스 생성
    const model = this.createTFModel()

    // 기존 설정을 새로운 형식으로 변환
    const modernConfig = convertToModelTrainingConfig(trainingConfig)
    
    // 콜백 설정 (기존 onProgress와 호환)
    const callbacks = createDefaultCallbacks(onProgress)

    try {
      // 새로운 훈련 시스템으로 학습 실행
      const newResult = await this.trainer.train(
        model,
        trainX,
        trainY,
        modernConfig,
        callbacks
      )

      // 기존 형식으로 결과 변환 (하위 호환성)
      const legacyResult = convertToLegacyTrainingResult(newResult)

      console.log(`✅ Training completed with new system: ${this.id}`)
      console.log(`📊 Final metrics:`, newResult.finalMetrics)
      
      // 과적합 경고 표시
      if (newResult.stoppedReason === 'early_stopping') {
        console.log(`⏹️ Training stopped early at epoch ${newResult.epochs} (best: ${newResult.bestEpoch! + 1})`)
      }

      return { model, result: legacyResult }
      
    } catch (error) {
      console.error(`❌ Training failed for ${this.id}:`, error)
      throw error
    }
  }

  /**
   * 편의 메서드: 모델 생성과 함께 훈련 실행
   * 노드에서 간편하게 사용할 수 있는 원스톱 메서드
   */
  async createAndTrain(
    dataset: IDataset,
    trainingConfig: ModelTrainingConfig,
    onProgress?: (epoch: number, logs: any) => void
  ): Promise<{ model: tf.Sequential; result: NewTrainingResult }> {
    console.log(`🚀 Creating model and starting training: ${this.id}`)

    // 모델 생성
    const model = this.createTFModel()
    
    // 훈련 실행
    const result = await this.train(model, dataset, trainingConfig, onProgress)
    
    return result
  }

  /**
   * 새로운 훈련 시스템을 직접 사용하는 메서드 (레거시)
   * @deprecated createAndTrain 또는 train 메서드 사용 권장
   */
  async trainWithModernConfig(
    trainX: tf.Tensor,
    trainY: tf.Tensor,
    config: ModelTrainingConfig,
    callbacks?: any
  ): Promise<{ model: tf.Sequential; result: NewTrainingResult }> {
    console.log(`🚀 Starting modern training (legacy): ${this.id}`)

    const model = this.createTFModel()
    const result = await this.trainer.train(model, trainX, trainY, config, callbacks)

    return { model, result }
  }

  /**
   * 모델 평가
   * 새로운 training 모듈의 evaluate 기능 사용
   */
  async evaluate(
    model: tf.Sequential,
    testX: tf.Tensor,
    testY: tf.Tensor
  ): Promise<Record<string, number>> {
    console.log(`📊 Evaluating model: ${this.id}`)
    return this.trainer.evaluate(model, testX, testY)
  }

  /**
   * 모델 예측
   * 새로운 training 모듈의 predict 기능 사용
   */
  predict(
    model: tf.Sequential,
    inputData: tf.Tensor
  ): tf.Tensor | tf.Tensor[] {
    console.log(`🔮 Making prediction: ${this.id}`)
    return this.trainer.predict(model, inputData)
  }

  /**
   * 모델 메모리 사용량 추정
   */
  getMemoryUsage(): number {
    // 레이어별 파라미터 수 계산
    let totalParams = 0
    
    // 입력 레이어 파라미터
    if (this.layers.length > 0 && this.layers[0].type === 'dense') {
      const firstLayer = this.layers[0] as any
      const inputSize = Array.isArray(this.inputShapes) ? this.inputShapes.reduce((a, b) => a * b, 1) : 1
      totalParams += inputSize * (firstLayer.units || 32) + (firstLayer.units || 32) // weights + bias
    }
    
    // 히든 레이어들
    for (let i = 0; i < this.layers.length - 1; i++) {
      const currentLayer = this.layers[i] as any
      const nextLayer = this.layers[i + 1] as any
      
      if (currentLayer.type === 'dense' && nextLayer.type === 'dense') {
        const currentUnits = currentLayer.units || 32
        const nextUnits = nextLayer.units || 32
        totalParams += currentUnits * nextUnits + nextUnits
      }
    }
    
    // 출력 레이어
    if (this.layers.length > 0) {
      const lastLayer = this.layers[this.layers.length - 1] as any
      const lastUnits = lastLayer.units || 32
      totalParams += lastUnits * this.outputUnits + this.outputUnits
    }
    
    // 4바이트(float32) * 파라미터 수
    return totalParams * 4
  }

  /**
   * 모델 설정 반환
   */
  getConfig(): NNModelConfig {
    return {
      inputShape: this.inputShapes as number[],
      outputUnits: this.outputUnits,
      layers: [...this.layers],
      name: this.name,
    }
  }

  /**
   * 모델 정의 직렬화
   */
  serialize(): any {
    return {
      id: this.id,
      modelType: this.modelType,
      displayName: this.displayName,
      createdAt: this.createdAt.toISOString(),
      inputShapes: this.inputShapes,
      layers: this.layers,
      outputUnits: this.outputUnits,
      name: this.name,
    }
  }
}

/**
 * 신경망 모델 팩토리 함수
 */
export const createNNModel = (config?: Partial<NNModelConfig>): NNModel => {
  const defaultConfig: NNModelConfig = {
    inputShape: [10],
    outputUnits: 1,
    layers: [
      { type: 'dense', units: 64, activation: 'relu' },
      { type: 'dense', units: 32, activation: 'relu' },
    ],
    ...config,
  }

  return new NNModel(defaultConfig)
}

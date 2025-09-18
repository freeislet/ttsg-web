import * as tf from '@tensorflow/tfjs'
import { ModelBase, ModelFactory } from '../ModelBase'

/**
 * 레이어 설정 인터페이스
 */
export interface LayerConfig {
  type: 'dense' | 'dropout' | 'batchNormalization'
  units?: number
  activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear'
  rate?: number // dropout rate
}

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
 * 신경망 모델 클래스
 * 기본적인 Dense 레이어 기반 신경망을 구현
 */
export class NNModel extends ModelBase {
  readonly modelType = 'neural-network'
  readonly displayName = '신경망 모델'
  
  private config: NNModelConfig
  private trainingConfig?: NNTrainingConfig
  private trainingResult?: TrainingResult
  
  constructor(config: NNModelConfig, id?: string) {
    super(id)
    this.config = config
  }
  
  /**
   * 모델 생성
   */
  async createModel(): Promise<tf.Sequential> {
    const model = tf.sequential({
      name: this.config.name || `nn_model_${this.id}`
    })
    
    // 첫 번째 레이어 (입력 형태 지정)
    const firstLayer = this.config.layers[0]
    if (firstLayer && firstLayer.type === 'dense') {
      model.add(tf.layers.dense({
        inputShape: this.config.inputShape,
        units: firstLayer.units || 32,
        activation: firstLayer.activation || 'relu'
      }))
    }
    
    // 나머지 레이어들 추가
    for (let i = 1; i < this.config.layers.length; i++) {
      const layerConfig = this.config.layers[i]
      
      switch (layerConfig.type) {
        case 'dense':
          model.add(tf.layers.dense({
            units: layerConfig.units || 32,
            activation: layerConfig.activation || 'relu'
          }))
          break
          
        case 'dropout':
          model.add(tf.layers.dropout({
            rate: layerConfig.rate || 0.2
          }))
          break
          
        case 'batchNormalization':
          model.add(tf.layers.batchNormalization())
          break
      }
    }
    
    // 출력 레이어 추가
    model.add(tf.layers.dense({
      units: this.config.outputUnits,
      activation: this.config.outputUnits === 1 ? 'sigmoid' : 'softmax'
    }))
    
    this.model = model
    console.log(`🧠 Neural Network model created: ${this.id}`)
    return model
  }
  
  /**
   * 모델 컴파일
   */
  async compile(config: NNTrainingConfig): Promise<void> {
    if (!this.model) {
      throw new Error('Model must be created before compilation')
    }
    
    this.trainingConfig = config
    
    // 옵티마이저 설정
    let optimizer: tf.Optimizer
    switch (config.optimizer) {
      case 'adam':
        optimizer = tf.train.adam(config.learningRate)
        break
      case 'sgd':
        optimizer = tf.train.sgd(config.learningRate)
        break
      case 'rmsprop':
        optimizer = tf.train.rmsprop(config.learningRate)
        break
      default:
        optimizer = tf.train.adam(config.learningRate)
    }
    
    // 모델 컴파일
    this.model.compile({
      optimizer,
      loss: config.loss,
      metrics: config.metrics || ['accuracy']
    })
    
    this._isCompiled = true
    console.log(`⚙️ Model compiled: ${this.id}`)
  }
  
  /**
   * 모델 학습
   */
  async train(
    trainX: tf.Tensor, 
    trainY: tf.Tensor, 
    config?: Partial<NNTrainingConfig>
  ): Promise<TrainingResult> {
    if (!this.model || !this._isCompiled) {
      throw new Error('Model must be created and compiled before training')
    }
    
    const finalConfig = { ...this.trainingConfig, ...config } as NNTrainingConfig
    
    console.log(`🏃 Starting training: ${this.id}`)
    
    const history = await this.model.fit(trainX, trainY, {
      epochs: finalConfig.epochs,
      batchSize: finalConfig.batchSize,
      validationSplit: finalConfig.validationSplit || 0.2,
      verbose: 1,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}/${finalConfig.epochs} - loss: ${logs?.loss?.toFixed(4)} - accuracy: ${logs?.accuracy?.toFixed(4)}`)
        }
      }
    })
    
    // 학습 결과 저장
    this.trainingResult = {
      history: {
        loss: history.history.loss as number[],
        accuracy: history.history.accuracy as number[],
        valLoss: history.history.val_loss as number[],
        valAccuracy: history.history.val_accuracy as number[]
      },
      finalLoss: (history.history.loss as number[]).slice(-1)[0],
      finalAccuracy: (history.history.accuracy as number[])?.slice(-1)[0],
      epochs: finalConfig.epochs
    }
    
    this._isTrained = true
    console.log(`✅ Training completed: ${this.id}`)
    
    return this.trainingResult
  }
  
  /**
   * 예측 수행
   */
  async predict(input: tf.Tensor): Promise<tf.Tensor> {
    if (!this.model || !this._isTrained) {
      throw new Error('Model must be trained before prediction')
    }
    
    return this.model.predict(input) as tf.Tensor
  }
  
  /**
   * 모델 설정 반환
   */
  getConfig(): NNModelConfig {
    return { ...this.config }
  }
  
  /**
   * 학습 설정 반환
   */
  getTrainingConfig(): NNTrainingConfig | undefined {
    return this.trainingConfig ? { ...this.trainingConfig } : undefined
  }
  
  /**
   * 학습 결과 반환
   */
  getTrainingResult(): TrainingResult | undefined {
    return this.trainingResult ? { ...this.trainingResult } : undefined
  }
  
  /**
   * 모델 직렬화 (확장)
   */
  serialize(): any {
    return {
      ...super.serialize(),
      config: this.config,
      trainingConfig: this.trainingConfig,
      trainingResult: this.trainingResult
    }
  }
}

/**
 * 신경망 모델 팩토리
 */
export const NNModelFactory: ModelFactory<NNModel> = {
  modelType: 'neural-network',
  displayName: '신경망 모델',
  
  create(config?: Partial<NNModelConfig>): NNModel {
    const defaultConfig: NNModelConfig = {
      inputShape: [10],
      outputUnits: 1,
      layers: [
        { type: 'dense', units: 64, activation: 'relu' },
        { type: 'dense', units: 32, activation: 'relu' }
      ],
      ...config
    }
    
    return new NNModel(defaultConfig)
  }
}

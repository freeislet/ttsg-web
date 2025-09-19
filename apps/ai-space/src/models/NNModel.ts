import * as tf from '@tensorflow/tfjs'
import { LayerConfig, createLayer, validateLayerConfig } from './layers'

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

  constructor(config: NNModelConfig, id?: string) {
    this.id = id || `nn_model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.createdAt = new Date()
    this.inputShapes = config.inputShape
    this.layers = config.layers
    this.outputUnits = config.outputUnits
    this.name = config.name
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
   * 모델 학습 실행
   * 새로운 tf.Sequential 인스턴스를 생성하고 학습하여 반환
   */
  async train(
    trainX: tf.Tensor,
    trainY: tf.Tensor,
    trainingConfig: NNTrainingConfig,
    onProgress?: (epoch: number, logs: any) => void
  ): Promise<{ model: tf.Sequential; result: TrainingResult }> {
    console.log(`🏃 Starting training: ${this.id}`)

    // 새로운 모델 인스턴스 생성
    const model = this.createTFModel()

    // 옵티마이저 설정
    let optimizer: tf.Optimizer
    switch (trainingConfig.optimizer) {
      case 'adam':
        optimizer = tf.train.adam(trainingConfig.learningRate)
        break
      case 'sgd':
        optimizer = tf.train.sgd(trainingConfig.learningRate)
        break
      case 'rmsprop':
        optimizer = tf.train.rmsprop(trainingConfig.learningRate)
        break
      default:
        optimizer = tf.train.adam(trainingConfig.learningRate)
    }

    // 모델 컴파일
    model.compile({
      optimizer,
      loss: trainingConfig.loss,
      metrics: trainingConfig.metrics || ['accuracy'],
    })

    // 학습 실행
    const history = await model.fit(trainX, trainY, {
      epochs: trainingConfig.epochs,
      batchSize: trainingConfig.batchSize,
      validationSplit: trainingConfig.validationSplit || 0.2,
      verbose: 1,
      callbacks: {
        onEpochEnd: (epoch: number, logs: any) => {
          console.log(
            `Epoch ${epoch + 1}/${trainingConfig.epochs} - loss: ${logs?.loss?.toFixed(4)} - accuracy: ${logs?.accuracy?.toFixed(4)}`
          )
          onProgress?.(epoch, logs)
        },
      },
    })

    // 학습 결과 생성
    const result: TrainingResult = {
      history: {
        loss: history.history.loss as number[],
        accuracy: history.history.accuracy as number[],
        valLoss: history.history.val_loss as number[],
        valAccuracy: history.history.val_accuracy as number[],
      },
      finalLoss: (history.history.loss as number[]).slice(-1)[0],
      finalAccuracy: (history.history.accuracy as number[])?.slice(-1)[0],
      epochs: trainingConfig.epochs,
    }

    console.log(`✅ Training completed: ${this.id}`)

    return { model, result }
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

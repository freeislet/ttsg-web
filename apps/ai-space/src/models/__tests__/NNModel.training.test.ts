import * as tf from '@tensorflow/tfjs'
import { NNModel, NNTrainingConfig } from '../NNModel'
import { createNeuralNetworkConfig } from '../training'

// TensorFlow.js 모킹
jest.mock('@tensorflow/tfjs', () => ({
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn(() => Promise.resolve({
      history: {
        loss: [0.5, 0.3, 0.2],
        accuracy: [0.7, 0.8, 0.9],
        val_loss: [0.6, 0.4, 0.3],
        val_accuracy: [0.6, 0.7, 0.8]
      },
      epoch: [0, 1, 2]
    })),
    evaluate: jest.fn(() => [
      { dataSync: () => [0.2] },
      { dataSync: () => [0.9] }
    ]),
    predict: jest.fn(() => ({ dataSync: () => [0.8] }))
  })),
  layers: {
    dense: jest.fn(),
    inputLayer: jest.fn()
  },
  train: {
    adam: jest.fn(),
    sgd: jest.fn(),
    rmsprop: jest.fn()
  },
  tensor2d: jest.fn(() => ({
    dispose: jest.fn()
  }))
}))

describe('NNModel Training Migration', () => {
  let model: NNModel
  let mockTrainX: tf.Tensor
  let mockTrainY: tf.Tensor

  beforeEach(() => {
    model = new NNModel({
      inputShape: [4],
      outputUnits: 1,
      layers: [
        { type: 'dense', units: 8, activation: 'relu' },
        { type: 'dense', units: 4, activation: 'relu' }
      ],
      name: 'test-model'
    })

    mockTrainX = tf.tensor2d([[1, 2, 3, 4], [5, 6, 7, 8]])
    mockTrainY = tf.tensor2d([[0], [1]])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('기존 train 메서드 (하위 호환성)', () => {
    it('기존 NNTrainingConfig로 훈련이 가능해야 함', async () => {
      const config: NNTrainingConfig = {
        optimizer: 'adam',
        learningRate: 0.001,
        loss: 'mse',
        epochs: 3,
        batchSize: 32,
        validationSplit: 0.2
      }

      const result = await model.train(mockTrainX, mockTrainY, config)

      expect(result.model).toBeDefined()
      expect(result.result).toBeDefined()
      expect(result.result.history.loss).toEqual([0.5, 0.3, 0.2])
      expect(result.result.finalLoss).toBe(0.2)
      expect(result.result.epochs).toBe(3)
    })

    it('onProgress 콜백이 호출되어야 함', async () => {
      const onProgress = jest.fn()
      const config: NNTrainingConfig = {
        optimizer: 'adam',
        learningRate: 0.001,
        loss: 'mse',
        epochs: 3,
        batchSize: 32
      }

      await model.train(mockTrainX, mockTrainY, config, onProgress)

      // onProgress가 호출되었는지 확인 (실제로는 ModelTrainer에서 호출됨)
      expect(onProgress).toHaveBeenCalled()
    })
  })

  describe('새로운 trainWithModernConfig 메서드', () => {
    it('새로운 ModelTrainingConfig로 훈련이 가능해야 함', async () => {
      const config = createNeuralNetworkConfig({
        optimizer: 'adam',
        learningRate: 0.001,
        loss: 'mse',
        epochs: 3,
        batchSize: 32,
        earlyStoppingPatience: 5
      })

      const result = await model.trainWithModernConfig(mockTrainX, mockTrainY, config)

      expect(result.model).toBeDefined()
      expect(result.result).toBeDefined()
      expect(result.result.history.loss).toBeDefined()
      expect(result.result.finalMetrics).toBeDefined()
    })
  })

  describe('유틸리티 메서드들', () => {
    it('evaluate 메서드가 작동해야 함', async () => {
      const mockModel = model.createTFModel() as any
      const testX = tf.tensor2d([[1, 2, 3, 4]])
      const testY = tf.tensor2d([[1]])

      const metrics = await model.evaluate(mockModel, testX, testY)

      expect(metrics).toBeDefined()
      expect(typeof metrics.loss).toBe('number')
    })

    it('predict 메서드가 작동해야 함', () => {
      const mockModel = model.createTFModel() as any
      const inputData = tf.tensor2d([[1, 2, 3, 4]])

      const prediction = model.predict(mockModel, inputData)

      expect(prediction).toBeDefined()
    })

    it('getMemoryUsage가 메모리 사용량을 반환해야 함', () => {
      const memoryUsage = model.getMemoryUsage()

      expect(typeof memoryUsage).toBe('number')
      expect(memoryUsage).toBeGreaterThan(0)
    })
  })

  describe('설정 변환', () => {
    it('기존 NNTrainingConfig가 새로운 형식으로 변환되어야 함', async () => {
      const legacyConfig: NNTrainingConfig = {
        optimizer: 'sgd',
        learningRate: 0.01,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
        epochs: 10,
        batchSize: 16,
        validationSplit: 0.3
      }

      // 내부적으로 변환이 일어나는지 확인
      const result = await model.train(mockTrainX, mockTrainY, legacyConfig)
      
      expect(result).toBeDefined()
      expect(result.result.epochs).toBe(10)
    })
  })
})

describe('NNModel 생성 및 기본 기능', () => {
  it('ModelTrainer가 초기화되어야 함', () => {
    const model = new NNModel({
      inputShape: [2],
      outputUnits: 1,
      layers: [{ type: 'dense', units: 4, activation: 'relu' }]
    })

    expect(model).toBeDefined()
    expect(model.modelType).toBe('neural-network')
    expect(model.displayName).toBe('신경망 모델')
  })

  it('TensorFlow.js 모델을 생성할 수 있어야 함', () => {
    const model = new NNModel({
      inputShape: [3],
      outputUnits: 2,
      layers: [
        { type: 'dense', units: 6, activation: 'relu' },
        { type: 'dense', units: 4, activation: 'tanh' }
      ]
    })

    const tfModel = model.createTFModel()
    expect(tfModel).toBeDefined()
  })
})

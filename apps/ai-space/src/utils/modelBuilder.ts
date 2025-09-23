import * as tf from '@tensorflow/tfjs'
import { createNNModel } from '@/models'
import { LayerNodeData } from '@/types/LayerEditor'
import { 
  convertLayerEditorDataToModelConfig,
  inferLossFunction,
  inferMetrics
} from './layerConfigConverter'

/**
 * 레이어 에디터 데이터로부터 TensorFlow.js 모델 생성
 */
export async function createModelFromLayerEditor(
  layerNodes: LayerNodeData[],
  inputShape: number[],
  outputUnits: number,
  datasetType?: string
): Promise<tf.Sequential> {
  try {
    // 레이어 에디터 데이터를 모델 설정으로 변환
    const modelConfig = convertLayerEditorDataToModelConfig(
      layerNodes,
      inputShape,
      outputUnits
    )

    console.log('🔧 Creating model with config:', modelConfig)

    // NNModel 인스턴스 생성
    const nnModel = createNNModel(modelConfig)
    
    // TensorFlow.js 모델 생성
    const model = nnModel.createTFModel()
    
    console.log('✅ Model created successfully')
    console.log('📊 Model summary:')
    model.summary()
    
    return model
  } catch (error) {
    console.error('❌ Error creating model:', error)
    throw error
  }
}

/**
 * 모델 컴파일 (학습 준비)
 */
export function compileModel(
  model: tf.Sequential,
  outputUnits: number,
  datasetType?: string,
  customConfig?: {
    optimizer?: string
    learningRate?: number
    loss?: string
    metrics?: string[]
  }
): tf.Sequential {
  try {
    const config = {
      optimizer: customConfig?.optimizer || 'adam',
      learningRate: customConfig?.learningRate || 0.001,
      loss: customConfig?.loss || inferLossFunction(outputUnits, datasetType),
      metrics: customConfig?.metrics || inferMetrics(outputUnits, datasetType)
    }

    console.log('🔧 Compiling model with config:', config)

    // 옵티마이저 생성
    let optimizer: tf.Optimizer
    switch (config.optimizer) {
      case 'sgd':
        optimizer = tf.train.sgd(config.learningRate)
        break
      case 'rmsprop':
        optimizer = tf.train.rmsprop(config.learningRate)
        break
      case 'adam':
      default:
        optimizer = tf.train.adam(config.learningRate)
        break
    }

    // 모델 컴파일
    model.compile({
      optimizer,
      loss: config.loss,
      metrics: config.metrics
    })

    console.log('✅ Model compiled successfully')
    return model
  } catch (error) {
    console.error('❌ Error compiling model:', error)
    throw error
  }
}

/**
 * 모델 학습
 */
export async function trainModel(
  model: tf.Sequential,
  trainData: tf.Tensor,
  trainLabels: tf.Tensor,
  config?: {
    epochs?: number
    batchSize?: number
    validationSplit?: number
    callbacks?: tf.CustomCallback[]
  }
): Promise<tf.History> {
  try {
    const trainingConfig = {
      epochs: config?.epochs || 10,
      batchSize: config?.batchSize || 32,
      validationSplit: config?.validationSplit || 0.2,
      callbacks: config?.callbacks || []
    }

    console.log('🚀 Starting model training with config:', trainingConfig)

    const history = await model.fit(trainData, trainLabels, {
      epochs: trainingConfig.epochs,
      batchSize: trainingConfig.batchSize,
      validationSplit: trainingConfig.validationSplit,
      callbacks: trainingConfig.callbacks,
      verbose: 1
    })

    console.log('✅ Model training completed')
    return history
  } catch (error) {
    console.error('❌ Error training model:', error)
    throw error
  }
}

/**
 * 모델 예측
 */
export function predictWithModel(
  model: tf.Sequential,
  inputData: tf.Tensor
): tf.Tensor {
  try {
    console.log('🔮 Making predictions...')
    const predictions = model.predict(inputData) as tf.Tensor
    console.log('✅ Predictions completed')
    return predictions
  } catch (error) {
    console.error('❌ Error making predictions:', error)
    throw error
  }
}

/**
 * 모델 평가
 */
export async function evaluateModel(
  model: tf.Sequential,
  testData: tf.Tensor,
  testLabels: tf.Tensor
): Promise<tf.Scalar[]> {
  try {
    console.log('📊 Evaluating model...')
    const evaluation = await model.evaluate(testData, testLabels) as tf.Scalar[]
    console.log('✅ Model evaluation completed')
    return evaluation
  } catch (error) {
    console.error('❌ Error evaluating model:', error)
    throw error
  }
}

/**
 * 완전한 모델 파이프라인 실행
 */
export async function executeModelPipeline(
  layerNodes: LayerNodeData[],
  inputShape: number[],
  outputUnits: number,
  trainData: tf.Tensor,
  trainLabels: tf.Tensor,
  options?: {
    datasetType?: string
    compileConfig?: {
      optimizer?: string
      learningRate?: number
      loss?: string
      metrics?: string[]
    }
    trainingConfig?: {
      epochs?: number
      batchSize?: number
      validationSplit?: number
    }
    testData?: tf.Tensor
    testLabels?: tf.Tensor
  }
): Promise<{
  model: tf.Sequential
  history: tf.History
  evaluation?: tf.Scalar[]
}> {
  try {
    console.log('🚀 Starting complete model pipeline...')

    // 1. 모델 생성
    const model = await createModelFromLayerEditor(
      layerNodes,
      inputShape,
      outputUnits,
      options?.datasetType
    )

    // 2. 모델 컴파일
    compileModel(model, outputUnits, options?.datasetType, options?.compileConfig)

    // 3. 모델 학습
    const history = await trainModel(model, trainData, trainLabels, options?.trainingConfig)

    // 4. 모델 평가 (테스트 데이터가 있는 경우)
    let evaluation: tf.Scalar[] | undefined
    if (options?.testData && options?.testLabels) {
      evaluation = await evaluateModel(model, options.testData, options.testLabels)
    }

    console.log('🎉 Model pipeline completed successfully!')

    return {
      model,
      history,
      evaluation
    }
  } catch (error) {
    console.error('❌ Error in model pipeline:', error)
    throw error
  }
}

/**
 * 모델 메모리 정리
 */
export function disposeModel(model: tf.Sequential): void {
  try {
    model.dispose()
    console.log('🗑️ Model disposed successfully')
  } catch (error) {
    console.error('❌ Error disposing model:', error)
  }
}

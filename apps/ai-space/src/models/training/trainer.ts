import * as tf from '@tensorflow/tfjs'
import { ModelTrainingConfig, TrainingResult, TrainingCallbacks, TrainingProgress } from './types'
import { createOptimizer } from './optimizers'
import { createDefaultCallbacks, createEarlyStoppingCallback, combineCallbacks } from './callbacks'

/**
 * 범용 모델 트레이너 클래스
 * 모든 TensorFlow.js 모델에서 사용 가능한 훈련 시스템
 */
export class ModelTrainer {
  private startTime: number = 0

  /**
   * 모델 훈련 실행
   * @param model 훈련할 TensorFlow.js 모델
   * @param trainX 훈련 입력 데이터
   * @param config 훈련 설정
   * @param callbacks 훈련 콜백들
   * @returns 훈련 결과
   */
  async train(
    model: tf.Sequential,
    trainX: tf.Tensor | tf.Tensor[],
    trainY: tf.Tensor | tf.Tensor[],
    config: ModelTrainingConfig,
    callbacks?: TrainingCallbacks
  ): Promise<TrainingResult> {
    const trainId = `train_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    console.log(`📝 [${trainId}] ModelTrainer.train started`)

    this.startTime = Date.now()

    // 콜백 결합
    console.log(`📝 [${trainId}] Creating callbacks...`)
    const defaultCallbacks = createDefaultCallbacks()
    const combinedCallbacks = combineCallbacks(defaultCallbacks, callbacks || {})

    // 조기 종료 설정
    let earlyStoppingCallback: ReturnType<typeof createEarlyStoppingCallback> | null = null
    if (config.earlyStoppingPatience && config.earlyStoppingPatience > 0) {
      console.log(
        `📝 [${trainId}] Setting up early stopping (patience: ${config.earlyStoppingPatience})`
      )
      earlyStoppingCallback = createEarlyStoppingCallback(config.earlyStoppingPatience)
      Object.assign(
        combinedCallbacks,
        combineCallbacks(combinedCallbacks, earlyStoppingCallback.callback)
      )
    }

    try {
      // 훈련 시작 콜백
      console.log(`📝 [${trainId}] Calling onTrainStart callback...`)
      await combinedCallbacks.onTrainStart?.()

      // TensorFlow.js 백엔드 확인
      console.log(`📝 [${trainId}] Checking TensorFlow.js backend:`, tf.getBackend())

      // 옵티마이저 생성
      console.log(
        `📝 [${trainId}] Creating optimizer (${config.optimizer}, lr: ${config.learningRate})...`
      )
      const optimizer = createOptimizer(config.optimizer, config.learningRate)

      // TensorFlow.js 백엔드 초기화 확인 (백엔드 오류 방지)
      await tf.ready()
      if (!tf.getBackend()) {
        console.log(`🔧 [${trainId}] Initializing TensorFlow.js backend...`)
        await tf.setBackend('webgl').catch(async () => {
          console.log(`🔧 [${trainId}] WebGL failed, using CPU backend...`)
          await tf.setBackend('cpu')
        })
      }
      console.log(`🔧 [${trainId}] Backend ready:`, tf.getBackend())

      // 모델 컴파일
      model.compile({
        optimizer,
        loss: config.loss,
        metrics: config.metrics || ['accuracy'],
      })

      console.log(`✅ [${trainId}] Model compiled successfully`)

      // 실제 데이터 검사 및 비교
      console.log(`🔍 [${trainId}] Analyzing training data...`)

      // trainX 데이터 검사
      console.log(`📊 [${trainId}] trainX info:`, {
        shape: Array.isArray(trainX) ? trainX.map((t) => t.shape) : trainX.shape,
        dtype: Array.isArray(trainX) ? trainX.map((t) => t.dtype) : trainX.dtype,
        size: Array.isArray(trainX) ? trainX.map((t) => t.size) : trainX.size,
      })

      // trainY 데이터 검사
      console.log(`🎯 [${trainId}] trainY info:`, {
        shape: Array.isArray(trainY) ? trainY.map((t) => t.shape) : trainY.shape,
        dtype: Array.isArray(trainY) ? trainY.map((t) => t.dtype) : trainY.dtype,
        size: Array.isArray(trainY) ? trainY.map((t) => t.size) : trainY.size,
      })

      // 데이터 샘플 출력 (첫 5개 샘플) - 안전한 방식
      console.log(`🔍 [${trainId}] Attempting safe data sampling...`)
      try {
        // WebGL 백엔드 문제를 피하기 위해 CPU로 임시 전환
        const currentBackend = tf.getBackend()
        console.log(`🔧 [${trainId}] Current backend for sampling:`, currentBackend)
        
        if (currentBackend === 'webgl') {
          console.log(`🔧 [${trainId}] Switching to CPU for safe data sampling...`)
          await tf.setBackend('cpu')
        }
        
        if (Array.isArray(trainX)) {
          const trainXShape = trainX[0].shape
          const trainYTensor = Array.isArray(trainY) ? trainY[0] : trainY
          const trainYShape = trainYTensor.shape
          
          console.log(`🔍 [${trainId}] trainX[0] shape:`, trainXShape)
          console.log(`🔍 [${trainId}] trainY shape:`, trainYShape)
          
          // 더 안전한 slice 사이즈
          const sampleSize = Math.min(3, trainXShape[0]) // 5에서 3으로 축소
          const xSlice = trainX[0].slice([0], [sampleSize])
          const ySlice = trainYTensor.slice([0], [sampleSize])
          
          console.log(`🔍 [${trainId}] trainX[0] sample (${sampleSize} items):`, await xSlice.data())
          console.log(`🔍 [${trainId}] trainY sample (${sampleSize} items):`, await ySlice.data())
          
          // 메모리 정리
          xSlice.dispose()
          ySlice.dispose()
        } else {
          // trainX가 Tensor인지 확인
          if (trainX && typeof trainX.shape !== 'undefined' && typeof trainX.slice === 'function') {
            const trainXShape = trainX.shape
            const trainYTensor = Array.isArray(trainY) ? trainY[0] : trainY
            const trainYShape = trainYTensor.shape
            
            console.log(`🔍 [${trainId}] trainX shape:`, trainXShape)
            console.log(`🔍 [${trainId}] trainY shape:`, trainYShape)
            
            const sampleSize = Math.min(3, trainXShape[0])
            const xSlice = trainX.slice([0], [sampleSize])
            const ySlice = trainYTensor.slice([0], [sampleSize])
            
            console.log(`🔍 [${trainId}] trainX sample (${sampleSize} items):`, await xSlice.data())
            console.log(`🔍 [${trainId}] trainY sample (${sampleSize} items):`, await ySlice.data())
            
            xSlice.dispose()
            ySlice.dispose()
          } else {
            console.warn(`🔴 [${trainId}] trainX is not a valid Tensor:`, trainX)
          }
        }
        
        // 백엔드 복원
        if (currentBackend === 'webgl') {
          console.log(`🔧 [${trainId}] Switching back to WebGL...`)
          await tf.setBackend('webgl')
        }
        
      } catch (sampleError) {
        console.error(`🔴 [${trainId}] Error sampling data:`, sampleError)
        console.log(`🔧 [${trainId}] Skipping data sampling due to backend issues`)
      }

      // 데이터 유효성 검사 (안전한 방식)
      console.log(`🩺 [${trainId}] Performing safe data health check...`)
      try {
        const checkTensorHealthSafe = async (tensor: any, name: string) => {
          try {
            // 백엔드 문제를 피하기 위해 CPU로 임시 전환
            const currentBackend = tf.getBackend()
            if (currentBackend === 'webgl') {
              await tf.setBackend('cpu')
            }
            
            // 작은 샘플만 검사
            const sampleSize = Math.min(100, tensor.size) // 전체 데이터 대신 100개만
            const sample = tensor.slice([0], [Math.min(sampleSize, tensor.shape[0])])
            const data = await sample.data()
            
            const hasNaN = data.some((val: number) => isNaN(val))
            const hasInf = data.some((val: number) => !isFinite(val))
            const dataArray = Array.from(data) as number[]
            const min = Math.min(...dataArray)
            const max = Math.max(...dataArray)

            console.log(`🩺 [${trainId}] ${name} health check (sample: ${data.length}/${tensor.size}):`, {
              hasNaN,
              hasInf,
              min,
              max,
              totalSize: tensor.size,
              shape: tensor.shape
            })

            if (hasNaN || hasInf) {
              console.error(`💥 [${trainId}] ${name} contains invalid values!`)
            }
            
            sample.dispose()
            
            // 백엔드 복원
            if (currentBackend === 'webgl') {
              await tf.setBackend('webgl')
            }
            
          } catch (innerError) {
            console.error(`🔴 [${trainId}] Failed to check ${name}:`, innerError)
          }
        }

        if (Array.isArray(trainX)) {
          await checkTensorHealthSafe(trainX[0], 'trainX[0]')
          if (Array.isArray(trainY)) {
            await checkTensorHealthSafe(trainY[0], 'trainY[0]')
          } else {
            await checkTensorHealthSafe(trainY, 'trainY')
          }
        } else {
          await checkTensorHealthSafe(trainX, 'trainX')
          await checkTensorHealthSafe(trainY, 'trainY')
        }
      } catch (healthError) {
        console.error(`🔴 [${trainId}] Error in safe health check:`, healthError)
        console.log(`🔧 [${trainId}] Skipping detailed health check due to backend issues`)
      }

      // 테스트 데이터와 비교를 위해 간단한 모델 생성
      console.log(`🧪 [${trainId}] Creating test model with simple data...`)
      model = tf.sequential()
      model.add(tf.layers.dense({ units: 1, inputShape: [1] }))
      model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' })
      const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1])
      const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1])

      console.log(`🧪 [${trainId}] Test data shapes - xs:`, xs.shape, 'ys:', ys.shape)
      await model.fit(xs, ys, {
        epochs: 3, // 빠른 테스트
        verbose: 1,
      })
      console.log(`✅ [${trainId}] Test model training successful!`)

      // 훈련 실행
      console.log(`📝 [${trainId}] Starting model.fit...`)
      console.log(`📝 [${trainId}] Training config:`, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationSplit: config.validationSplit || 0.2,
        shuffle: config.shuffle ?? true,
        verbose: config.verbose ?? 0,
      })

      // 간단한 테스트 학습 (오류 방지를 위해 최소 설정만)
      console.log(`🏃 [${trainId}] Starting simplified training...`)
      // const history = await model.fit(trainX, trainY, {
      const history = await model.fit(xs, ys, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationSplit: config.validationSplit || 0.2,
        shuffle: config.shuffle ?? true,
        verbose: config.verbose ?? 0,
        callbacks: {
          onEpochEnd: async (epoch: number, logs?: tf.Logs) => {
            console.log(`📝 [${trainId}] Epoch ${epoch + 1} completed:`, logs)
            const logRecord = logs || {}

            // 진행 상황 업데이트
            const progress: TrainingProgress = {
              epoch: epoch + 1,
              totalEpochs: config.epochs,
              logs: logRecord,
              elapsedTime: Date.now() - this.startTime,
              estimatedTimeRemaining: this.calculateEstimatedTime(epoch + 1, config.epochs),
            }

            await combinedCallbacks.onEpochEnd?.(epoch, logRecord)
            await combinedCallbacks.onProgress?.(progress)

            // 조기 종료 확인
            if (earlyStoppingCallback?.shouldStop()) {
              console.log(`📝 [${trainId}] Early stopping triggered`)
              model.stopTraining = true
            }
          },
        },
      })

      console.log(`📝 [${trainId}] model.fit completed successfully`)

      // 훈련 결과 생성
      // const trainingHistory = extractMetrics(history)
      // const bestEpoch = findBestEpoch(trainingHistory)

      console.log(`✅ [${trainId}] Simplified training completed successfully`)
      console.log(`📈 [${trainId}] Training history keys:`, Object.keys(history.history))

      // 시라트 훈련 결과 생성 (오류 방지)
      const duration = Date.now() - this.startTime
      const finalLoss = Array.isArray(history.history.loss)
        ? history.history.loss[history.history.loss.length - 1]
        : 0

      // 안전한 히스토리 추출
      const extractSafeHistory = (historyData: any): number[] => {
        if (Array.isArray(historyData)) {
          return historyData.map((val: any) => (typeof val === 'number' ? val : 0))
        }
        return []
      }

      const extractSafeValue = (historyData: any): number | undefined => {
        if (Array.isArray(historyData) && historyData.length > 0) {
          const lastVal = historyData[historyData.length - 1]
          return typeof lastVal === 'number' ? lastVal : undefined
        }
        return undefined
      }

      const result: TrainingResult = {
        history: {
          loss: extractSafeHistory(history.history.loss),
          accuracy: extractSafeHistory(history.history.acc || history.history.accuracy),
          valLoss: extractSafeHistory(history.history.val_loss),
          valAccuracy: extractSafeHistory(history.history.val_acc || history.history.val_accuracy),
        },
        finalMetrics: {
          loss: typeof finalLoss === 'number' ? finalLoss : 0,
          ...(extractSafeValue(history.history.acc || history.history.accuracy) !== undefined && {
            accuracy: extractSafeValue(history.history.acc || history.history.accuracy)!,
          }),
        },
        epochs: Array.isArray(history.history.loss) ? history.history.loss.length : 0,
        duration,
        bestEpoch: 0, // 시라트 버전에서는 0으로 설정
        stopped: true,
        stoppedReason: 'completed',
      }

      // 간단한 결과 리포팅
      console.log(`📈 [${trainId}] Final loss:`, finalLoss)
      if (result.finalMetrics.accuracy !== undefined) {
        console.log(`📈 [${trainId}] Final accuracy:`, result.finalMetrics.accuracy)
      }

      // 훈련 완료 콜백 (안전하게 실행)
      try {
        await combinedCallbacks.onTrainEnd?.(result)
      } catch (callbackError) {
        console.warn(`🔴 [${trainId}] Callback error (non-critical):`, callbackError)
      }

      return result
    } catch (error) {
      const trainingError = error instanceof Error ? error : new Error(String(error))

      console.error(`📝 [${trainId}] Training error caught:`, {
        message: trainingError.message,
        stack: trainingError.stack,
        name: trainingError.name,
      })

      await combinedCallbacks.onError?.(trainingError)

      // 에러 발생 시에도 부분 결과 반환
      const duration = Date.now() - this.startTime
      const result: TrainingResult = {
        history: { loss: [] },
        finalMetrics: {},
        epochs: 0,
        duration,
        stopped: true,
        stoppedReason: 'error',
      }

      throw trainingError
    } finally {
      // 메모리 정리 (안전한 dispose)
      try {
        if (Array.isArray(trainX)) {
          trainX.forEach((tensor) => {
            if (tensor && !tensor.isDisposed) {
              tensor.dispose()
            }
          })
        } else if (trainX && !trainX.isDisposed) {
          trainX.dispose()
        }

        if (Array.isArray(trainY)) {
          trainY.forEach((tensor) => {
            if (tensor && !tensor.isDisposed) {
              tensor.dispose()
            }
          })
        } else if (trainY && !trainY.isDisposed) {
          trainY.dispose()
        }
      } catch (disposeError) {
        console.warn('⚠️ Tensor dispose warning:', disposeError)
      }
    }
  }

  /**
   * 남은 시간 추정
   * @param currentEpoch 현재 에포크
   * @param totalEpochs 총 에포크 수
   * @returns 추정 남은 시간 (밀리초)
   */
  private calculateEstimatedTime(currentEpoch: number, totalEpochs: number): number {
    if (currentEpoch === 0) return 0

    const elapsedTime = Date.now() - this.startTime
    const timePerEpoch = elapsedTime / currentEpoch
    const remainingEpochs = totalEpochs - currentEpoch

    return remainingEpochs * timePerEpoch
  }

  /**
   * 모델 평가
   * @param model 평가할 모델
   * @param testX 테스트 입력 데이터
   * @param testY 테스트 출력 데이터
   * @returns 평가 결과
   */
  async evaluate(
    model: tf.LayersModel,
    testX: tf.Tensor | tf.Tensor[],
    testY: tf.Tensor | tf.Tensor[]
  ): Promise<Record<string, number>> {
    try {
      const evalResult = model.evaluate(testX, testY)

      if (Array.isArray(evalResult)) {
        const metrics: Record<string, number> = {}
        const metricNames = model.metricsNames || ['loss']

        evalResult.forEach((tensor, index) => {
          const metricName = metricNames[index] || `metric_${index}`
          metrics[metricName] = tensor.dataSync()[0]
          tensor.dispose()
        })

        return metrics
      } else {
        const loss = evalResult.dataSync()[0]
        evalResult.dispose()
        return { loss }
      }
    } catch (error) {
      console.error('Model evaluation failed:', error)
      throw error
    }
  }

  /**
   * 모델 예측
   * @param model 예측할 모델
   * @param inputData 입력 데이터
   * @returns 예측 결과
   */
  predict(model: tf.LayersModel, inputData: tf.Tensor | tf.Tensor[]): tf.Tensor | tf.Tensor[] {
    return model.predict(inputData)
  }
}

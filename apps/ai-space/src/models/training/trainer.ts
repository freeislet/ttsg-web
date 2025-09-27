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
    this.startTime = Date.now()

    // 콜백 결합
    const defaultCallbacks = createDefaultCallbacks()
    const combinedCallbacks = combineCallbacks(defaultCallbacks, callbacks || {})

    // 조기 종료 설정
    let earlyStoppingCallback: ReturnType<typeof createEarlyStoppingCallback> | null = null
    if (config.earlyStoppingPatience && config.earlyStoppingPatience > 0) {
      earlyStoppingCallback = createEarlyStoppingCallback(config.earlyStoppingPatience)
      Object.assign(
        combinedCallbacks,
        combineCallbacks(combinedCallbacks, earlyStoppingCallback.callback)
      )
    }

    try {
      // 훈련 시작 콜백
      await combinedCallbacks.onTrainStart?.()

      // TensorFlow.js 백엔드 초기화 확인
      await tf.ready()
      if (!tf.getBackend()) {
        await tf.setBackend('webgl').catch(async () => {
          await tf.setBackend('cpu')
        })
      }

      // 옵티마이저 생성
      const optimizer = createOptimizer(config.optimizer, config.learningRate)

      // 모델 컴파일
      model.compile({
        optimizer,
        loss: config.loss,
        metrics: config.metrics || ['accuracy'],
      })


      // 훈련 실행
      const history = await model.fit(trainX, trainY, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationSplit: config.validationSplit || 0.2,
        shuffle: config.shuffle ?? true,
        verbose: config.verbose ?? 0,
        callbacks: {
          onEpochEnd: async (epoch: number, logs?: tf.Logs) => {
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
              model.stopTraining = true
            }
          },
        },
      })

      // 훈련 결과 생성
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
        bestEpoch: this.findBestEpoch(extractSafeHistory(history.history.loss)),
        stopped: true,
        stoppedReason: 'completed',
      }


      // 훈련 완료 콜백
      await combinedCallbacks.onTrainEnd?.(result)

      return result
    } catch (error) {
      const trainingError = error instanceof Error ? error : new Error(String(error))
      await combinedCallbacks.onError?.(trainingError)
      throw trainingError
    } finally {
      // 메모리 정리
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
   * 최적 에포크 찾기 (가장 낮은 loss를 가진 에포크)
   * @param lossHistory loss 히스토리 배열
   * @returns 최적 에포크 인덱스 (0-based)
   */
  private findBestEpoch(lossHistory: number[]): number {
    if (!lossHistory || lossHistory.length === 0) return 0
    
    let bestEpoch = 0
    let bestLoss = lossHistory[0]
    
    for (let i = 1; i < lossHistory.length; i++) {
      if (lossHistory[i] < bestLoss) {
        bestLoss = lossHistory[i]
        bestEpoch = i
      }
    }
    
    return bestEpoch
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

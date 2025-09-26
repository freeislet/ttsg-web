import * as tf from '@tensorflow/tfjs'
import { 
  ModelTrainingConfig, 
  TrainingResult, 
  TrainingCallbacks,
  TrainingProgress
} from './types'
import { createOptimizer } from './optimizers'
import { extractMetrics, calculateFinalMetrics, findBestEpoch, detectOverfitting } from './metrics'
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
   * @param trainY 훈련 출력 데이터
   * @param config 훈련 설정
   * @param callbacks 훈련 콜백들
   * @returns 훈련 결과
   */
  async train(
    model: tf.LayersModel,
    trainX: tf.Tensor | tf.Tensor[],
    trainY: tf.Tensor | tf.Tensor[],
    config: ModelTrainingConfig,
    callbacks?: TrainingCallbacks
  ): Promise<TrainingResult> {
    this.startTime = Date.now()
    
    // 기본 콜백과 사용자 콜백 결합
    const defaultCallbacks = createDefaultCallbacks()
    const combinedCallbacks = callbacks 
      ? combineCallbacks(defaultCallbacks, callbacks)
      : defaultCallbacks
    
    // 조기 종료 설정
    let earlyStoppingCallback: ReturnType<typeof createEarlyStoppingCallback> | null = null
    if (config.earlyStoppingPatience && config.earlyStoppingPatience > 0) {
      earlyStoppingCallback = createEarlyStoppingCallback(config.earlyStoppingPatience)
      Object.assign(combinedCallbacks, combineCallbacks(combinedCallbacks, earlyStoppingCallback.callback))
    }
    
    try {
      // 훈련 시작 콜백
      await combinedCallbacks.onTrainStart?.()
      
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
              estimatedTimeRemaining: this.calculateEstimatedTime(epoch + 1, config.epochs)
            }
            
            await combinedCallbacks.onEpochEnd?.(epoch, logRecord)
            await combinedCallbacks.onProgress?.(progress)
            
            // 조기 종료 확인
            if (earlyStoppingCallback?.shouldStop()) {
              model.stopTraining = true
            }
          }
        }
      })
      
      // 훈련 결과 생성
      const trainingHistory = extractMetrics(history)
      const finalMetrics = calculateFinalMetrics(trainingHistory)
      const bestEpoch = findBestEpoch(trainingHistory)
      const duration = Date.now() - this.startTime
      
      const result: TrainingResult = {
        history: trainingHistory,
        finalMetrics,
        epochs: history.epoch.length,
        duration,
        bestEpoch,
        stopped: true,
        stoppedReason: earlyStoppingCallback?.shouldStop() ? 'early_stopping' : 'completed'
      }
      
      // 과적합 감지 및 경고
      const overfittingInfo = detectOverfitting(trainingHistory)
      if (overfittingInfo.isOverfitting) {
        console.warn(`⚠️ Potential overfitting detected (val_loss: ${overfittingInfo.valLoss.toFixed(4)}, train_loss: ${overfittingInfo.trainLoss.toFixed(4)})`)
      }
      
      // 훈련 완료 콜백
      await combinedCallbacks.onTrainEnd?.(result)
      
      return result
      
    } catch (error) {
      const trainingError = error instanceof Error ? error : new Error(String(error))
      
      await combinedCallbacks.onError?.(trainingError)
      
      // 에러 발생 시에도 부분 결과 반환
      const duration = Date.now() - this.startTime
      const result: TrainingResult = {
        history: { loss: [] },
        finalMetrics: {},
        epochs: 0,
        duration,
        stopped: true,
        stoppedReason: 'error'
      }
      
      throw trainingError
    } finally {
      // 메모리 정리
      if (Array.isArray(trainX)) {
        trainX.forEach(tensor => tensor.dispose())
      } else {
        trainX.dispose()
      }
      
      if (Array.isArray(trainY)) {
        trainY.forEach(tensor => tensor.dispose())
      } else {
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
  predict(
    model: tf.LayersModel,
    inputData: tf.Tensor | tf.Tensor[]
  ): tf.Tensor | tf.Tensor[] {
    return model.predict(inputData)
  }
}

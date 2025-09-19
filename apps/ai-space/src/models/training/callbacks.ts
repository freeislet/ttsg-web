import { TrainingCallbacks, TrainingProgress, TrainingResult } from './types'

/**
 * 기본 콜백 생성
 * @param onProgress 진행 상황 콜백
 * @returns 기본 훈련 콜백들
 */
export const createDefaultCallbacks = (
  onProgress?: (epoch: number, logs: Record<string, number>) => void
): TrainingCallbacks => ({
  onTrainStart: () => {
    console.log('🏃 Training started')
  },
  
  onEpochEnd: (epoch: number, logs: Record<string, number>) => {
    const loss = logs.loss?.toFixed(4) || 'N/A'
    const accuracy = logs.accuracy ? ` - accuracy: ${logs.accuracy.toFixed(4)}` : ''
    const valLoss = logs.val_loss ? ` - val_loss: ${logs.val_loss.toFixed(4)}` : ''
    const valAccuracy = logs.val_accuracy ? ` - val_accuracy: ${logs.val_accuracy.toFixed(4)}` : ''
    
    console.log(`Epoch ${epoch + 1} - loss: ${loss}${accuracy}${valLoss}${valAccuracy}`)
    onProgress?.(epoch, logs)
  },
  
  onTrainEnd: (result: TrainingResult) => {
    const status = result.stopped 
      ? `✅ Training ${result.stoppedReason} after ${result.epochs} epochs`
      : `✅ Training completed in ${result.epochs} epochs`
    
    console.log(`${status} (${(result.duration / 1000).toFixed(2)}s)`)
  },
  
  onError: (error: Error) => {
    console.error('❌ Training failed:', error.message)
  }
})

/**
 * 진행 상황 추적 콜백
 * @param onProgress 진행 상황 업데이트 함수
 * @returns 진행 상황 콜백
 */
export const createProgressCallback = (
  onProgress: (progress: TrainingProgress) => void
): TrainingCallbacks => {
  let startTime: number
  
  return {
    onTrainStart: () => {
      startTime = Date.now()
    },
    
    onEpochEnd: (epoch: number, logs: Record<string, number>) => {
      const elapsedTime = Date.now() - startTime
      const progress: TrainingProgress = {
        epoch: epoch + 1,
        totalEpochs: 0, // 트레이너에서 설정됨
        logs,
        elapsedTime,
      }
      
      onProgress(progress)
    }
  }
}

/**
 * 조기 종료 콜백
 * @param patience 개선되지 않는 에포크 수
 * @param monitor 모니터링할 메트릭 (기본: 'val_loss')
 * @param minDelta 최소 개선 임계값
 * @returns 조기 종료 콜백
 */
export const createEarlyStoppingCallback = (
  patience: number = 10,
  monitor: string = 'val_loss',
  minDelta: number = 0.001
): {
  callback: TrainingCallbacks
  shouldStop: () => boolean
  getBestEpoch: () => number
} => {
  let bestValue: number | null = null
  let bestEpoch = 0
  let waitCount = 0
  let shouldStopTraining = false
  
  const callback: TrainingCallbacks = {
    onEpochEnd: (epoch: number, logs: Record<string, number>) => {
      const currentValue = logs[monitor]
      
      if (currentValue === undefined) {
        console.warn(`Early stopping monitor '${monitor}' not found in logs`)
        return
      }
      
      const isImprovement = bestValue === null || 
        (monitor.includes('loss') ? currentValue < bestValue - minDelta : currentValue > bestValue + minDelta)
      
      if (isImprovement) {
        bestValue = currentValue
        bestEpoch = epoch
        waitCount = 0
      } else {
        waitCount++
        
        if (waitCount >= patience) {
          console.log(`Early stopping at epoch ${epoch + 1} (best epoch: ${bestEpoch + 1})`)
          shouldStopTraining = true
        }
      }
    }
  }
  
  return {
    callback,
    shouldStop: () => shouldStopTraining,
    getBestEpoch: () => bestEpoch
  }
}

/**
 * 메트릭 로깅 콜백
 * @param logInterval 로그 출력 간격 (에포크 단위)
 * @returns 메트릭 로깅 콜백
 */
export const createMetricsLoggingCallback = (
  logInterval: number = 10
): TrainingCallbacks => ({
  onEpochEnd: (epoch: number, logs: Record<string, number>) => {
    if ((epoch + 1) % logInterval === 0) {
      console.log(`\n📊 Epoch ${epoch + 1} Metrics:`)
      Object.entries(logs).forEach(([metric, value]) => {
        console.log(`  ${metric}: ${value.toFixed(6)}`)
      })
      console.log('')
    }
  }
})

/**
 * 여러 콜백을 하나로 합치는 함수
 * @param callbacks 합칠 콜백들
 * @returns 통합된 콜백
 */
export const combineCallbacks = (...callbacks: TrainingCallbacks[]): TrainingCallbacks => {
  const combined: TrainingCallbacks = {}
  
  const callbackMethods: (keyof TrainingCallbacks)[] = [
    'onTrainStart', 'onTrainEnd', 'onEpochStart', 'onEpochEnd', 'onProgress', 'onError'
  ]
  
  callbackMethods.forEach(method => {
    const methodCallbacks = callbacks
      .map(cb => cb[method])
      .filter(fn => fn !== undefined)
    
    if (methodCallbacks.length > 0) {
      combined[method] = async (...args: any[]) => {
        for (const fn of methodCallbacks) {
          await fn(...args)
        }
      }
    }
  })
  
  return combined
}

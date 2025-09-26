import * as tf from '@tensorflow/tfjs'
import { TrainingHistory } from './types'

/**
 * TensorFlow.js History에서 메트릭 추출
 * @param history TensorFlow.js 훈련 히스토리
 * @returns 정규화된 훈련 히스토리
 */
export const extractMetrics = (history: tf.History): TrainingHistory => {
  const metrics: TrainingHistory = {
    loss: history.history.loss as number[] || [],
  }
  
  // 일반적인 메트릭들 추출
  if (history.history.accuracy) {
    metrics.accuracy = history.history.accuracy as number[]
  }
  
  if (history.history.val_loss) {
    metrics.valLoss = history.history.val_loss as number[]
  }
  
  if (history.history.val_accuracy) {
    metrics.valAccuracy = history.history.val_accuracy as number[]
  }
  
  // 기타 메트릭들 추가
  Object.entries(history.history).forEach(([key, values]) => {
    if (!['loss', 'accuracy', 'val_loss', 'val_accuracy'].includes(key)) {
      metrics[key] = values as number[]
    }
  })
  
  return metrics
}

/**
 * 최종 메트릭 계산
 * @param history 훈련 히스토리
 * @returns 최종 메트릭 값들
 */
export const calculateFinalMetrics = (history: TrainingHistory): Record<string, number> => {
  const finalMetrics: Record<string, number> = {}
  
  Object.entries(history).forEach(([metric, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      finalMetrics[metric] = values[values.length - 1]
    }
  })
  
  return finalMetrics
}

/**
 * 최고 성능 에포크 찾기
 * @param history 훈련 히스토리
 * @param metric 모니터링할 메트릭 (기본: 'val_loss')
 * @returns 최고 성능 에포크 번호
 */
export const findBestEpoch = (
  history: TrainingHistory,
  metric: string = 'val_loss'
): number => {
  const values = history[metric]
  if (!values || values.length === 0) {
    return history.loss.length - 1 // 마지막 에포크 반환
  }
  
  const isLossMetric = metric.toLowerCase().includes('loss')
  let bestIndex = 0
  let bestValue = values[0]
  
  values.forEach((value, index) => {
    if (isLossMetric ? value < bestValue : value > bestValue) {
      bestValue = value
      bestIndex = index
    }
  })
  
  return bestIndex
}

/**
 * 메트릭 통계 계산
 * @param values 메트릭 값 배열
 * @returns 통계 정보
 */
export const calculateMetricStats = (values: number[]) => {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, std: 0 }
  }
  
  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const std = Math.sqrt(variance)
  
  return { min, max, mean, std }
}

/**
 * 훈련 진행 상황 분석
 * @param history 훈련 히스토리
 * @returns 진행 상황 분석 결과
 */
export const analyzeTrainingProgress = (history: TrainingHistory) => {
  const analysis: Record<string, any> = {}
  
  Object.entries(history).forEach(([metric, values]) => {
    if (!Array.isArray(values) || values.length === 0) return
    
    const stats = calculateMetricStats(values)
    const isImproving = values.length > 1 ? 
      (metric.includes('loss') ? values[values.length - 1] < values[0] : values[values.length - 1] > values[0]) : 
      true
    
    // 최근 5개 에포크의 변화율 계산
    const recentValues = values.slice(-Math.min(5, values.length))
    const trend = recentValues.length > 1 ?
      (recentValues[recentValues.length - 1] - recentValues[0]) / recentValues.length :
      0
    
    analysis[metric] = {
      ...stats,
      current: values[values.length - 1],
      isImproving,
      trend,
      stability: stats.std / Math.abs(stats.mean) // 변동계수
    }
  })
  
  return analysis
}

/**
 * 과적합 감지
 * @param history 훈련 히스토리
 * @param threshold 과적합 임계값 (기본: 0.1)
 * @returns 과적합 여부 및 정보
 */
export const detectOverfitting = (
  history: TrainingHistory,
  threshold: number = 0.1
): {
  isOverfitting: boolean
  trainLoss: number
  valLoss: number
  gap: number
} => {
  const trainLoss = history.loss
  const valLoss = history.valLoss
  
  if (!trainLoss || !valLoss || trainLoss.length === 0 || valLoss.length === 0) {
    return {
      isOverfitting: false,
      trainLoss: 0,
      valLoss: 0,
      gap: 0
    }
  }
  
  const finalTrainLoss = trainLoss[trainLoss.length - 1]
  const finalValLoss = valLoss[valLoss.length - 1]
  const gap = finalValLoss - finalTrainLoss
  
  return {
    isOverfitting: gap > threshold,
    trainLoss: finalTrainLoss,
    valLoss: finalValLoss,
    gap
  }
}

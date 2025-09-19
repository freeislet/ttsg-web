import * as tf from '@tensorflow/tfjs'
import { IDataset, DatasetStats } from '../types'

/**
 * 기본 데이터셋 클래스
 * 메모리 관리와 공통 기능을 제공
 */
export abstract class BaseDataset implements IDataset {
  abstract readonly inputs: tf.Tensor
  abstract readonly labels: tf.Tensor
  abstract readonly inputShape: number[]
  abstract readonly outputShape: number[]
  abstract readonly inputColumns: string[]
  abstract readonly outputColumns: string[]
  abstract readonly sampleCount: number
  
  // 선택적 속성들
  readonly trainInputs?: tf.Tensor
  readonly trainLabels?: tf.Tensor
  readonly testInputs?: tf.Tensor
  readonly testLabels?: tf.Tensor
  readonly trainCount?: number
  readonly testCount?: number
  
  private _disposed = false
  
  /**
   * 메모리 정리
   */
  dispose(): void {
    if (this._disposed) return
    
    this.inputs.dispose()
    this.labels.dispose()
    
    if (this.trainInputs) this.trainInputs.dispose()
    if (this.trainLabels) this.trainLabels.dispose()
    if (this.testInputs) this.testInputs.dispose()
    if (this.testLabels) this.testLabels.dispose()
    
    this._disposed = true
    console.log('🗑️ Dataset disposed')
  }
  
  /**
   * 데이터셋이 정리되었는지 확인
   */
  get isDisposed(): boolean {
    return this._disposed
  }
  
  /**
   * 데이터셋 통계 계산
   */
  getStats(): DatasetStats {
    if (this._disposed) {
      throw new Error('Dataset has been disposed')
    }
    
    const inputStats = this.calculateTensorStats(this.inputs)
    const outputStats = this.calculateTensorStats(this.labels)
    const memoryUsage = this.calculateMemoryUsage()
    
    return {
      inputStats,
      outputStats,
      memoryUsage
    }
  }
  
  /**
   * 텐서 통계 계산
   */
  private calculateTensorStats(tensor: tf.Tensor) {
    const data = tensor.dataSync()
    const shape = tensor.shape
    const numFeatures = shape[shape.length - 1] || 1
    
    const stats = {
      min: [] as number[],
      max: [] as number[],
      mean: [] as number[],
      std: [] as number[]
    }
    
    for (let i = 0; i < numFeatures; i++) {
      const featureData: number[] = []
      for (let j = i; j < data.length; j += numFeatures) {
        featureData.push(data[j])
      }
      
      const min = Math.min(...featureData)
      const max = Math.max(...featureData)
      const mean = featureData.reduce((sum, val) => sum + val, 0) / featureData.length
      const variance = featureData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / featureData.length
      const std = Math.sqrt(variance)
      
      stats.min.push(min)
      stats.max.push(max)
      stats.mean.push(mean)
      stats.std.push(std)
    }
    
    return stats
  }
  
  /**
   * 메모리 사용량 계산 (바이트)
   */
  private calculateMemoryUsage(): number {
    let totalElements = 0
    
    totalElements += this.inputs.size
    totalElements += this.labels.size
    
    if (this.trainInputs) totalElements += this.trainInputs.size
    if (this.trainLabels) totalElements += this.trainLabels.size
    if (this.testInputs) totalElements += this.testInputs.size
    if (this.testLabels) totalElements += this.testLabels.size
    
    // float32 = 4 bytes per element
    return totalElements * 4
  }
  
  /**
   * 훈련/테스트 분할
   */
  protected splitData(trainRatio: number = 0.8): {
    trainInputs: tf.Tensor
    trainLabels: tf.Tensor
    testInputs: tf.Tensor
    testLabels: tf.Tensor
  } {
    const totalSamples = this.sampleCount
    const trainCount = Math.floor(totalSamples * trainRatio)
    const testCount = totalSamples - trainCount
    
    const trainInputs = this.inputs.slice([0, 0], [trainCount, -1])
    const trainLabels = this.labels.slice([0, 0], [trainCount, -1])
    const testInputs = this.inputs.slice([trainCount, 0], [testCount, -1])
    const testLabels = this.labels.slice([trainCount, 0], [testCount, -1])
    
    return { trainInputs, trainLabels, testInputs, testLabels }
  }
  
  /**
   * 데이터 정규화
   */
  protected normalizeData(tensor: tf.Tensor): { normalized: tf.Tensor, min: tf.Tensor, max: tf.Tensor } {
    const min = tensor.min(0, true)
    const max = tensor.max(0, true)
    const range = max.sub(min)
    const normalized = tensor.sub(min).div(range)
    
    return { normalized, min, max }
  }
  
  /**
   * 데이터 셔플
   */
  protected shuffleData(): { shuffledInputs: tf.Tensor, shuffledLabels: tf.Tensor } {
    const indices = tf.util.createShuffledIndices(this.sampleCount)
    const shuffledInputs = this.inputs.gather(indices)
    const shuffledLabels = this.labels.gather(indices)
    
    return { shuffledInputs, shuffledLabels }
  }
}

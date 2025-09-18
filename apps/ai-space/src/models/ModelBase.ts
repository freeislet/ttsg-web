import * as tf from '@tensorflow/tfjs'

/**
 * 모델 베이스 추상 클래스
 * 모든 AI 모델의 공통 인터페이스를 정의
 */
export abstract class ModelBase {
  /** 모델 타입 식별자 */
  abstract readonly modelType: string
  
  /** 모델 표시명 */
  abstract readonly displayName: string
  
  /** TensorFlow.js 모델 인스턴스 */
  protected model?: tf.Sequential | tf.LayersModel
  
  /** 모델 ID */
  readonly id: string
  
  /** 모델 생성 시간 */
  readonly createdAt: Date
  
  /** 모델 상태 */
  protected _isCompiled = false
  protected _isTrained = false
  
  constructor(id?: string) {
    this.id = id || this.generateId()
    this.createdAt = new Date()
  }
  
  // === 추상 메서드 (하위 클래스에서 구현 필수) ===
  
  /** 모델 생성 */
  abstract createModel(): Promise<tf.Sequential | tf.LayersModel>
  
  /** 모델 컴파일 */
  abstract compile(config: any): Promise<void>
  
  /** 모델 학습 */
  abstract train(data: any, config: any): Promise<any>
  
  /** 예측 수행 */
  abstract predict(input: tf.Tensor): Promise<tf.Tensor>
  
  // === 공통 메서드 ===
  
  /** 모델이 컴파일되었는지 확인 */
  get isCompiled(): boolean {
    return this._isCompiled
  }
  
  /** 모델이 학습되었는지 확인 */
  get isTrained(): boolean {
    return this._isTrained
  }
  
  /** 모델 인스턴스 반환 */
  get tfModel(): tf.Sequential | tf.LayersModel | undefined {
    return this.model
  }
  
  /** 모델 요약 정보 */
  getSummary(): string {
    if (!this.model) return 'Model not created'
    return this.model.toString()
  }
  
  /** 모델 메모리 사용량 */
  getMemoryUsage(): number {
    if (!this.model) return 0
    return tf.memory().numBytes
  }
  
  /** 모델 직렬화 */
  serialize(): any {
    return {
      id: this.id,
      modelType: this.modelType,
      displayName: this.displayName,
      createdAt: this.createdAt.toISOString(),
      isCompiled: this._isCompiled,
      isTrained: this._isTrained,
    }
  }
  
  /** 모델 정리 (메모리 해제) */
  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = undefined
    }
  }
  
  // === 유틸리티 메서드 ===
  
  private generateId(): string {
    return `${this.modelType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 모델 팩토리 인터페이스
 */
export interface ModelFactory<T extends ModelBase> {
  create(config?: any): T
  modelType: string
  displayName: string
}

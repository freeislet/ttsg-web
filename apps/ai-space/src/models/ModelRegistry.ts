import { ModelBase, ModelFactory } from './ModelBase'

/**
 * 모델 레지스트리
 * 모든 모델 타입을 등록하고 관리하는 중앙 레지스트리
 */
export class ModelRegistry {
  private static factories = new Map<string, ModelFactory<any>>()
  private static instances = new Map<string, ModelBase>()
  
  /**
   * 모델 팩토리 등록
   */
  static register<T extends ModelBase>(factory: ModelFactory<T>): void {
    if (this.factories.has(factory.modelType)) {
      console.warn(`Model type '${factory.modelType}' is already registered. Overwriting...`)
    }
    
    this.factories.set(factory.modelType, factory)
    console.log(`✅ Model registered: ${factory.modelType} (${factory.displayName})`)
  }
  
  /**
   * 등록된 모든 모델 타입 반환
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.factories.keys())
  }
  
  /**
   * 모델 타입별 표시명 반환
   */
  static getDisplayName(modelType: string): string {
    const factory = this.factories.get(modelType)
    return factory?.displayName || modelType
  }
  
  /**
   * 모델 인스턴스 생성
   */
  static createModel<T extends ModelBase>(
    modelType: string, 
    config?: any
  ): T {
    const factory = this.factories.get(modelType)
    if (!factory) {
      throw new Error(`Unknown model type: ${modelType}. Available types: ${this.getRegisteredTypes().join(', ')}`)
    }
    
    const model = factory.create(config) as T
    this.instances.set(model.id, model)
    
    console.log(`🚀 Model created: ${model.id} (${modelType})`)
    return model
  }
  
  /**
   * 모델 인스턴스 반환
   */
  static getInstance<T extends ModelBase>(modelId: string): T | undefined {
    return this.instances.get(modelId) as T
  }
  
  /**
   * 모든 모델 인스턴스 반환
   */
  static getAllInstances(): ModelBase[] {
    return Array.from(this.instances.values())
  }
  
  /**
   * 모델 인스턴스 제거
   */
  static removeInstance(modelId: string): boolean {
    const model = this.instances.get(modelId)
    if (model) {
      model.dispose() // 메모리 정리
      this.instances.delete(modelId)
      console.log(`🗑️ Model removed: ${modelId}`)
      return true
    }
    return false
  }
  
  /**
   * 모든 모델 인스턴스 정리
   */
  static clear(): void {
    this.instances.forEach(model => model.dispose())
    this.instances.clear()
    console.log('🧹 All model instances cleared')
  }
  
  /**
   * 등록된 팩토리 정보 반환
   */
  static getFactoryInfo(): Array<{
    modelType: string
    displayName: string
    instanceCount: number
  }> {
    return Array.from(this.factories.entries()).map(([modelType, factory]) => ({
      modelType,
      displayName: factory.displayName,
      instanceCount: Array.from(this.instances.values())
        .filter(instance => instance.modelType === modelType).length
    }))
  }
}

/**
 * 모델 자동 등록을 위한 데코레이터
 */
export function RegisterModel(factory: ModelFactory<any>) {
  return function <T extends new (...args: any[]) => ModelBase>(constructor: T) {
    // 모델 등록
    ModelRegistry.register(factory)
    return constructor
  }
}

import { IModelComponent } from '@/types/ModelNode'
import { NeuralNetworkModelComponent } from './NeuralNetworkModel'

/**
 * 모델 컴포넌트 레지스트리
 */
class ModelComponentRegistry {
  private components = new Map<string, IModelComponent>()

  /**
   * 모델 컴포넌트 등록
   */
  register(component: IModelComponent) {
    this.components.set(component.type, component)
    console.log(`🔧 모델 컴포넌트 등록: ${component.type} (${component.name})`)
  }

  /**
   * 모델 컴포넌트 조회
   */
  get(type: string): IModelComponent | undefined {
    return this.components.get(type)
  }

  /**
   * 등록된 모든 모델 타입 조회
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.components.keys())
  }

  /**
   * 등록된 모든 모델 컴포넌트 조회
   */
  getAllComponents(): IModelComponent[] {
    return Array.from(this.components.values())
  }

  /**
   * 모델 컴포넌트 존재 여부 확인
   */
  has(type: string): boolean {
    return this.components.has(type)
  }

  /**
   * 디버그 정보 조회
   */
  getDebugInfo() {
    return {
      registeredCount: this.components.size,
      registeredTypes: this.getRegisteredTypes(),
      components: Array.from(this.components.entries()).map(([type, component]) => ({
        type,
        name: component.name,
        description: component.description
      }))
    }
  }
}

// 싱글톤 인스턴스 생성
export const modelRegistry = new ModelComponentRegistry()

// 기본 모델 컴포넌트들 자동 등록
modelRegistry.register(NeuralNetworkModelComponent)

// 추후 다른 모델 타입들을 여기에 추가
// modelRegistry.register(CNNModelComponent)
// modelRegistry.register(RNNModelComponent)
// modelRegistry.register(TransformerModelComponent)

export default modelRegistry

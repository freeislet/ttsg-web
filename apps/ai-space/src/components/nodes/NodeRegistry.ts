import React from 'react'
import { NodeProps } from 'reactflow'
import { ModelBase } from '@/models/ModelBase'

/**
 * 노드 컴포넌트 팩토리 인터페이스
 */
export interface NodeComponentFactory<T extends ModelBase = ModelBase> {
  modelType: string
  displayName: string
  
  // 노드 컴포넌트들
  ModelNodeComponent: React.ComponentType<NodeProps<any>>
  TrainingNodeComponent: React.ComponentType<NodeProps<any>>
  
  // 노드 생성 팩토리
  createModelNode: (position: { x: number; y: number }, config?: any) => any
  createTrainingNode: (position: { x: number; y: number }, modelId: string, config?: any) => any
}

/**
 * 노드 레지스트리
 * 모든 노드 컴포넌트와 팩토리를 등록하고 관리
 */
export class NodeRegistry {
  private static factories = new Map<string, NodeComponentFactory<any>>()
  
  /**
   * 노드 컴포넌트 팩토리 등록
   */
  static register<T extends ModelBase>(factory: NodeComponentFactory<T>): void {
    if (this.factories.has(factory.modelType)) {
      console.warn(`Node factory for '${factory.modelType}' is already registered. Overwriting...`)
    }
    
    this.factories.set(factory.modelType, factory)
    console.log(`✅ Node factory registered: ${factory.modelType} (${factory.displayName})`)
  }
  
  /**
   * 등록된 모든 모델 타입 반환
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.factories.keys())
  }
  
  /**
   * 모델 노드 컴포넌트 반환
   */
  static getModelNodeComponent(modelType: string): React.ComponentType<NodeProps<any>> | undefined {
    const factory = this.factories.get(modelType)
    return factory?.ModelNodeComponent
  }
  
  /**
   * 학습 노드 컴포넌트 반환
   */
  static getTrainingNodeComponent(modelType: string): React.ComponentType<NodeProps<any>> | undefined {
    const factory = this.factories.get(modelType)
    return factory?.TrainingNodeComponent
  }
  
  /**
   * React Flow용 노드 타입 맵 생성
   */
  static createNodeTypes(): Record<string, React.ComponentType<NodeProps<any>>> {
    const nodeTypes: Record<string, React.ComponentType<NodeProps<any>>> = {}
    
    this.factories.forEach((factory, modelType) => {
      // 모델 노드
      nodeTypes[`${modelType}-model`] = factory.ModelNodeComponent
      
      // 학습 노드
      nodeTypes[`${modelType}-training`] = factory.TrainingNodeComponent
    })
    
    return nodeTypes
  }
  
  /**
   * 모델 노드 생성
   */
  static createModelNode(
    modelType: string,
    position: { x: number; y: number },
    config?: any
  ): any {
    const factory = this.factories.get(modelType)
    if (!factory) {
      throw new Error(`Unknown model type: ${modelType}`)
    }
    
    return factory.createModelNode(position, config)
  }
  
  /**
   * 학습 노드 생성
   */
  static createTrainingNode(
    modelType: string,
    position: { x: number; y: number },
    modelId: string,
    config?: any
  ): any {
    const factory = this.factories.get(modelType)
    if (!factory) {
      throw new Error(`Unknown model type: ${modelType}`)
    }
    
    return factory.createTrainingNode(position, modelId, config)
  }
  
  /**
   * 팩토리 정보 반환
   */
  static getFactoryInfo(): Array<{
    modelType: string
    displayName: string
  }> {
    return Array.from(this.factories.entries()).map(([modelType, factory]) => ({
      modelType,
      displayName: factory.displayName
    }))
  }
}

/**
 * 노드 자동 등록을 위한 데코레이터
 */
export function RegisterNodeFactory(factory: NodeComponentFactory<any>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    // 노드 팩토리 등록
    NodeRegistry.register(factory)
    return constructor
  }
}

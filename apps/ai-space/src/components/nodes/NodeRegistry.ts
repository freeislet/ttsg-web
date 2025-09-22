/**
 * 간소화된 노드 레지스트리
 * 새로운 아키텍처에서는 ModelNode와 DataNode만 사용
 */
class NodeRegistryClass {
  private registeredTypes = ['neural-network']

  /**
   * 등록된 모델 타입들 반환
   */
  getRegisteredTypes(): string[] {
    return [...this.registeredTypes]
  }

  /**
   * React Flow 노드 타입 맵 생성
   */
  createNodeTypes() {
    return {
      model: () => import('@/components/nodes/ModelNode').then(m => m.default),
      data: () => import('@/components/nodes/DataNode').then(m => m.default)
    }
  }

  /**
   * 디버그 정보
   */
  getDebugInfo() {
    return {
      registeredTypes: this.getRegisteredTypes(),
      totalTypes: this.registeredTypes.length
    }
  }
}

// 싱글톤 인스턴스
export const NodeRegistry = new NodeRegistryClass()

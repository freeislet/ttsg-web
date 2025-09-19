import { proxy, useSnapshot } from 'valtio'
import {
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow'
import { FlowNode, FlowEdge } from '@/types/flow'
import { NodeRegistry } from '@/components/nodes/NodeRegistry'

/**
 * 모델 상태 인터페이스
 */
interface ModelState {
  // React Flow 상태
  nodes: FlowNode[]
  edges: FlowEdge[]
  selectedNodeId: string | null

  // 모델 인스턴스 관리
  modelInstances: Map<string, any>

  // UI 상태
  isLoading: boolean
  error: string | null
}

/**
 * 모델 상태 (Valtio proxy)
 */
const modelState = proxy<ModelState>({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  modelInstances: new Map(),
  isLoading: false,
  error: null,
})

/**
 * 새로운 모델 스토어
 */
export const modelStore = {
  // === React Flow 이벤트 핸들러 ===

  onNodesChange: (changes: NodeChange[]) => {
    modelState.nodes = applyNodeChanges(changes, modelState.nodes)
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    modelState.edges = applyEdgeChanges(changes, modelState.edges)
  },

  onConnect: (connection: Connection) => {
    modelState.edges = addEdge(connection, modelState.edges)
  },

  onSelectionChange: (params: { nodes: FlowNode[] }) => {
    modelState.selectedNodeId = params.nodes[0]?.id || null
  },

  // === 노드 관리 ===

  /**
   * 모델 노드 추가
   */
  addModelNode: (modelType: string, position: { x: number; y: number }) => {
    try {
      const node = NodeRegistry.createModelNode(modelType, position)
      modelState.nodes.push(node)

      // 모델 인스턴스 저장
      if (node.model) {
        modelState.modelInstances.set(node.data.modelId, node.model)
      }

      console.log(`✅ Model node added: ${node.id}`)
    } catch (error) {
      console.error(`❌ Failed to add model node: ${error}`)
      modelState.error = `Failed to add model node: ${error}`
    }
  },

  /**
   * 학습 노드 추가
   */
  addTrainingNode: (modelType: string, position: { x: number; y: number }, modelId: string) => {
    try {
      const node = NodeRegistry.createTrainingNode(modelType, position, modelId)
      modelState.nodes.push(node)

      console.log(`✅ Training node added: ${node.id}`)
    } catch (error) {
      console.error(`❌ Failed to add training node: ${error}`)
      modelState.error = `Failed to add training node: ${error}`
    }
  },

  /**
   * 데이터 노드 추가
   */
  addDataNode: (position: { x: number; y: number }) => {
    const nodeId = `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const node: FlowNode = {
      id: nodeId,
      type: 'data',
      position,
      data: {
        label: '훈련 데이터',
        samples: 1000,
        inputFeatures: 10,
        outputFeatures: 1,
        dataType: 'training',
        inputShape: [10],
        outputShape: [1],
      },
    }

    modelState.nodes.push(node)
    console.log(`✅ Data node added: ${node.id}`)
  },

  /**
   * 노드 제거
   */
  removeNode: (nodeId: string) => {
    // 노드 제거
    modelState.nodes = modelState.nodes.filter((node) => node.id !== nodeId)

    // 관련 엣지 제거
    modelState.edges = modelState.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    )

    // 모델 인스턴스 정리
    const node = modelState.nodes.find((n) => n.id === nodeId)
    if (node?.data?.modelId) {
      const model = modelState.modelInstances.get(node.data.modelId)
      if (model && typeof model.dispose === 'function') {
        model.dispose()
      }
      modelState.modelInstances.delete(node.data.modelId)
    }

    console.log(`🗑️ Node removed: ${nodeId}`)
  },

  /**
   * 모든 노드 제거
   */
  clearAll: () => {
    // 모든 모델 인스턴스 정리
    modelState.modelInstances.forEach((model) => {
      if (model && typeof model.dispose === 'function') {
        model.dispose()
      }
    })

    modelState.nodes = []
    modelState.edges = []
    modelState.modelInstances.clear()
    modelState.selectedNodeId = null
    modelState.error = null

    console.log('🧹 All nodes cleared')
  },

  // === 모델 관리 ===

  /**
   * 모델 인스턴스 가져오기
   */
  getModelInstance: (modelId: string) => {
    return modelState.modelInstances.get(modelId)
  },

  /**
   * 등록된 모델 타입 가져오기
   */
  getAvailableModelTypes: () => {
    return NodeRegistry.getRegisteredTypes()
  },

  /**
   * 노드 컴포넌트 타입 맵 가져오기
   */
  getNodeTypes: () => {
    return {
      ...NodeRegistry.createNodeTypes(),
      data: () => import('@/components/nodes/DataNode').then((m) => m.default),
    }
  },


  // === 유틸리티 ===

  /**
   * 상태 스냅샷 가져오기
   */
  getSnapshot: () => useSnapshot(modelState),

  /**
   * 디버그 정보
   */
  getDebugInfo: () => ({
    nodeCount: modelState.nodes.length,
    edgeCount: modelState.edges.length,
    modelInstanceCount: modelState.modelInstances.size,
    registeredModelTypes: NodeRegistry.getRegisteredTypes(),
    registeredNodeTypes: NodeRegistry.getRegisteredTypes(),
  }),
}

/**
 * React Hook for using the model store
 */
export const useModelStore = () => {
  const snapshot = useSnapshot(modelState)
  return {
    ...snapshot,
    ...modelStore,
  }
}

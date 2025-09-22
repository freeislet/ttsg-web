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
import { updateModelShapes } from '@/utils/modelShapeInference'

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
    // 연결 후 모델 shape 자동 업데이트
    modelState.nodes = updateModelShapes(modelState.nodes, modelState.edges)
  },

  onSelectionChange: (params: { nodes: FlowNode[] }) => {
    modelState.selectedNodeId = params.nodes[0]?.id || null
    console.log('🔍 Node selected:', modelState.selectedNodeId)
  },

  /**
   * 노드 선택
   */
  selectNode: (nodeId: string) => {
    modelState.selectedNodeId = nodeId
    console.log('🔍 Node selected manually:', nodeId)
  },

  /**
   * 시각화 노드 추가
   */
  addVisualizationNode: (sourceNodeId: string, position: { x: number; y: number }, visualizationConfig?: any) => {
    const nodeId = `viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 소스 노드 위치 기준으로 시각화 노드 위치 계산
    const sourceNode = modelState.nodes.find(node => node.id === sourceNodeId)
    const calculatedPosition = sourceNode ? {
      x: sourceNode.position.x + 350,
      y: sourceNode.position.y
    } : position
    
    const node: FlowNode = {
      id: nodeId,
      type: 'visualization',
      position: calculatedPosition,
      data: {
        label: visualizationConfig?.title || '데이터 시각화',
        sourceNodeId,
        mode: visualizationConfig?.type || 'table',
        isExpanded: false,
        visualizationConfig,
      },
    }

    // 연결 엣지 추가
    const edge: FlowEdge = {
      id: edgeId,
      source: sourceNodeId,
      target: nodeId,
      type: 'default',
    }

    modelState.nodes.push(node)
    modelState.edges.push(edge)
    console.log(`✅ Visualization node added: ${node.id} for source: ${sourceNodeId}`)
    console.log(`✅ Edge added: ${sourceNodeId} -> ${nodeId}`)
  },

  // === 노드 관리 ===

  /**
   * 통합 모델 노드 추가
   */
  addModelNode: (modelType: string, position: { x: number; y: number }) => {
    console.log(`🔧 Adding model node: ${modelType}`)
    const nodeId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const node: FlowNode = {
      id: nodeId,
      type: 'model',
      position,
      draggable: true,
      selectable: true,
      data: {
        label: '신경망 모델',
        modelType,
        state: 'definition'
      },
    }

    modelState.nodes.push(node)
    console.log(`✅ Model node added: ${node.id} (${modelType})`)
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
      draggable: true,
      selectable: true,
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
   * 모델 노드 데이터 업데이트
   */
  updateModelNodeData: (modelId: string, updates: any) => {
    const nodeIndex = modelState.nodes.findIndex(node => node.data?.modelId === modelId)
    if (nodeIndex !== -1) {
      modelState.nodes[nodeIndex] = {
        ...modelState.nodes[nodeIndex],
        data: {
          ...modelState.nodes[nodeIndex].data,
          ...updates
        }
      }
    }
  },

  /**
   * 노드 데이터 업데이트 (일반적인 노드용)
   */
  updateNodeData: (nodeId: string, updates: any) => {
    const nodeIndex = modelState.nodes.findIndex(node => node.id === nodeId)
    if (nodeIndex !== -1) {
      modelState.nodes[nodeIndex] = {
        ...modelState.nodes[nodeIndex],
        data: {
          ...modelState.nodes[nodeIndex].data,
          ...updates
        }
      }
    }
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

import { proxy, useSnapshot } from 'valtio'
import { NodeChange, EdgeChange, Connection, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow'
import { FlowNode, FlowEdge } from '@/types'
import { ModelRegistry } from '@/models/ModelRegistry'
import { NodeRegistry } from '@/components/nodes/NodeRegistry'

/**
 * 새로운 모델 상태 인터페이스
 */
interface NewModelState {
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
 * 새로운 모델 상태 (Valtio proxy)
 */
const newModelState = proxy<NewModelState>({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  modelInstances: new Map(),
  isLoading: false,
  error: null
})

/**
 * 새로운 모델 스토어
 */
export const newModelStore = {
  // === React Flow 이벤트 핸들러 ===
  
  onNodesChange: (changes: NodeChange[]) => {
    newModelState.nodes = applyNodeChanges(changes, newModelState.nodes)
  },
  
  onEdgesChange: (changes: EdgeChange[]) => {
    newModelState.edges = applyEdgeChanges(changes, newModelState.edges)
  },
  
  onConnect: (connection: Connection) => {
    newModelState.edges = addEdge(connection, newModelState.edges)
  },
  
  onSelectionChange: (params: { nodes: FlowNode[] }) => {
    newModelState.selectedNodeId = params.nodes[0]?.id || null
  },
  
  // === 노드 관리 ===
  
  /**
   * 모델 노드 추가
   */
  addModelNode: (modelType: string, position: { x: number; y: number }) => {
    try {
      const node = NodeRegistry.createModelNode(modelType, position)
      newModelState.nodes.push(node)
      
      // 모델 인스턴스 저장
      if (node.model) {
        newModelState.modelInstances.set(node.data.modelId, node.model)
      }
      
      console.log(`✅ Model node added: ${node.id}`)
    } catch (error) {
      console.error(`❌ Failed to add model node: ${error}`)
      newModelState.error = `Failed to add model node: ${error}`
    }
  },
  
  /**
   * 학습 노드 추가
   */
  addTrainingNode: (modelType: string, position: { x: number; y: number }, modelId: string) => {
    try {
      const node = NodeRegistry.createTrainingNode(modelType, position, modelId)
      newModelState.nodes.push(node)
      
      console.log(`✅ Training node added: ${node.id}`)
    } catch (error) {
      console.error(`❌ Failed to add training node: ${error}`)
      newModelState.error = `Failed to add training node: ${error}`
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
        outputShape: [1]
      }
    }
    
    newModelState.nodes.push(node)
    console.log(`✅ Data node added: ${node.id}`)
  },
  
  /**
   * 노드 제거
   */
  removeNode: (nodeId: string) => {
    // 노드 제거
    newModelState.nodes = newModelState.nodes.filter(node => node.id !== nodeId)
    
    // 관련 엣지 제거
    newModelState.edges = newModelState.edges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    )
    
    // 모델 인스턴스 정리
    const node = newModelState.nodes.find(n => n.id === nodeId)
    if (node?.data?.modelId) {
      const model = newModelState.modelInstances.get(node.data.modelId)
      if (model && typeof model.dispose === 'function') {
        model.dispose()
      }
      newModelState.modelInstances.delete(node.data.modelId)
    }
    
    console.log(`🗑️ Node removed: ${nodeId}`)
  },
  
  /**
   * 모든 노드 제거
   */
  clearAll: () => {
    // 모든 모델 인스턴스 정리
    newModelState.modelInstances.forEach(model => {
      if (model && typeof model.dispose === 'function') {
        model.dispose()
      }
    })
    
    newModelState.nodes = []
    newModelState.edges = []
    newModelState.modelInstances.clear()
    newModelState.selectedNodeId = null
    newModelState.error = null
    
    console.log('🧹 All nodes cleared')
  },
  
  // === 모델 관리 ===
  
  /**
   * 모델 인스턴스 가져오기
   */
  getModelInstance: (modelId: string) => {
    return newModelState.modelInstances.get(modelId)
  },
  
  /**
   * 등록된 모델 타입 가져오기
   */
  getAvailableModelTypes: () => {
    return ModelRegistry.getRegisteredTypes()
  },
  
  /**
   * 노드 컴포넌트 타입 맵 가져오기
   */
  getNodeTypes: () => {
    return {
      ...NodeRegistry.createNodeTypes(),
      'data': () => import('@/components/nodes/DataNode').then(m => m.default)
    }
  },
  
  // === React Flow 이벤트 핸들러 ===
  
  /**
   * 노드 변경 핸들러
   */
  onNodesChange: (changes: any[]) => {
    // React Flow의 노드 변경 처리
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        const nodeIndex = newModelState.nodes.findIndex(n => n.id === change.id)
        if (nodeIndex !== -1) {
          newModelState.nodes[nodeIndex].position = change.position
        }
      } else if (change.type === 'remove') {
        newModelState.nodes = newModelState.nodes.filter(n => n.id !== change.id)
      }
    })
  },
  
  /**
   * 엣지 변경 핸들러
   */
  onEdgesChange: (changes: any[]) => {
    // React Flow의 엣지 변경 처리
    changes.forEach(change => {
      if (change.type === 'remove') {
        newModelState.edges = newModelState.edges.filter(e => e.id !== change.id)
      }
    })
  },
  
  /**
   * 연결 핸들러
   */
  onConnect: (connection: any) => {
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'default'
    }
    newModelState.edges.push(newEdge)
  },
  
  /**
   * 선택 변경 핸들러
   */
  onSelectionChange: (params: any) => {
    if (params.nodes && params.nodes.length > 0) {
      newModelState.selectedNodeId = params.nodes[0].id
    } else {
      newModelState.selectedNodeId = null
    }
  },
  
  /**
   * 노드 클릭 핸들러
   */
  onNodeClick: (event: any, node: any) => {
    newModelState.selectedNodeId = node.id
  },
  
  // === 유틸리티 ===
  
  /**
   * 상태 스냅샷 가져오기
   */
  getSnapshot: () => useSnapshot(newModelState),
  
  /**
   * 디버그 정보
   */
  getDebugInfo: () => ({
    nodeCount: newModelState.nodes.length,
    edgeCount: newModelState.edges.length,
    modelInstanceCount: newModelState.modelInstances.size,
    registeredModelTypes: ModelRegistry.getRegisteredTypes(),
    registeredNodeTypes: NodeRegistry.getRegisteredTypes()
  })
}

/**
 * React Hook for using the model store
 */
export const useModelStore = () => {
  const snapshot = useSnapshot(newModelState)
  return {
    ...snapshot,
    ...newModelStore
  }
}

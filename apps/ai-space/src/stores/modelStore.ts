import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { mutative } from 'zustand-mutative'
import { Connection, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import { AppNode, AppEdge, AppNodeChange, AppEdgeChange } from '@/types/AppNodes'
import { updateModelShapes } from '@/utils/modelShapeInference'

/**
 * 모델 상태 인터페이스
 */
interface ModelState {
  // React Flow 상태
  nodes: AppNode[]
  edges: AppEdge[]
  selectedNodeId: string | null

  // 모델 인스턴스 관리 (일반 객체 사용)
  modelInstances: Record<string, any>

  // UI 상태
  isLoading: boolean
  error: string | null
}

/**
 * 모델 액션 인터페이스
 */
interface ModelActions {
  // === React Flow 이벤트 핸들러 ===
  onNodesChange: (changes: AppNodeChange[]) => void
  onEdgesChange: (changes: AppEdgeChange[]) => void
  onConnect: (connection: Connection) => void
  onSelectionChange: (params: { nodes: AppNode[]; edges: AppEdge[] }) => void

  // === 노드 관리 ===
  addDataNode: (position: { x: number; y: number }) => void
  addModelNode: (modelType: string, position: { x: number; y: number }) => void
  addVisualizationNode: (position: { x: number; y: number }) => void
  updateNodeData: (nodeId: string, data: Partial<any>) => void
  setSelectedNode: (nodeId: string | null) => void
  
  // === 캐시 관리 ===
  invalidateModelCache: (nodeId: string) => void
  invalidateAllModelCaches: () => void
  getConnectedDataInfo: (modelId: string) => any

  // === 모델 인스턴스 관리 ===
  setModelInstance: (nodeId: string, instance: any) => void
  getModelInstance: (nodeId: string) => any
  clearModelInstance: (nodeId: string) => void

  // === UI 상태 ===
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // === 유틸리티 ===
  getStats: () => {
    nodeCount: number
    edgeCount: number
    modelInstanceCount: number
    registeredModelTypes: string[]
    registeredNodeTypes: string[]
  }
}

type ModelStore = ModelState & ModelActions

/**
 * 모델 스토어
 */
export const useModelStore = create<ModelStore>()(
  devtools(
    subscribeWithSelector(
      mutative((set, get) => ({
        // === 초기 상태 ===
        nodes: [],
        edges: [],
        selectedNodeId: null,
        modelInstances: {},
        isLoading: false,
        error: null,

        // === React Flow 이벤트 핸들러 ===
        onNodesChange: (changes: AppNodeChange[]) => {
          set((state) => {
            // 삭제되는 노드들의 리소스 정리
            changes.forEach((change) => {
              if (change.type === 'remove') {
                const nodeToRemove = state.nodes.find((node) => node.id === change.id)
                if (nodeToRemove) {
                  // 데이터 노드의 경우 데이터셋 정리
                  if (nodeToRemove.type === 'data' && nodeToRemove.data.dataset) {
                    try {
                      if (typeof nodeToRemove.data.dataset.dispose === 'function') {
                        nodeToRemove.data.dataset.dispose()
                        console.log(`🧹 Disposed dataset for removed node: ${change.id}`)
                      }
                    } catch (error) {
                      console.warn('Failed to dispose dataset:', error)
                    }
                  }

                  // 모델 인스턴스 정리
                  if (state.modelInstances[change.id]) {
                    const modelInstance = state.modelInstances[change.id]
                    if (modelInstance && typeof modelInstance.dispose === 'function') {
                      try {
                        modelInstance.dispose()
                        console.log(`🧹 Disposed model instance for removed node: ${change.id}`)
                      } catch (error) {
                        console.warn('Failed to dispose model instance:', error)
                      }
                    }
                  }
                }
              }
            })

            state.nodes = applyNodeChanges(changes, state.nodes)
            state.nodes = updateModelShapes(state.nodes, state.edges)

            // 삭제된 노드들의 모델 인스턴스 제거
            changes.forEach((change) => {
              if (change.type === 'remove') {
                delete state.modelInstances[change.id]
              }
            })
          })
        },

        onEdgesChange: (changes: AppEdgeChange[]) => {
          set((state) => {
            // 연결이 변경되는 모델들의 캐시 무효화
            changes.forEach((change) => {
              if (change.type === 'remove') {
                // 삭제되는 엣지와 연결된 모델의 캐시 무효화
                const edge = state.edges.find(e => e.id === change.id)
                if (edge) {
                  const targetModelIndex = state.nodes.findIndex(n => n.id === edge.target && n.type === 'model')
                  if (targetModelIndex !== -1) {
                    state.nodes[targetModelIndex].data.connectedDataNode = undefined
                    state.nodes[targetModelIndex].data.dataNodeId = undefined
                    console.log(`🗑️ Invalidated cache for model: ${edge.target} due to edge removal`)
                  }
                }
              }
            })
            
            state.edges = applyEdgeChanges(changes, state.edges)
            state.nodes = updateModelShapes(state.nodes, state.edges)
          })
        },

        onConnect: (connection: Connection) => {
          set((state) => {
            // 새로운 연결이 생성되는 경우 대상 모델의 캐시 무효화
            if (connection.target) {
              const targetModelIndex = state.nodes.findIndex(n => n.id === connection.target && n.type === 'model')
              if (targetModelIndex !== -1) {
                state.nodes[targetModelIndex].data.connectedDataNode = undefined
                state.nodes[targetModelIndex].data.dataNodeId = undefined
                console.log(`🔄 Invalidated cache for model: ${connection.target} due to new connection`)
              }
            }
            
            state.edges = addEdge(connection, state.edges)
            state.nodes = updateModelShapes(state.nodes, state.edges)
          })
        },


        onSelectionChange: ({ nodes: selectedNodes }) => {
          set((state) => {
            state.selectedNodeId = selectedNodes.length === 1 ? selectedNodes[0].id : null
          })
        },

        // === 노드 관리 ===
        addDataNode: (position) => {
          const newNode: AppNode = {
            id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'data',
            position,
            data: {
              label: '데이터',
              samples: 0,
              inputFeatures: 0,
              outputFeatures: 0,
              dataType: 'unknown',
            },
          }

          set((state) => {
            state.nodes.push(newNode)
          })
        },

        addModelNode: (modelType, position) => {
          // 기본 dense 레이어 두 개 생성
          const defaultLayers = [
            {
              type: 'dense' as const,
              units: 64,
              activation: 'relu',
            },
            {
              type: 'dense' as const,
              units: 1,
              activation: 'linear',
            },
          ]

          const newNode: AppNode = {
            id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'model',
            position,
            data: {
              label: `${modelType} 모델`,
              modelType,
              modelId: `nn_model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              state: 'definition',
              layers: defaultLayers,
              inputShape: [1],
              outputUnits: 1,
            },
          }

          set((state) => {
            state.nodes.push(newNode)
          })
        },

        addVisualizationNode: (position) => {
          const newNode: AppNode = {
            id: `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'visualization',
            position,
            data: {
              label: '시각화',
              type: 'weights',
            },
          }

          set((state) => {
            state.nodes.push(newNode)
          })
        },

        updateNodeData: (nodeId, data) => {
          set((state) => {
            const nodeIndex = state.nodes.findIndex((node) => node.id === nodeId)
            if (nodeIndex !== -1) {
              const node = state.nodes[nodeIndex]
              
              // 데이터 노드의 중요한 속성이 변경된 경우 연결된 모델들의 캐시 무효화
              if (node.type === 'data' && (data.selectedPresetId || data.dataset)) {
                // 이 데이터 노드에 연결된 모든 모델 찾기
                const connectedModelIds = state.edges
                  .filter(edge => edge.source === nodeId)
                  .map(edge => edge.target)
                
                // 연결된 모델들의 캐시 무효화
                connectedModelIds.forEach(modelId => {
                  const modelIndex = state.nodes.findIndex(n => n.id === modelId && n.type === 'model')
                  if (modelIndex !== -1) {
                    state.nodes[modelIndex].data.connectedDataNode = undefined
                    state.nodes[modelIndex].data.dataNodeId = undefined
                    console.log(`🔄 Invalidated cache for model: ${modelId} due to data node update`)
                  }
                })
              }
              
              // mutative를 사용하므로 직접 수정 가능
              Object.assign(state.nodes[nodeIndex].data, data)
              
              // 모델 shape 업데이트
              state.nodes = updateModelShapes(state.nodes, state.edges)
            }
          })
        },

        setSelectedNode: (nodeId) => {
          set((state) => {
            state.selectedNodeId = nodeId
          })
        },

        // === 모델 인스턴스 관리 ===
        setModelInstance: (nodeId, instance) => {
          set((state) => {
            state.modelInstances[nodeId] = instance
          })
        },

        getModelInstance: (nodeId) => {
          return get().modelInstances[nodeId]
        },

        clearModelInstance: (nodeId) => {
          set((state) => {
            const instance = state.modelInstances[nodeId]
            if (instance && typeof instance.dispose === 'function') {
              try {
                instance.dispose()
                console.log(`🧹 Disposed model instance: ${nodeId}`)
              } catch (error) {
                console.warn('Failed to dispose model instance:', error)
              }
            }

            delete state.modelInstances[nodeId]
          })
        },

        // === UI 상태 ===
        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading
          })
        },

        setError: (error) => {
          set((state) => {
            state.error = error
          })
        },

        // === 유틸리티 ===
        // === 캐시 관리 ===
        invalidateModelCache: (nodeId) => {
          set((state) => {
            const nodeIndex = state.nodes.findIndex(node => node.id === nodeId && node.type === 'model')
            if (nodeIndex !== -1) {
              state.nodes[nodeIndex].data.connectedDataNode = undefined
              state.nodes[nodeIndex].data.dataNodeId = undefined
              state.nodes[nodeIndex].data.shapeLastUpdated = undefined
              console.log(`🗑️ Manual cache invalidation for model: ${nodeId}`)
            }
          })
        },

        invalidateAllModelCaches: () => {
          set((state) => {
            state.nodes.forEach((node, index) => {
              if (node.type === 'model') {
                state.nodes[index].data.connectedDataNode = undefined
                state.nodes[index].data.dataNodeId = undefined
                state.nodes[index].data.shapeLastUpdated = undefined
              }
            })
            console.log(`🗑️ All model caches invalidated`)
            
            // 캐시 무효화 후 재계산
            state.nodes = updateModelShapes(state.nodes, state.edges)
          })
        },

        getConnectedDataInfo: (modelId) => {
          const state = get()
          const modelNode = state.nodes.find(node => node.id === modelId && node.type === 'model')
          return modelNode?.data.connectedDataNode || null
        },

        getStats: () => {
          const state = get()
          const modelsWithCache = state.nodes.filter(node => 
            node.type === 'model' && node.data.connectedDataNode
          ).length
          
          return {
            nodeCount: state.nodes.length,
            edgeCount: state.edges.length,
            modelInstanceCount: Object.keys(state.modelInstances).length,
            modelsWithCache,
            cacheHitRate: state.nodes.length > 0 ? (modelsWithCache / state.nodes.filter(n => n.type === 'model').length) * 100 : 0,
            registeredModelTypes: ['neural-network'],
            registeredNodeTypes: ['model', 'data', 'visualization'],
          }
        },
      }))
    ),
    {
      name: 'ai-space-model-store',
    }
  )
)

/**
 * 스토어의 특정 부분만 구독하는 헬퍼 훅들
 */

// 노드만 구독
export const useNodes = () => useModelStore((state) => state.nodes)

// 엣지만 구독
export const useEdges = () => useModelStore((state) => state.edges)

// 선택된 노드만 구독
export const useSelectedNode = () => {
  const selectedNodeId = useModelStore((state) => state.selectedNodeId)
  const nodes = useModelStore((state) => state.nodes)
  return selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) : null
}

// 로딩 상태만 구독
export const useLoading = () => useModelStore((state) => state.isLoading)

// 에러 상태만 구독
export const useError = () => useModelStore((state) => state.error)

// 연결된 데이터 정보만 구독 (특정 모델)
export const useConnectedData = (modelId: string | null) => {
  return useModelStore((state) => {
    if (!modelId) return null
    const modelNode = state.nodes.find(node => node.id === modelId && node.type === 'model')
    return modelNode?.data.connectedDataNode || null
  })
}

// 캐시 통계 구독
export const useCacheStats = () => {
  return useModelStore((state) => {
    const stats = state.getStats()
    return {
      modelsWithCache: stats.modelsWithCache,
      cacheHitRate: stats.cacheHitRate,
    }
  })
}

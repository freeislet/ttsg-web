import React, { useState, useCallback, createContext, useContext } from 'react'
import Modal from 'react-modal'
import {
  ReactFlowProvider,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  Panel,
} from '@xyflow/react'
import { Flow } from '@/components/Flow'
import {
  Layout,
  Save,
  X,
  Brain,
  Layers,
  Shuffle,
  Droplets,
  Box,
  Zap,
  Hash,
  Eye,
  Grid3x3,
  Minimize2,
  Maximize2,
  Trash2,
} from 'lucide-react'

import LayerNode from './LayerNode'
// import LayerPropertiesPanel from './LayerPropertiesPanel'
import {
  LayerNodeData,
  LayerNodeType,
  DEFAULT_LAYER_CONFIGS,
  DEFAULT_LAYOUT_CONFIG,
} from '@/types/LayerEditor'
import { LayerConfig } from '@/types/ModelNode'

/**
 * 레이어 에디터 Props
 */
interface LayerEditorProps {
  isOpen: boolean
  onClose: () => void
  initialLayers?: LayerConfig[]
  onSave: (layers: LayerConfig[], modelNodeId?: string) => void
  modelNodeId?: string // 어떤 모델 노드의 레이어를 편집하는지 식별
}

/**
 * 레이어 에디터 Context
 */
interface LayerEditorContextType {
  updateNodeData: (nodeId: string, updates: Partial<LayerNodeData>) => void
  connectedNodeIds: string[]
}

const LayerEditorContext = createContext<LayerEditorContextType | null>(null)

export const useLayerEditor = () => {
  const context = useContext(LayerEditorContext)
  if (!context) {
    throw new Error('useLayerEditor must be used within LayerEditorProvider')
  }
  return context
}

/**
 * 노드 타입 정의
 */
const nodeTypes: NodeTypes = {
  layerNode: LayerNode,
  default: LayerNode, // fallback으로도 LayerNode 사용
}

/**
 * 미니맵용 노드 색상 함수
 */
const getNodeColor = (node: Node<LayerNodeData>): string => {
  switch (node.data?.layerType) {
    case 'input':
      return '#10b981'
    case 'output':
      return '#ef4444'
    case 'dense':
      return '#3b82f6'
    case 'conv2d':
      return '#8b5cf6'
    case 'lstm':
      return '#f97316'
    default:
      return '#6b7280'
  }
}

/**
 * 레이어 타입별 아이콘 매핑 (툴바용)
 */
const LAYER_ICONS = {
  dense: Brain,
  conv2d: Layers,
  conv1d: Layers,
  lstm: Shuffle,
  dropout: Droplets,
  flatten: Box,
  batchNorm: Zap,
  layerNorm: Hash,
  attention: Eye,
  embedding: Grid3x3,
  maxPool2d: Minimize2,
  avgPool2d: Minimize2,
  globalMaxPool2d: Maximize2,
  globalAvgPool2d: Maximize2,
}

/**
 * 레이어 에디터 컴포넌트
 */
const LayerEditor: React.FC<LayerEditorProps> = ({ isOpen, onClose, initialLayers = [], onSave, modelNodeId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<LayerNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [nextNodeId, setNextNodeId] = useState(1)

  /**
   * 에디터 초기화
   */
  const initializeEditor = useCallback(() => {
    const initialNodes: Node<LayerNodeData>[] = [
      // 입력 노드
      {
        id: 'input',
        type: 'layerNode',
        position: { x: 0, y: 0 },
        data: {
          ...DEFAULT_LAYER_CONFIGS.input,
          label: '입력',
          layerType: 'input',
        },
      },
      // 출력 노드
      {
        id: 'output',
        type: 'layerNode',
        position: { x: 0, y: 600 },
        data: {
          ...DEFAULT_LAYER_CONFIGS.output,
          label: '출력',
          layerType: 'output',
        },
      },
    ]

    // 기존 레이어가 있다면 변환해서 추가
    if (initialLayers.length > 0) {
      const layerNodes = initialLayers.map((layer, index) => ({
        id: `layer-${index}`,
        type: 'layerNode' as const,
        position: { x: 0, y: index * 150 },
        data: {
          label: layer.type.charAt(0).toUpperCase() + layer.type.slice(1),
          layerType: layer.type as LayerNodeType,
          units: layer.units,
          activation: layer.activation,
          filters: layer.filters,
          kernelSize: layer.kernelSize,
          rate: layer.rate,
          layerIndex: index,
        },
      }))

      initialNodes.splice(1, 0, ...layerNodes)

      // 자동 연결 생성
      const initialEdges: Edge[] = []
      for (let i = 0; i < initialNodes.length - 1; i++) {
        initialEdges.push({
          id: `edge-${i}`,
          source: initialNodes[i].id,
          target: initialNodes[i + 1].id,
          type: 'smoothstep',
        })
      }
      setEdges(initialEdges)
      setNextNodeId(initialLayers.length + 1)
    }

    setNodes(initialNodes)
  }, [initialLayers])

  // 초기 레이어 설정 (입력/출력 노드 포함)
  React.useEffect(() => {
    if (isOpen && nodes.length === 0) {
      initializeEditor()
    }
  }, [isOpen, nodes.length, initializeEditor])

  /**
   * 새 레이어 추가
   */
  const addLayer = useCallback(
    (layerType: LayerNodeType) => {
      const defaultConfig = DEFAULT_LAYER_CONFIGS[layerType]
      const newNode: Node<LayerNodeData> = {
        id: `layer-${nextNodeId}`,
        type: 'layerNode',
        position: { x: 0, y: nextNodeId * 150 },
        data: {
          label: defaultConfig.label || layerType,
          layerType: defaultConfig.layerType || layerType,
          ...defaultConfig,
          layerIndex: nextNodeId,
        },
      }

      setNodes((nds) => [...nds, newNode])
      setNextNodeId((id) => id + 1)
    },
    [nextNodeId, setNodes]
  )

  /**
   * 노드 데이터 업데이트
   */
  const updateNodeData = useCallback(
    (nodeId: string, updates: Partial<LayerNodeData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...updates,
                },
              }
            : node
        )
      )
    },
    [setNodes]
  )

  /**
   * 레이어 삭제
   */
  const removeLayer = useCallback(
    (nodeId: string) => {
      // 입력/출력 노드는 삭제 불가
      if (nodeId === 'input' || nodeId === 'output') return

      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))

      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null)
      }
    },
    [setNodes, setEdges, selectedNodeId]
  )

  /**
   * 연결 생성
   */
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds))
    },
    [setEdges]
  )

  /**
   * 노드 선택
   */
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<LayerNodeData>) => {
    setSelectedNodeId(node.id)
  }, [])

  /**
   * 자동 레이아웃
   */
  const autoLayout = useCallback(() => {
    const config = DEFAULT_LAYOUT_CONFIG

    setNodes((nds) => {
      const sortedNodes = [...nds].sort((a, b) => {
        if (a.id === 'input') return -1
        if (b.id === 'input') return 1
        if (a.id === 'output') return 1
        if (b.id === 'output') return -1
        return (
          ((a.data as LayerNodeData).layerIndex || 0) - ((b.data as LayerNodeData).layerIndex || 0)
        )
      })

      return sortedNodes.map((node, index) => ({
        ...node,
        position: {
          x: config.startX,
          y: config.startY + index * config.layerSpacing,
        },
      }))
    })
  }, [setNodes])

  /**
   * input 노드로부터 연결된 레이어들을 순서대로 추출
   */
  const getConnectedLayers = useCallback((): string[] => {
    const connectedNodeIds: string[] = []
    const visitedNodes = new Set<string>()
    
    // input 노드부터 시작하여 연결된 노드들을 순회
    const traverseFromNode = (nodeId: string) => {
      if (visitedNodes.has(nodeId)) return
      visitedNodes.add(nodeId)
      
      // 현재 노드가 input이 아니고 output이 아닌 경우에만 추가
      const currentNode = nodes.find(n => n.id === nodeId)
      if (currentNode && currentNode.data.layerType !== 'input' && currentNode.data.layerType !== 'output') {
        connectedNodeIds.push(nodeId)
      }
      
      // 현재 노드에서 나가는 엣지들을 찾아서 다음 노드로 이동
      const outgoingEdges = edges.filter(edge => edge.source === nodeId)
      outgoingEdges.forEach(edge => {
        traverseFromNode(edge.target)
      })
    }
    
    // input 노드부터 시작
    traverseFromNode('input')
    return connectedNodeIds
  }, [nodes, edges])

  /**
   * 레이어 설정을 LayerConfig 배열로 변환 (연결된 레이어만)
   */
  const exportLayers = useCallback((): LayerConfig[] => {
    const connectedLayerIds = getConnectedLayers()
    
    // 연결된 레이어들만 필터링하고 연결 순서대로 정렬
    const connectedLayerNodes = connectedLayerIds
      .map(id => nodes.find(node => node.id === id))
      .filter(node => node !== undefined) as Node<LayerNodeData>[]

    return connectedLayerNodes.map((node) => {
      const data = node.data
      const config: LayerConfig = {
        type: data.layerType as any,
      }

      if (data.units) config.units = data.units
      if (data.activation) config.activation = data.activation
      if (data.filters) config.filters = data.filters
      if (data.kernelSize) config.kernelSize = data.kernelSize
      if (data.rate) config.rate = data.rate
      if (data.padding) config.padding = data.padding

      return config
    })
  }, [nodes, getConnectedLayers])

  /**
   * 저장 및 닫기
   */
  const handleSave = useCallback(() => {
    const layers = exportLayers()
    onSave(layers, modelNodeId)
    onClose()
  }, [exportLayers, onSave, onClose, modelNodeId])


  /**
   * 키보드 이벤트 핸들러 (이벤트 전파 차단)
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // 모든 키보드 이벤트의 전파를 차단하여 부모 컴포넌트로 전달되지 않도록 함
    e.stopPropagation()
    
    // ESC 키는 모달 닫기로 처리
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  /**
   * Modal이 열릴 때 포커스 설정
   */
  React.useEffect(() => {
    if (isOpen) {
      // 약간의 지연 후 포커스 설정 (Modal 렌더링 완료 대기)
      setTimeout(() => {
        const modalElement = document.querySelector('[data-layer-editor-modal]') as HTMLElement
        if (modalElement) {
          modalElement.focus()
        }
      }, 100)
    }
  }, [isOpen])

  return (
    <ReactFlowProvider>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={false}
        className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] flex flex-col outline-none"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        ariaHideApp={false}
      >
        <div 
          className="flex flex-col h-full"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          style={{ outline: 'none' }}
          data-layer-editor-modal
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">레이어 구성 에디터</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={autoLayout}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
            >
              <Layout className="w-4 h-4" />
              자동 배치
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <LayerEditorContext.Provider value={{ updateNodeData, connectedNodeIds: getConnectedLayers() }}>
          <div className="flex flex-1 overflow-hidden">
            {/* 레이어 팔레트 */}
            <div className="w-48 border-r border-gray-200 bg-gray-50 overflow-y-auto">
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-700">레이어 추가</h3>
                <div className="space-y-2">
                  {Object.entries(LAYER_ICONS).map(([layerType, Icon]) => (
                    <button
                      key={layerType}
                      onClick={() => addLayer(layerType as LayerNodeType)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300"
                    >
                      <Icon className="w-4 h-4" />
                      {layerType.charAt(0).toUpperCase() + layerType.slice(1)}
                    </button>
                  ))}
                </div>
                
                {/* 연결 상태 표시 */}
                <div className="mt-4 pt-3 border-t border-gray-300">
                  <h4 className="text-xs font-medium text-gray-600 mb-2">연결 상태</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>연결됨</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>연결되지 않음</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    저장 시 연결된 레이어만 모델에 적용됩니다.
                  </div>
                </div>
              </div>
            </div>

            {/* Flow 에디터 */}
            <div className="flex-1 relative">
              <Flow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                nodeColor={getNodeColor}
                className="bg-gray-50"
                fitView
              >
                {/* 레이어 삭제 패널 */}
                {selectedNodeId && selectedNodeId !== 'input' && selectedNodeId !== 'output' && (
                  <Panel position="top-right" className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                    <button
                      onClick={() => {
                        removeLayer(selectedNodeId)
                        setSelectedNodeId(null)
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      title="선택된 레이어 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                      레이어 삭제
                    </button>
                  </Panel>
                )}
              </Flow>
            </div>

          </div>
        </LayerEditorContext.Provider>
        </div>
      </Modal>
    </ReactFlowProvider>
  )
}

export default LayerEditor

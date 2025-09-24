import React, { useState, useCallback, useMemo } from 'react'
import Modal from 'react-modal'
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
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
  onSave: (layers: LayerConfig[]) => void
}

/**
 * 노드 타입 정의
 */
const nodeTypes: NodeTypes = {
  layerNode: LayerNode,
  default: LayerNode, // fallback으로도 LayerNode 사용
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
const LayerEditor: React.FC<LayerEditorProps> = ({
  isOpen,
  onClose,
  initialLayers = [],
  onSave,
}) => {
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
        position: { x: 50, y: 200 },
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
        position: { x: 600, y: 200 },
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
        position: { x: 200 + index * 150, y: 200 },
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
        position: { x: 300 + nextNodeId * 50, y: 200 + nextNodeId * 20 },
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
          x: config.startX + index * config.nodeSpacing,
          y: config.startY,
        },
      }))
    })
  }, [setNodes])

  /**
   * 레이어 설정을 LayerConfig 배열로 변환
   */
  const exportLayers = useCallback((): LayerConfig[] => {
    const layerNodes = nodes
      .filter((node) => node.data.layerType !== 'input' && node.data.layerType !== 'output')
      .sort((a, b) => (a.data.layerIndex || 0) - (b.data.layerIndex || 0))

    return layerNodes.map((node) => {
      const data = node.data
      const config: LayerConfig = {
        type: data.layerType as any,
      }

      if (data.units) config.units = data.units
      if (data.activation) config.activation = data.activation
      if (data.filters) config.filters = data.filters
      if (data.kernelSize) config.kernelSize = data.kernelSize
      if (data.rate) config.rate = data.rate

      return config
    })
  }, [nodes])

  /**
   * 저장 및 닫기
   */
  const handleSave = useCallback(() => {
    const layers = exportLayers()
    onSave(layers)
    onClose()
  }, [exportLayers, onSave, onClose])

  /**
   * 선택된 노드 데이터
   */
  const selectedNode = useMemo(() => {
    return selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) : null
  }, [selectedNodeId, nodes])

  return (
    <ReactFlowProvider>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] flex flex-col outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        ariaHideApp={false}
        style={{
          content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            border: 'none',
            padding: 0,
            margin: 0,
          },
        }}
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
            </div>
          </div>

          {/* React Flow 에디터 */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              className="bg-gray-50"
            >
              <Background />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  switch ((node.data as LayerNodeData)?.layerType) {
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
                }}
                className="bg-white"
              />
            </ReactFlow>
          </div>

          {/* 속성 패널 - 임시로 간단한 정보만 표시 */}
          {selectedNode && (
            <div className="w-80 border-l border-gray-200 bg-white p-4">
              <h3 className="font-medium text-gray-800 mb-2">선택된 레이어</h3>
              <div className="text-sm text-gray-600">
                <div>ID: {selectedNode.id}</div>
                <div>타입: {(selectedNode.data as LayerNodeData)?.layerType || 'unknown'}</div>
                <div>라벨: {(selectedNode.data as LayerNodeData)?.label || 'unnamed'}</div>
              </div>
              {selectedNode.id !== 'input' && selectedNode.id !== 'output' && (
                <button
                  onClick={() => removeLayer(selectedNode.id)}
                  className="mt-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  레이어 삭제
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>
    </ReactFlowProvider>
  )
}

export default LayerEditor

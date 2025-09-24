import React, { useCallback, useMemo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { BarChart3, Eye, Settings, Maximize2 } from 'lucide-react'
import { useModelStore } from '@/stores/modelStore'
import DataInspector from '../DataInspector'
import { VisualizationNodeData } from '@/types/VisualizationNode'

export type { VisualizationNodeData }

/**
 * 데이터 시각화 노드 컴포넌트
 */
const VisualizationNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { selectNode, nodes } = useModelStore()

  // 노드 클릭 핸들러
  const handleClick = useCallback(() => {
    selectNode(id)
  }, [id, selectNode])

  // 소스 노드 찾기
  const sourceNode = useMemo(() => {
    const vizData = data as VisualizationNodeData
    return nodes.find(node => node.id === vizData.sourceNodeId)
  }, [data, nodes])

  // 소스 데이터 가져오기
  const sourceDataset = sourceNode?.data?.dataset


  // 확장/축소 토글
  const handleToggleExpand = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    // TODO: 노드 확장/축소 로직
    console.log('🔧 Toggle expand visualization node')
  }, [])

  const currentMode = (data as VisualizationNodeData).visualizationMode || 'table'
  const isExpanded = (data as VisualizationNodeData).showDataTable || false

  return (
    <div
      className={`
        relative rounded-lg border-2 shadow-lg transition-all duration-200
        ${selected ? 'border-blue-400 ring-2 ring-blue-400 ring-opacity-50' : 'border-purple-300'}
        ${isExpanded ? 'min-w-[600px] max-w-[800px]' : 'min-w-[300px] max-w-[400px]'}
        bg-gradient-to-br from-purple-50 to-indigo-50
        hover:shadow-xl cursor-pointer
      `}
      onClick={handleClick}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="p-3 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-800">{(data as VisualizationNodeData).label}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleExpand}
              className="p-1 rounded hover:bg-purple-100 transition-colors"
              title={isExpanded ? "축소" : "확장"}
            >
              <Maximize2 className="w-4 h-4 text-purple-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                console.log('🔧 Visualization settings')
              }}
              className="p-1 rounded hover:bg-purple-100 transition-colors"
              title="설정"
            >
              <Settings className="w-4 h-4 text-purple-600" />
            </button>
          </div>
        </div>
        
        {/* 소스 정보 */}
        <div className="mt-2 text-xs text-gray-600">
          소스: {sourceNode?.data?.label || '연결되지 않음'}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-3">
        {sourceDataset ? (
          <div className={isExpanded ? 'h-96' : 'h-48'}>
            <DataInspector
              dataset={sourceDataset}
              mode={currentMode as any}
              showModeSelector={isExpanded}
              maxRows={isExpanded ? 100 : 20}
              className="h-full"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Eye className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">데이터가 연결되지 않았습니다</p>
              <p className="text-xs text-gray-400 mt-1">
                데이터 노드와 연결하세요
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 상태 표시 */}
      <div className="absolute top-2 right-2">
        <div className={`
          w-2 h-2 rounded-full
          ${sourceDataset ? 'bg-green-500' : 'bg-gray-400'}
        `} />
      </div>
    </div>
  )
}

export default VisualizationNode

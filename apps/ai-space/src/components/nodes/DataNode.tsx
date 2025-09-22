import React, { useCallback } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Database, Eye, BarChart3 } from 'lucide-react'
import { useModelStore } from '@/stores/modelStore'

/**
 * 데이터 노드 데이터 인터페이스
 */
export interface DataNodeData {
  label: string
  samples?: number
  inputFeatures?: number
  outputFeatures?: number
  dataType?: string
  inputShape?: number[]
  outputShape?: number[]
  selectedPresetId?: string
  dataset?: any
}

/**
 * 간소화된 데이터 노드 컴포넌트
 */
const DataNode: React.FC<NodeProps<DataNodeData>> = ({ id, data, selected }) => {
  const { selectNode, addVisualizationNode } = useModelStore()

  // 노드 클릭 핸들러
  const handleClick = useCallback(() => {
    selectNode(id)
  }, [id, selectNode])

  // 시각화 노드 생성 핸들러
  const handleCreateVisualization = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    console.log(`🔍 Creating visualization node for data node: ${id}`)
    // TODO: 시각화 노드 생성 로직
    if (addVisualizationNode) {
      addVisualizationNode(id, { x: 300, y: 0 })
    }
  }, [id, addVisualizationNode])

  // 데이터 상태 확인
  const hasData = data.selectedPresetId && data.dataset
  const sampleCount = data.samples || 0
  const inputCount = data.inputFeatures || 0
  const outputCount = data.outputFeatures || 0

  return (
    <div
      className={`
        relative min-w-[200px] max-w-[280px] rounded-lg border-2 shadow-lg transition-all duration-200
        ${selected ? 'border-blue-400 ring-2 ring-blue-400 ring-opacity-50' : 'border-yellow-300'}
        ${hasData ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gradient-to-br from-gray-50 to-gray-100'}
        hover:shadow-xl hover:scale-105 cursor-pointer
      `}
      onClick={handleClick}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-yellow-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="p-3 border-b border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-gray-800">{data.label}</span>
          </div>
          <div className={`
            w-2 h-2 rounded-full
            ${hasData ? 'bg-green-500' : 'bg-gray-400'}
          `} />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-3 space-y-3">
        {/* 데이터 정보 */}
        {hasData ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">샘플 수:</span>
              <span className="font-medium">{sampleCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">입력 컬럼:</span>
              <span className="font-medium">{inputCount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">출력 컬럼:</span>
              <span className="font-medium">{outputCount}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">데이터셋이 선택되지 않음</p>
            <p className="text-xs text-gray-400 mt-1">속성 패널에서 설정하세요</p>
          </div>
        )}

        {/* 액션 버튼들 */}
        {hasData && (
          <div className="flex gap-2 pt-2 border-t border-yellow-200">
            <button
              onClick={handleCreateVisualization}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="데이터 시각화 노드 생성"
            >
              <BarChart3 className="w-3 h-3" />
              시각화
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                console.log('🔍 Data preview clicked')
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="데이터 미리보기"
            >
              <Eye className="w-3 h-3" />
              미리보기
            </button>
          </div>
        )}
      </div>

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-yellow-500 !border-2 !border-white"
      />
    </div>
  )
}

export default DataNode

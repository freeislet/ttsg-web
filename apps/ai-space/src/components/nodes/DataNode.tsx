import React, { useCallback, useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Database, Eye, BarChart3, RefreshCw } from 'lucide-react'
import { useModelStore } from '@/stores/modelStore'
import { getDataPreset, getDefaultVisualization } from '@/data'
import DatasetSelector from '@/components/DatasetSelector'

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
  const { addVisualizationNode, updateNodeData } = useModelStore()
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(data.selectedPresetId || null)
  const [isLoading, setIsLoading] = useState(false)

  // props 변경 감지하여 로컬 상태 동기화
  useEffect(() => {
    setSelectedPresetId(data.selectedPresetId || null)
  }, [data.selectedPresetId])

  // 시각화 노드 생성 핸들러
  const handleCreateVisualization = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    console.log(`🔍 Creating visualization node for data node: ${id}`)
    
    // 기본 시각화 설정 가져오기
    const defaultVisualization = data.selectedPresetId ? getDefaultVisualization(data.selectedPresetId) : null
    
    if (addVisualizationNode) {
      addVisualizationNode(id, { x: 300, y: 0 }, defaultVisualization)
    }
  }, [id, data.selectedPresetId, addVisualizationNode])

  // 데이터셋 선택 핸들러
  const handleDatasetSelect = useCallback(async (presetId: string | null) => {
    setSelectedPresetId(presetId)
    
    if (!presetId) {
      // 데이터셋 선택 해제
      updateNodeData(id, {
        ...data,
        selectedPresetId: null,
        dataset: null,
        samples: 0,
        inputFeatures: 0,
        outputFeatures: 0
      })
      return
    }

    setIsLoading(true)
    try {
      const preset = getDataPreset(presetId)
      if (preset) {
        const loadedDataset = await preset.loader()
        
        // 노드 데이터 업데이트
        updateNodeData(id, {
          ...data,
          selectedPresetId: presetId,
          dataset: loadedDataset,
          samples: loadedDataset.sampleCount,
          inputFeatures: loadedDataset.inputColumns.length,
          outputFeatures: loadedDataset.outputColumns.length,
          inputShape: loadedDataset.inputShape,
          outputShape: loadedDataset.outputShape
        })
        
        console.log(`✅ Dataset loaded: ${preset.name}`)
      }
    } catch (error) {
      console.error('❌ Failed to load dataset:', error)
    } finally {
      setIsLoading(false)
    }
  }, [id, data, updateNodeData])

  // 데이터 상태 확인
  const hasData = data.selectedPresetId && data.dataset
  const sampleCount = data.samples || 0
  const inputCount = data.inputFeatures || 0
  const outputCount = data.outputFeatures || 0
  const preset = data.selectedPresetId ? getDataPreset(data.selectedPresetId) : null

  return (
    <div
      className={`
        relative min-w-[200px] max-w-[280px] rounded-lg border-2 shadow-lg transition-all duration-200
        ${selected ? 'border-blue-400 ring-2 ring-blue-400 ring-opacity-50' : 'border-yellow-300'}
        ${hasData ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gradient-to-br from-gray-50 to-gray-100'}
        hover:shadow-xl cursor-pointer
      `}
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
        {/* 데이터가 로드된 경우 */}
        {hasData ? (
          <>
            {/* 데이터셋 정보 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-800 mb-2">
                {preset?.name || '데이터셋'}
              </div>
              
              {/* 태그 표시 */}
              {preset?.tags && preset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {preset.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="inline-block px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                      {tag}
                    </span>
                  ))}
                  {preset.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{preset.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* 통계 정보 */}
              <div className="space-y-1">
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
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-2 pt-2 border-t border-yellow-200 nodrag">
              <button
                onClick={handleCreateVisualization}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors nodrag"
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
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors nodrag"
                title="데이터 미리보기"
              >
                <Eye className="w-3 h-3" />
                미리보기
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 데이터셋 선택 UI */}
            <div className="space-y-3 nodrag" onClick={(e) => e.stopPropagation()}>
              <div className="text-sm text-gray-600 mb-2">데이터셋 선택</div>
              <DatasetSelector
                value={selectedPresetId || undefined}
                onChange={handleDatasetSelect}
                placeholder="데이터셋을 선택하세요"
                isDisabled={isLoading}
                className="text-sm nodrag"
              />
              
              {/* 로딩 상태 */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  데이터 로딩 중...
                </div>
              )}
            </div>
          </>
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

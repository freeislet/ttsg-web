import React, { useCallback, useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Database, Eye, BarChart3, RefreshCw, Settings } from 'lucide-react'
import { useModelStore } from '@/stores/modelStore'
import { getDataPreset, getDefaultVisualization } from '@/data'
import DatasetSelector from '@/components/DatasetSelector'

/**
 * 데이터 노드 데이터 인터페이스
 */
import { DataNodeData, DataSplitConfig } from '@/types/DataNode'

export type { DataNodeData }

/**
 * 간소화된 데이터 노드 컴포넌트
 */
const DataNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as DataNodeData
  const { addVisualizationNode, updateNodeData } = useModelStore()
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    nodeData.selectedPresetId || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [showSplitConfig, setShowSplitConfig] = useState(false)

  // 기본 데이터 분할 설정
  const defaultSplitConfig: DataSplitConfig = {
    trainRatio: 0.7,
    validationRatio: 0.2,
    testRatio: 0.1,
  }

  const splitConfig = nodeData.splitConfig || defaultSplitConfig

  // props 변경 감지하여 로컬 상태 동기화
  useEffect(() => {
    setSelectedPresetId(nodeData.selectedPresetId || null)
  }, [nodeData.selectedPresetId])

  // 시각화 노드 생성 핸들러
  const handleCreateVisualization = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      console.log(`🔍 Creating visualization node for data node: ${id}`)

      // 기본 시각화 설정 가져오기
      const defaultVisualization = nodeData.selectedPresetId
        ? getDefaultVisualization(nodeData.selectedPresetId)
        : null

      if (addVisualizationNode) {
        addVisualizationNode(id, { x: 300, y: 0 }, defaultVisualization)
      }
    },
    [id, nodeData.selectedPresetId, addVisualizationNode]
  )

  // 데이터 분할 설정 업데이트 핸들러
  const handleSplitConfigUpdate = useCallback(
    (newConfig: Partial<DataSplitConfig>) => {
      const updatedConfig = { ...splitConfig, ...newConfig }

      // 비율 합이 1이 되도록 자동 조정
      const total =
        updatedConfig.trainRatio + updatedConfig.validationRatio + updatedConfig.testRatio
      if (total !== 1) {
        const factor = 1 / total
        updatedConfig.trainRatio *= factor
        updatedConfig.validationRatio *= factor
        updatedConfig.testRatio *= factor
      }

      updateNodeData(id, {
        ...nodeData,
        splitConfig: updatedConfig,
      })
    },
    [id, nodeData, splitConfig, updateNodeData]
  )

  // 데이터셋 선택 핸들러
  const handleDatasetSelect = useCallback(
    async (presetId: string | null) => {
      setSelectedPresetId(presetId)

      if (!presetId) {
        // 데이터셋 선택 해제
        updateNodeData(id, {
          ...nodeData,
          selectedPresetId: null,
          dataset: null,
          samples: 0,
          inputFeatures: 0,
          outputFeatures: 0,
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
            ...nodeData,
            selectedPresetId: presetId,
            dataset: loadedDataset,
            samples: loadedDataset.sampleCount,
            inputFeatures: loadedDataset.inputColumns.length,
            outputFeatures: loadedDataset.outputColumns.length,
            inputShape: loadedDataset.inputShape,
            outputShape: loadedDataset.outputShape,
          })

          console.log(`✅ Dataset loaded: ${preset.name}`)
        }
      } catch (error) {
        console.error('❌ Failed to load dataset:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [id, nodeData, updateNodeData]
  )

  // 데이터 상태 확인
  const hasData = nodeData.selectedPresetId && nodeData.dataset
  const sampleCount = nodeData.samples || 0
  const inputCount = nodeData.inputFeatures || 0
  const outputCount = nodeData.outputFeatures || 0
  const preset = nodeData.selectedPresetId ? getDataPreset(nodeData.selectedPresetId) : null

  return (
    <div
      className={`
        relative min-w-[200px] max-w-[280px] rounded-lg border-2 shadow-lg transition-all duration-200
        ${selected ? 'border-blue-400 ring-2 ring-blue-400 ring-opacity-50' : 'border-yellow-300'}
        ${hasData ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gradient-to-br from-gray-50 to-gray-100'}
        hover:shadow-xl cursor-pointer
      `}
    >
      {/* 헤더 */}
      <div className="p-3 border-b border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-gray-800">{nodeData.label}</span>
          </div>
          <div
            className={`
            w-2 h-2 rounded-full
            ${hasData ? 'bg-green-500' : 'bg-gray-400'}
          `}
          />
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
                    <span
                      key={tag}
                      className="inline-block px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
                    >
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

              {/* 데이터 분할 설정 */}
              <div className="mt-3 pt-2 border-t border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">데이터 분할</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSplitConfig(!showSplitConfig)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded nodrag"
                    title="분할 설정"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                </div>

                {/* 분할 비율 표시 */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">학습:</span>
                    <span className="font-medium">{Math.round(splitConfig.trainRatio * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">검증:</span>
                    <span className="font-medium">
                      {Math.round(splitConfig.validationRatio * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">테스트:</span>
                    <span className="font-medium">{Math.round(splitConfig.testRatio * 100)}%</span>
                  </div>
                </div>

                {/* 분할 설정 UI */}
                {showSplitConfig && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border space-y-2 nodrag">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600">학습 비율</label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={splitConfig.trainRatio}
                        onChange={(e) =>
                          handleSplitConfigUpdate({ trainRatio: parseFloat(e.target.value) })
                        }
                        className="w-full h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600">검증 비율</label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.5"
                        step="0.05"
                        value={splitConfig.validationRatio}
                        onChange={(e) =>
                          handleSplitConfigUpdate({ validationRatio: parseFloat(e.target.value) })
                        }
                        className="w-full h-1 bg-green-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
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

      {/* 데이터 출력 핸들 */}
      {hasData && (
        <Handle
          type="source"
          position={Position.Right}
          id="data-output"
          className="!bg-yellow-500 !border-2 !border-yellow-600"
          style={{ right: -2 }}
        />
      )}
    </div>
  )
}

export default DataNode

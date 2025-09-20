import React, { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Database, RefreshCw, Eye, BarChart3, Grid3X3, Image } from 'lucide-react'
import { getDataPresets, getDataPreset, IDataset, DataViewMode } from '@/data'
import DataViewer from '../DataViewer'

/**
 * 데이터 노드 상태 인터페이스
 */
export interface DataNodeState {
  selectedPresetId?: string
  dataset?: IDataset
  isLoading: boolean
  error?: string
  viewMode: DataViewMode
}

/**
 * 데이터 노드 데이터 인터페이스
 */
export interface DataNodeData {
  label: string
  state?: DataNodeState
}

/**
 * 데이터 노드 Props
 */
export interface DataNodeProps extends NodeProps<DataNodeData> {
  // 추가 props가 필요한 경우 여기에 정의
}

/**
 * 기본 데이터 노드 상태 생성
 */
const createDefaultDataNodeState = (): DataNodeState => ({
  isLoading: false,
  viewMode: 'table',
})

/**
 * 데이터 노드 컴포넌트
 */
const DataNode: React.FC<DataNodeProps> = ({ data, selected }) => {
  const [localState, setLocalState] = useState<DataNodeState>(
    data.state || createDefaultDataNodeState()
  )
  const [showDataViewer, setShowDataViewer] = useState(false)

  // 프리셋 선택 핸들러
  const handlePresetSelect = (presetId: string) => {
    setLocalState((prev) => ({
      ...prev,
      selectedPresetId: presetId,
      dataset: undefined,
      error: undefined,
    }))
  }

  // 데이터 로드 핸들러
  const handleLoadData = async () => {
    if (!localState.selectedPresetId) {
      setLocalState((prev) => ({ ...prev, error: '데이터셋을 선택해주세요' }))
      return
    }

    setLocalState((prev) => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const preset = getDataPreset(localState.selectedPresetId)
      if (!preset) {
        throw new Error('선택된 데이터셋을 찾을 수 없습니다')
      }

      console.log(`📥 Loading dataset: ${preset.name}`)
      const dataset = await preset.loader()

      setLocalState((prev) => ({
        ...prev,
        dataset,
        isLoading: false,
      }))

      console.log(`✅ Data loaded: ${dataset.sampleCount} samples`)
    } catch (error) {
      console.error('❌ Failed to load data:', error)
      setLocalState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '데이터 로드 실패',
      }))
    }
  }

  // 뷰 모드 변경 핸들러
  const handleViewModeChange = (viewMode: DataViewMode) => {
    setLocalState((prev) => ({ ...prev, viewMode }))
  }

  const hasData = !!localState.dataset
  const dataPresets = getDataPresets()
  const selectedPreset = localState.selectedPresetId
    ? getDataPreset(localState.selectedPresetId)
    : null

  return (
    <div
      className={`
      bg-white border-2 rounded-lg shadow-lg min-w-[320px] max-w-[400px]
      ${selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-300'}
      transition-all duration-200
    `}
    >
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <h3 className="font-semibold text-sm">{data.label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                hasData ? 'bg-green-400' : localState.isLoading ? 'bg-yellow-400' : 'bg-gray-400'
              }`}
            />
            <span className="text-xs opacity-80">
              {selectedPreset ? selectedPreset.category : 'Dataset'}
            </span>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4 space-y-4">
        {/* 데이터셋 선택 */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">데이터셋 선택</h4>
          <select
            value={localState.selectedPresetId || ''}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
          >
            <option value="">데이터셋을 선택하세요</option>
            {dataPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} ({preset.category})
              </option>
            ))}
          </select>

          {/* 선택된 프리셋 정보 */}
          {selectedPreset && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <div className="font-medium text-gray-700">{selectedPreset.name}</div>
              <div className="text-gray-600 mt-1">{selectedPreset.description}</div>
              <div className="flex gap-1 mt-2">
                {selectedPreset.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 데이터 정보 */}
        {hasData && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700">데이터 정보</h4>
              <div className="flex gap-1">
                {(['table', 'chart', 'scatter'] as DataViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    className={`p-1 rounded text-xs ${
                      localState.viewMode === mode
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={mode === 'table' ? '테이블' : mode === 'chart' ? '차트' : '산점도'}
                  >
                    {mode === 'table' ? (
                      <Grid3X3 className="w-3 h-3" />
                    ) : mode === 'chart' ? (
                      <BarChart3 className="w-3 h-3" />
                    ) : (
                      <Image className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">샘플 수:</span>
                <span className="font-mono">
                  {localState.dataset!.sampleCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">입력 형태:</span>
                <span className="font-mono">[{localState.dataset!.inputShape.join(', ')}]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">출력 형태:</span>
                <span className="font-mono">[{localState.dataset!.outputShape.join(', ')}]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">훈련/테스트:</span>
                <span className="font-mono">
                  {localState.dataset!.trainCount}/{localState.dataset!.testCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">입력 컬럼:</span>
                <span className="font-mono text-xs">
                  {localState.dataset!.inputColumns.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">출력 컬럼:</span>
                <span className="font-mono text-xs">
                  {localState.dataset!.outputColumns.join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 오류 표시 */}
        {localState.error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="text-xs text-red-600">{localState.error}</div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleLoadData}
            disabled={localState.isLoading || !localState.selectedPresetId}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${localState.isLoading ? 'animate-spin' : ''}`} />
            {localState.isLoading ? '로딩 중...' : hasData ? '데이터 재로드' : '데이터 로드'}
          </button>

          {hasData && (
            <button
              onClick={() => setShowDataViewer(true)}
              className="px-3 py-2 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        id="data-output"
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ right: -6 }}
      />

      {/* 데이터 뷰어 모달 */}
      {showDataViewer && hasData && (
        <DataViewer
          dataset={localState.dataset!}
          viewMode={localState.viewMode}
          onClose={() => setShowDataViewer(false)}
          onViewModeChange={handleViewModeChange}
        />
      )}
    </div>
  )
}

export default DataNode

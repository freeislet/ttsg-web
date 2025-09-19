import React, { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Database, RefreshCw, Eye } from 'lucide-react'
import { DataNodeState, DataSourceType, Dataset } from '@/types/DataTypes'
import { getDataPresets } from '@/data/presets'
import { loadPresetDataset, loadURLDataset } from '@/data/dataLoader'
import { generateComputedDataset, COMPUTED_FUNCTIONS, getFunctionsByCategory } from '@/data/computedDataGenerator'

/**
 * 통합 데이터 노드 데이터 인터페이스
 */
export interface DataNodeData {
  label: string
  state: DataNodeState
}

/**
 * 훈련 데이터 노드 Props
 */
export interface DataNodeProps extends NodeProps<DataNodeData> {
  // 추가 props가 필요한 경우 여기에 정의
}

/**
 * 기본 데이터 노드 상태 생성
 */
const createDefaultDataNodeState = (): DataNodeState => ({
  config: {
    sourceType: 'preset'
  },
  isLoading: false,
  viewMode: 'table'
})

/**
 * 통합 데이터 노드 컴포넌트
 */
const DataNode: React.FC<DataNodeProps> = ({ data, selected }) => {
  const [localState, setLocalState] = useState<DataNodeState>(
    data.state || createDefaultDataNodeState()
  )
  const [showDataViewer, setShowDataViewer] = useState(false)

  // 데이터 소스 타입 변경 핸들러
  const handleSourceTypeChange = (sourceType: DataSourceType) => {
    setLocalState(prev => ({
      ...prev,
      config: {
        ...(prev.config || {}),
        sourceType
      }
    }))
  }

  // 데이터 로드 핸들러
  const handleLoadData = async () => {
    setLocalState(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      let dataset: Dataset
      
      if (!localState.config) {
        throw new Error('데이터 설정이 없습니다')
      }
      
      switch (localState.config.sourceType) {
        case 'preset':
          if (localState.config.presetConfig) {
            dataset = await loadPresetDataset(localState.config.presetConfig)
          } else {
            throw new Error('프리셋 설정이 없습니다')
          }
          break
          
        case 'url':
          if (localState.config.urlConfig) {
            dataset = await loadURLDataset(localState.config.urlConfig)
          } else {
            throw new Error('URL 설정이 없습니다')
          }
          break
          
        case 'computed':
          if (localState.config.computedConfig) {
            dataset = generateComputedDataset(localState.config.computedConfig)
          } else {
            throw new Error('계산 설정이 없습니다')
          }
          break
          
        default:
          throw new Error('알 수 없는 데이터 소스 타입입니다')
      }
      
      setLocalState(prev => ({
        ...prev,
        dataset,
        isLoading: false
      }))
      
      console.log(`✅ Data loaded: ${dataset.sampleCount} samples`)
      
    } catch (error) {
      console.error('❌ Failed to load data:', error)
      setLocalState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '데이터 로드 실패'
      }))
    }
  }

  const hasData = !!localState.dataset
  const dataPresets = getDataPresets()
  const functionCategories = getFunctionsByCategory()

  return (
    <div className={`
      bg-white border-2 rounded-lg shadow-lg min-w-[320px] max-w-[400px]
      ${selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-300'}
      transition-all duration-200
    `}>
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <h3 className="font-semibold text-sm">{data.label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              hasData ? 'bg-green-400' : localState.isLoading ? 'bg-yellow-400' : 'bg-gray-400'
            }`} />
            <span className="text-xs opacity-80">
              {localState.config?.sourceType === 'preset' ? '프리셋' :
               localState.config?.sourceType === 'url' ? 'URL' : '계산됨'}
            </span>
          </div>
        </div>
      </div>
      
      {/* 본문 */}
      <div className="p-4 space-y-4">
        {/* 데이터 소스 선택 */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">데이터 소스</h4>
          <div className="flex gap-1">
            {(['preset', 'url', 'computed'] as DataSourceType[]).map(type => (
              <button
                key={type}
                onClick={() => handleSourceTypeChange(type)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  localState.config?.sourceType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'preset' ? '프리셋' : type === 'url' ? 'URL' : '계산됨'}
              </button>
            ))}
          </div>
        </div>

        {/* 소스별 설정 UI */}
        {localState.config?.sourceType === 'preset' && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">데이터셋 선택</h4>
            <select
              className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => {
                const preset = dataPresets.find(p => p.id === e.target.value)
                if (preset) {
                  setLocalState(prev => ({
                    ...prev,
                    config: { ...(prev.config || {}), presetConfig: preset }
                  }))
                }
              }}
            >
              <option value="">데이터셋을 선택하세요</option>
              {dataPresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {localState.config?.sourceType === 'computed' && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">함수 선택</h4>
            <div className="space-y-2">
              {Object.entries(functionCategories).map(([category, functions]) => (
                <div key={category}>
                  <div className="text-xs text-gray-500 mb-1 capitalize">{category}</div>
                  <div className="grid grid-cols-2 gap-1">
                    {functions.map(func => (
                      <button
                        key={func}
                        onClick={() => {
                          const funcInfo = COMPUTED_FUNCTIONS[func]
                          setLocalState(prev => ({
                            ...prev,
                            config: {
                              ...(prev.config || {}),
                              computedConfig: {
                                functionType: func,
                                parameters: {
                                  minX: -10,
                                  maxX: 10,
                                  numPoints: 100,
                                  trainSplit: 80,
                                  noiseAmount: 0.001,
                                  ...funcInfo.defaultParams
                                }
                              }
                            }
                          }))
                        }}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          localState.config?.computedConfig?.functionType === func
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {COMPUTED_FUNCTIONS[func].name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 데이터 상태 */}
        {hasData && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-gray-700 mb-2">데이터 정보</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">샘플 수:</span>
                <span className="font-mono">{localState.dataset!.sampleCount.toLocaleString()}</span>
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
            disabled={localState.isLoading}
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
    </div>
  )
}

export default DataNode

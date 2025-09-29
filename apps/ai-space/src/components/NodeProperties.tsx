import React, { useState, useEffect } from 'react'
import { useModelStore } from '@/stores/modelStore'
import {
  Brain,
  Database,
  Trash2,
  Info,
  Settings,
  RefreshCw,
  Target,
  BarChart3,
  Eye,
} from 'lucide-react'
import { dataRegistry } from '@/data'
import DataInspector from './DataInspector'
import DatasetSelector from './DatasetSelector'
import PredictionResultsDisplay from './model-editor/PredictionResultsDisplay'
import { getPredictionConfig } from '@/data/presets'
import { AppNode, DataNode } from '@/types/AppNodes'

/**
 * 데이터 노드 속성 컴포넌트
 */
interface DataNodePropsType {
  nodeId: string
  nodeData: any
}

const DataNodeProperties: React.FC<DataNodePropsType> = ({ nodeId, nodeData }) => {
  const { updateNodeData } = useModelStore()
  const [selectedPresetId, setSelectedPresetId] = useState(nodeData?.selectedPresetId || '')
  const [isLoading, setIsLoading] = useState(false)
  const [dataset, setDataset] = useState(nodeData?.dataset || null)

  // props 변경 감지하여 로컬 상태 동기화
  useEffect(() => {
    setSelectedPresetId(nodeData?.selectedPresetId || '')
    setDataset(nodeData?.dataset || null)
  }, [nodeData?.selectedPresetId, nodeData?.dataset])

  // 데이터셋 선택 및 로드 핸들러
  const handleDatasetSelect = async (presetId: string | null) => {
    setSelectedPresetId(presetId || '')

    if (!presetId) {
      // 데이터셋 선택 해제
      setDataset(null)
      updateNodeData(nodeId, {
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
      const preset = dataRegistry.getById(presetId)
      if (preset) {
        const loadedDataset = await preset.loader()
        setDataset(loadedDataset)

        // 노드 데이터 업데이트
        updateNodeData(nodeId, {
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
  }

  return (
    <div className="space-y-4 text-gray-700">
      {/* 데이터셋 선택 */}
      <div className="bg-yellow-50 rounded-lg p-3">
        <h4 className="text-sm font-semibold mb-3">데이터셋 선택</h4>

        <div className="space-y-3">
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
      </div>

      {/* 데이터 정보 */}
      {dataset && (
        <div className="bg-yellow-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold mb-2">데이터 정보</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>샘플 수:</span>
              <span>{dataset.sampleCount?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>입력 컬럼:</span>
              <span>{dataset.inputColumns?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>출력 컬럼:</span>
              <span>{dataset.outputColumns?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>입력 Shape:</span>
              <span className="font-mono text-xs">[{dataset.inputShape?.join(', ') || ''}]</span>
            </div>
            <div className="flex justify-between">
              <span>출력 Shape:</span>
              <span className="font-mono text-xs">[{dataset.outputShape?.join(', ') || ''}]</span>
            </div>
          </div>
        </div>
      )}

      {/* 데이터 미리보기 */}
      {dataset && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-sm font-semibold">데이터 미리보기</h4>
          </div>
          <div className="p-3">
            <DataInspector dataset={dataset} mode="table" showModeSelector={true} maxRows={50} />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 모델 노드 속성 컴포넌트
 */
interface ModelNodePropsType {
  nodeId: string
  nodeData: any
}

const ModelNodeProperties: React.FC<ModelNodePropsType> = ({ nodeId, nodeData }) => {
  const { edges, nodes } = useModelStore()

  // 연결된 데이터 노드 정보 찾기
  const getConnectedDataNodeInfo = () => {
    const incomingEdges = edges.filter(
      (edge) => edge.target === nodeId && edge.targetHandle === 'data-input'
    )

    if (incomingEdges.length === 0) return null

    const connectedDataNode = nodes.find(
      (node) => node.type === 'data' && incomingEdges.some((edge) => edge.source === node.id)
    ) as DataNode | undefined

    return connectedDataNode?.data
  }

  const connectedDataInfo = getConnectedDataNodeInfo()
  const datasetId = connectedDataInfo?.selectedPresetId

  return (
    <div className="space-y-4">
      {/* 모델 상태 정보 */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-500" />
          모델 상태
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">상태:</span>
            <span className="capitalize">{nodeData?.state || 'definition'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">모델 타입:</span>
            <span>{nodeData?.modelType || '알 수 없음'}</span>
          </div>
          {nodeData?.layers && Array.isArray(nodeData.layers) && (
            <div className="flex justify-between">
              <span className="text-gray-600">레이어 수:</span>
              <span>{nodeData.layers.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* 학습 정보 */}
      {nodeData?.metrics && (
        <div className="bg-green-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-500" />
            학습 결과
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Loss:</span>
              <span className="font-mono">{nodeData.metrics.loss?.toFixed(4)}</span>
            </div>
            {nodeData.metrics.accuracy && (
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-mono">{(nodeData.metrics.accuracy * 100).toFixed(1)}%</span>
              </div>
            )}
            {nodeData.trainingProgress?.endTime && nodeData.trainingProgress?.startTime && (
              <div className="flex justify-between">
                <span className="text-gray-600">학습 시간:</span>
                <span>
                  {Math.round(
                    (nodeData.trainingProgress.endTime.getTime() -
                      nodeData.trainingProgress.startTime.getTime()) /
                      1000
                  )}
                  초
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 예측 결과 */}
      {nodeData?.predictions && nodeData.predictions.length > 0 && datasetId && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              예측 결과 ({nodeData.predictions?.length || 0}개)
            </h4>
            {nodeData.lastPredictionTime && (
              <p className="text-xs text-gray-500 mt-1">
                마지막 생성: {new Date(nodeData.lastPredictionTime).toLocaleString()}
              </p>
            )}
          </div>
          <div className="p-3">
            <PredictionResultsDisplay
              predictions={nodeData.predictions}
              displayConfig={getPredictionConfig(datasetId || '')?.display}
              datasetId={datasetId || ''}
              className="max-h-96 overflow-y-auto"
            />
          </div>
        </div>
      )}

      {/* 예측 결과가 없을 때 */}
      {nodeData?.state === 'trained' &&
        (!nodeData?.predictions || nodeData.predictions.length === 0) && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              예측 테스트
            </h4>
            <div className="text-sm text-gray-600">
              <Eye className="w-4 h-4 inline mr-2" />
              모델이 학습되었습니다. 노드에서 예측 버튼을 클릭하여 테스트해보세요.
            </div>
          </div>
        )}

      {/* 연결된 데이터 정보 */}
      {connectedDataInfo && (
        <div className="bg-yellow-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">연결된 데이터</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">데이터셋:</span>
              <span>
                {connectedDataInfo?.selectedPresetId
                  ? String(connectedDataInfo.selectedPresetId)
                  : '없음'}
              </span>
            </div>
            {connectedDataInfo?.samples && (
              <div className="flex justify-between">
                <span className="text-gray-600">샘플 수:</span>
                <span>
                  {typeof connectedDataInfo.samples === 'number' ||
                  typeof connectedDataInfo.samples === 'string'
                    ? Number(connectedDataInfo.samples).toLocaleString()
                    : '0'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 노드 속성 패널 컴포넌트
 */
const NodeProperties: React.FC = () => {
  const { nodes, selectedNodeId } = useModelStore() // removeNode 제거

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) as AppNode | undefined

  console.log('🔍 NodeProperties render:', { selectedNodeId, selectedNode: !!selectedNode })

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            속성 패널
          </h3>
        </div>

        {/* 빈 상태 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">노드를 선택하면</p>
            <p className="text-sm">속성을 확인할 수 있습니다</p>
          </div>
        </div>
      </div>
    )
  }

  const handleRemoveNode = () => {
    if (selectedNode) {
      // TODO: removeNode 함수를 modelStore에 추가해야 함
      console.log('Remove node:', selectedNode.id)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {selectedNode.type === 'model' ? (
              <Brain className="w-5 h-5 text-blue-500" />
            ) : (
              <Database className="w-5 h-5 text-yellow-500" />
            )}
            {selectedNode.type === 'model' ? '모델 노드' : '데이터 노드'}
          </h3>
          <button
            onClick={handleRemoveNode}
            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="노드 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 노드 정보 */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto overflow-x-hidden">
        <div className="space-y-4">
          {/* 기본 정보 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">기본 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-xs">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">타입:</span>
                <span className="capitalize">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">라벨:</span>
                <span>{selectedNode.data?.label || '라벨 없음'}</span>
              </div>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">위치</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">X:</span>
                <span>{Math.round(selectedNode.position.x)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Y:</span>
                <span>{Math.round(selectedNode.position.y)}</span>
              </div>
            </div>
          </div>

          {/* 모델 노드 전용 정보 */}
          {selectedNode.type === 'model' && (
            <ModelNodeProperties nodeId={selectedNode.id} nodeData={selectedNode.data} />
          )}

          {/* 데이터 노드 전용 정보 */}
          {selectedNode.type === 'data' && (
            <DataNodeProperties nodeId={selectedNode.id} nodeData={selectedNode.data} />
          )}

          {/* 디버그 정보 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">원시 데이터</h4>
            <pre className="text-xs text-gray-600 overflow-auto max-h-32 bg-white p-2 rounded border">
              {JSON.stringify(selectedNode.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NodeProperties

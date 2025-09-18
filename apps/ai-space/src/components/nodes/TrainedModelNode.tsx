import React, { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { TrainedModelNodeData } from '@/types'
import { CheckCircle, BarChart3, Download, Play, Eye } from 'lucide-react'

/**
 * 학습된 모델 노드 컴포넌트
 * 학습 완료된 모델의 성능 지표와 예측 기능을 제공하는 노드
 */
const TrainedModelNode: React.FC<NodeProps<TrainedModelNodeData>> = ({ id, data, selected }) => {
  const [showHistory, setShowHistory] = useState(false)
  const [testInput, setTestInput] = useState('')

  // 모델 예측 테스트
  const runPrediction = () => {
    if (!testInput.trim()) return

    try {
      const input = JSON.parse(testInput)
      // TODO: 실제 예측 로직 구현
      console.log('예측 실행:', input)
    } catch (error) {
      console.error('입력 형식 오류:', error)
    }
  }

  // 모델 저장/내보내기
  const exportModel = () => {
    // TODO: 모델 저장 로직
    console.log('모델 내보내기')
  }

  // 성능 지표 색상
  const getPerformanceColor = (value: number, type: 'loss' | 'accuracy') => {
    if (type === 'loss') {
      if (value < 0.1) return 'text-green-600'
      if (value < 0.5) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      if (value > 0.9) return 'text-green-600'
      if (value > 0.7) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  // 학습 곡선 미니 차트 (간단한 시각화)
  const renderMiniChart = () => {
    const { loss, epochs } = data.trainingHistory
    if (!loss.length) return null

    const maxLoss = Math.max(...loss)
    const minLoss = Math.min(...loss)
    const range = maxLoss - minLoss || 1

    return (
      <div className="flex items-end gap-px h-8 bg-purple-100 rounded p-1">
        {loss.slice(-20).map((value, index) => {
          const height = ((value - minLoss) / range) * 24 + 2
          return (
            <div
              key={index}
              className="bg-purple-400 rounded-sm flex-1"
              style={{ height: `${24 - height}px` }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[280px] bg-purple-50 border-purple-300
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        transition-all duration-200
        text-purple-800
      `}
    >
      {/* 학습된 모델 입력 - 학습 노드에서 */}
      <div className="relative mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Handle
              type="target"
              position={Position.Left}
              id="trainedModel"
              className="w-2 h-2 bg-purple-500 border border-white relative"
              style={{ position: 'relative', left: -8, top: 0 }}
            />
            <span className="text-xs text-purple-700">학습된 모델:</span>
          </div>
          <span className="text-xs font-mono">
            {data.modelId ? data.modelId.slice(-8) : 'N/A'}
          </span>
        </div>
      </div>

      {/* 학습 메트릭 입력 - 학습 노드에서 */}
      <div className="relative mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Handle
              type="target"
              position={Position.Left}
              id="trainingMetrics"
              className="w-2 h-2 bg-purple-500 border border-white relative"
              style={{ position: 'relative', left: -8, top: 0 }}
            />
            <span className="text-xs text-purple-700">학습 메트릭:</span>
          </div>
          <span className="text-xs font-mono">
            {data.finalLoss ? data.finalLoss.toFixed(4) : 'N/A'}
          </span>
        </div>
      </div>

      {/* 노드 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-sm">{data.label}</h3>
        </div>
        <div className="flex items-center gap-1">
          {data.isReady ? (
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          ) : (
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          )}
          <span className="text-xs text-purple-700">{data.isReady ? '준비됨' : '대기 중'}</span>
        </div>
      </div>

      {/* 성능 지표 */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-2">
          <BarChart3 className="w-3 h-3 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">성능 지표</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-purple-100 p-2 rounded">
            <div className="text-xs text-purple-600 mb-1">최종 손실</div>
            <div className={`text-sm font-semibold ${getPerformanceColor(data.finalLoss, 'loss')}`}>
              {data.finalLoss.toFixed(4)}
            </div>
          </div>

          {data.finalAccuracy && (
            <div className="bg-purple-100 p-2 rounded">
              <div className="text-xs text-purple-600 mb-1">최종 정확도</div>
              <div
                className={`text-sm font-semibold ${getPerformanceColor(data.finalAccuracy, 'accuracy')}`}
              >
                {(data.finalAccuracy * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 학습 곡선 미니 차트 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-purple-700">학습 곡선</span>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-purple-600 hover:text-purple-800"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>

        {renderMiniChart()}

        {showHistory && (
          <div className="mt-2 p-2 bg-purple-100 rounded text-xs">
            <div className="grid grid-cols-3 gap-2 text-purple-600">
              <div>총 에포크: {data.trainingHistory.epochs.length}</div>
              <div>최소 손실: {Math.min(...data.trainingHistory.loss).toFixed(4)}</div>
              {data.trainingHistory.accuracy && (
                <div>
                  최고 정확도: {(Math.max(...data.trainingHistory.accuracy) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 예측 테스트 */}
      <div className="mb-3">
        <div className="text-xs font-medium text-purple-700 mb-2">예측 테스트</div>
        <div className="space-y-2">
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="입력 데이터 (JSON 형식)&#10;예: [1, 2, 3, 4]"
            className="w-full px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
            rows={2}
            disabled={!data.isReady}
          />
          <button
            onClick={runPrediction}
            disabled={!data.isReady || !testInput.trim()}
            className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-3 h-3" />
            예측 실행
          </button>
        </div>
      </div>

      {/* 모델 관리 */}
      <div className="flex gap-2">
        <button
          onClick={exportModel}
          disabled={!data.isReady}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-3 h-3" />
          내보내기
        </button>
      </div>

      {/* 모델 정보 */}
      <div className="mt-3 pt-2 border-t border-purple-200">
        <div className="text-xs text-purple-600 space-y-1">
          <div>모델 ID: {data.modelId.slice(-8)}</div>
          <div>학습 ID: {data.trainingId.slice(-8)}</div>
        </div>
      </div>

      {/* 예측 결과 출력 - 외부 시스템으로 */}
      <div className="relative mt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-purple-700">예측 결과:</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${data.isReady ? 'text-green-600' : 'text-gray-500'}`}>
              {data.isReady ? '사용 가능' : '대기 중'}
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="predictions"
              className="w-2 h-2 bg-purple-500 border border-white relative"
              style={{ position: 'relative', right: -8, top: 0 }}
            />
          </div>
        </div>
      </div>

      {/* 모델 내보내기 출력 - 배포용 */}
      <div className="relative mt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-purple-700">모델 파일:</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono">
              {data.isReady ? 'TF.js' : 'N/A'}
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id="modelExport"
              className="w-2 h-2 bg-purple-500 border border-white relative"
              style={{ position: 'relative', right: -8, top: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainedModelNode

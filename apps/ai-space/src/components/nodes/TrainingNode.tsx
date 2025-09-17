import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { TrainingNodeData } from '@/types'
import { Play, Pause, Square, TrendingUp, Settings2 } from 'lucide-react'

/**
 * 모델 학습 노드 컴포넌트
 * 모델 컴파일 설정과 학습 실행을 담당하는 노드
 */
const TrainingNode: React.FC<NodeProps<TrainingNodeData>> = ({ id, data, selected }) => {
  // 학습 시작/중지
  const toggleTraining = () => {
    if (data.isTraining) {
      // TODO: 학습 중지 로직
      console.log('학습 중지')
    } else {
      // TODO: 학습 시작 로직
      console.log('학습 시작')
    }
  }

  // 하이퍼파라미터 업데이트
  const updateHyperparameter = (key: string, value: any) => {
    // TODO: 상태 관리 시스템에 연결
    console.log('하이퍼파라미터 업데이트:', key, value)
  }

  const getOptimizerColor = () => {
    switch (data.optimizer) {
      case 'adam':
        return 'text-green-600'
      case 'sgd':
        return 'text-blue-600'
      case 'rmsprop':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const getProgressPercentage = () => {
    if (!data.trainingProgress) return 0
    return (data.trainingProgress.epoch / data.trainingProgress.totalEpochs) * 100
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[300px] bg-green-50 border-green-300
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${data.isTraining ? 'animate-pulse' : ''}
        transition-all duration-200
      `}
    >
      {/* 입력 핸들들 */}
      <Handle
        type="target"
        position={Position.Left}
        id="model-input"
        style={{ top: '30%' }}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="data-input"
        style={{ top: '70%' }}
        className="w-3 h-3 bg-yellow-400 border-2 border-white"
      />

      {/* 노드 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-sm text-green-800">{data.label}</h3>
        </div>
        <div className="flex items-center gap-1">
          {data.isTraining ? (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          ) : (
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          )}
          <span className="text-xs text-green-700">{data.isTraining ? '학습 중' : '대기'}</span>
        </div>
      </div>

      {/* 컴파일 설정 */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-2">
          <Settings2 className="w-3 h-3 text-green-600" />
          <span className="text-xs font-medium text-green-700">컴파일 설정</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-green-600 mb-1">옵티마이저</label>
            <select
              value={data.optimizer}
              onChange={(e) => updateHyperparameter('optimizer', e.target.value)}
              className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={data.isTraining}
            >
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="rmsprop">RMSprop</option>
              <option value="adagrad">Adagrad</option>
            </select>
          </div>

          <div>
            <label className="block text-green-600 mb-1">학습률</label>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              max="1"
              value={data.learningRate}
              onChange={(e) => updateHyperparameter('learningRate', parseFloat(e.target.value))}
              className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={data.isTraining}
            />
          </div>

          <div>
            <label className="block text-green-600 mb-1">손실 함수</label>
            <select
              value={data.loss}
              onChange={(e) => updateHyperparameter('loss', e.target.value)}
              className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={data.isTraining}
            >
              <option value="mse">MSE</option>
              <option value="mae">MAE</option>
              <option value="categorical-crossentropy">Categorical CE</option>
              <option value="binary-crossentropy">Binary CE</option>
            </select>
          </div>

          <div>
            <label className="block text-green-600 mb-1">배치 크기</label>
            <input
              type="number"
              min="1"
              max="512"
              value={data.batchSize}
              onChange={(e) => updateHyperparameter('batchSize', parseInt(e.target.value))}
              className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={data.isTraining}
            />
          </div>
        </div>
      </div>

      {/* 학습 설정 */}
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-green-600 mb-1">에포크</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={data.epochs}
              onChange={(e) => updateHyperparameter('epochs', parseInt(e.target.value))}
              className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={data.isTraining}
            />
          </div>

          <div>
            <label className="block text-green-600 mb-1">검증 분할</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="0.5"
              value={data.validationSplit}
              onChange={(e) => updateHyperparameter('validationSplit', parseFloat(e.target.value))}
              className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={data.isTraining}
            />
          </div>
        </div>
      </div>

      {/* 학습 진행 상황 */}
      {data.trainingProgress && (
        <div className="mb-3 p-2 bg-green-100 rounded">
          <div className="text-xs text-green-700 mb-1">학습 진행</div>

          {/* 진행률 바 */}
          <div className="w-full bg-green-200 rounded-full h-2 mb-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
            <div>
              에포크: {data.trainingProgress.epoch}/{data.trainingProgress.totalEpochs}
            </div>
            <div>손실: {data.trainingProgress.loss.toFixed(4)}</div>
            {data.trainingProgress.accuracy && (
              <>
                <div>정확도: {(data.trainingProgress.accuracy * 100).toFixed(1)}%</div>
                {data.trainingProgress.valLoss && (
                  <div>검증 손실: {data.trainingProgress.valLoss.toFixed(4)}</div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 학습 제어 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={toggleTraining}
          className={`
            flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded font-medium transition-colors
            ${
              data.isTraining
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }
          `}
        >
          {data.isTraining ? (
            <>
              <Pause className="w-3 h-3" />
              중지
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              시작
            </>
          )}
        </button>

        {data.isTraining && (
          <button
            onClick={() => console.log('학습 완전 중지')}
            className="px-2 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 출력 핸들 - 학습된 모델로 연결 */}
      <Handle
        type="source"
        position={Position.Right}
        id="trained-model-output"
        className="w-3 h-3 bg-green-400 border-2 border-white"
        style={{ top: '50%' }}
      />
    </div>
  )
}

export default TrainingNode

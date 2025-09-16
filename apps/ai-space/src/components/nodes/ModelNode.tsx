import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ModelNodeData } from '@/types'
import { modelActions } from '@/stores/modelStore'
import { Brain, Settings, CheckCircle, Clock } from 'lucide-react'

const ModelNode: React.FC<NodeProps<ModelNodeData>> = ({ id, data, selected }) => {
  const handleHyperparameterChange = (key: string, value: any) => {
    const updatedHyperparameters = {
      ...data.hyperparameters,
      [key]: value
    }
    modelActions.updateNode(id, { hyperparameters: updatedHyperparameters })
  }

  const getStatusIcon = () => {
    if (data.isTrained) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else if (data.isCompiled) {
      return <Settings className="w-4 h-4 text-blue-600" />
    } else {
      return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    if (data.isTrained) return '학습 완료'
    if (data.isCompiled) return '컴파일됨'
    return '준비 중'
  }

  const getStatusColor = () => {
    if (data.isTrained) return 'text-green-600'
    if (data.isCompiled) return 'text-blue-600'
    return 'text-gray-500'
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[280px] bg-purple-50 border-purple-300
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        transition-all duration-200
      `}
    >
      {/* 입력 핸들들 */}
      <Handle
        type="target"
        position={Position.Left}
        id="data"
        style={{ top: '30%' }}
        className="w-3 h-3 bg-yellow-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="layers"
        style={{ top: '70%' }}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />

      {/* 노드 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-sm text-purple-800">{data.label}</h3>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span className={`text-xs ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* 모델 타입 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-purple-700 mb-1">모델 타입</label>
        <select
          value={data.modelType}
          onChange={(e) => modelActions.updateNode(id, { modelType: e.target.value as any })}
          className="w-full px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="neural-network">신경망</option>
          <option value="linear-regression">선형 회귀</option>
          <option value="logistic-regression">로지스틱 회귀</option>
          <option value="decision-tree">의사결정트리</option>
        </select>
      </div>

      {/* 하이퍼파라미터 설정 */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-purple-700 mb-2">하이퍼파라미터</div>
        
        {/* 학습률 */}
        <div>
          <label className="block text-xs text-purple-600 mb-1">학습률</label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            max="1"
            value={data.hyperparameters.learningRate}
            onChange={(e) => handleHyperparameterChange('learningRate', parseFloat(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* 에포크 */}
        <div>
          <label className="block text-xs text-purple-600 mb-1">에포크</label>
          <input
            type="number"
            min="1"
            max="1000"
            value={data.hyperparameters.epochs}
            onChange={(e) => handleHyperparameterChange('epochs', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* 배치 크기 */}
        <div>
          <label className="block text-xs text-purple-600 mb-1">배치 크기</label>
          <input
            type="number"
            min="1"
            max="512"
            value={data.hyperparameters.batchSize}
            onChange={(e) => handleHyperparameterChange('batchSize', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* 옵티마이저 */}
        <div>
          <label className="block text-xs text-purple-600 mb-1">옵티마이저</label>
          <select
            value={data.hyperparameters.optimizer}
            onChange={(e) => handleHyperparameterChange('optimizer', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="adam">Adam</option>
            <option value="sgd">SGD</option>
            <option value="rmsprop">RMSprop</option>
            <option value="adagrad">Adagrad</option>
          </select>
        </div>

        {/* 손실 함수 */}
        <div>
          <label className="block text-xs text-purple-600 mb-1">손실 함수</label>
          <select
            value={data.hyperparameters.loss}
            onChange={(e) => handleHyperparameterChange('loss', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="mse">MSE</option>
            <option value="mae">MAE</option>
            <option value="categorical-crossentropy">Categorical Crossentropy</option>
            <option value="binary-crossentropy">Binary Crossentropy</option>
          </select>
        </div>
      </div>

      {/* 학습 진행 상황 */}
      {data.trainingProgress && (
        <div className="mt-3 p-2 bg-purple-100 rounded">
          <div className="text-xs text-purple-700 mb-1">학습 진행</div>
          <div className="text-xs text-purple-600">
            <div>에포크: {data.trainingProgress.epoch}</div>
            <div>손실: {data.trainingProgress.loss.toFixed(4)}</div>
            {data.trainingProgress.accuracy && (
              <div>정확도: {(data.trainingProgress.accuracy * 100).toFixed(1)}%</div>
            )}
          </div>
        </div>
      )}

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
    </div>
  )
}

export default ModelNode

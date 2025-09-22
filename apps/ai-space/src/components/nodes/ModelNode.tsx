import React, { useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { 
  Brain, 
  Play, 
  Square, 
  Settings, 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { ModelNodeData, ModelNodeState } from '@/types/ModelNode'
import { useModelStore } from '@/stores/modelStore'

/**
 * 상태별 스타일 설정
 */
const getStateStyle = (state: ModelNodeState) => {
  switch (state) {
    case 'definition':
      return {
        border: 'border-gray-300',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        icon: Brain,
        iconColor: 'text-gray-500'
      }
    case 'configured':
      return {
        border: 'border-blue-300',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: Settings,
        iconColor: 'text-blue-500'
      }
    case 'training':
      return {
        border: 'border-yellow-300',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        icon: Play,
        iconColor: 'text-yellow-500'
      }
    case 'trained':
      return {
        border: 'border-green-300',
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: CheckCircle,
        iconColor: 'text-green-500'
      }
    case 'error':
      return {
        border: 'border-red-300',
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: AlertCircle,
        iconColor: 'text-red-500'
      }
    default:
      return {
        border: 'border-gray-300',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        icon: Brain,
        iconColor: 'text-gray-500'
      }
  }
}

/**
 * 상태별 라벨 텍스트
 */
const getStateLabel = (state: ModelNodeState) => {
  switch (state) {
    case 'definition': return '모델 정의'
    case 'configured': return '설정 완료'
    case 'training': return '학습 중'
    case 'trained': return '학습 완료'
    case 'error': return '오류'
    default: return '알 수 없음'
  }
}

/**
 * 통합 모델 노드 컴포넌트
 */
const ModelNode: React.FC<NodeProps<ModelNodeData>> = ({ id, data, selected }) => {
  const { selectNode } = useModelStore()
  const [isHovered, setIsHovered] = useState(false)
  
  const style = getStateStyle(data.state)
  const StateIcon = style.icon
  
  // 노드 클릭 핸들러
  const handleClick = useCallback(() => {
    selectNode(id)
  }, [id, selectNode])
  
  // 빠른 액션 핸들러들
  const handleQuickAction = useCallback((action: string, event: React.MouseEvent) => {
    event.stopPropagation()
    console.log(`🔧 Quick action: ${action} on node ${id}`)
    // TODO: 실제 액션 구현
  }, [id])

  // 상태별 빠른 액션 버튼들
  const getQuickActions = () => {
    const actions = []
    
    switch (data.state) {
      case 'definition':
        actions.push({ key: 'configure', label: '구성', icon: Settings, color: 'blue' })
        break
      case 'configured':
        actions.push({ key: 'train', label: '학습', icon: Play, color: 'green' })
        break
      case 'training':
        actions.push({ key: 'stop', label: '중지', icon: Square, color: 'red' })
        break
      case 'trained':
        actions.push({ key: 'evaluate', label: '평가', icon: BarChart3, color: 'purple' })
        break
      case 'error':
        actions.push({ key: 'reset', label: '재설정', icon: Settings, color: 'gray' })
        break
    }
    
    return actions
  }

  return (
    <div
      className={`
        relative min-w-[200px] max-w-[280px] rounded-lg border-2 shadow-lg transition-all duration-200
        ${style.border} ${style.bg}
        ${selected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        ${isHovered ? 'shadow-xl scale-105' : ''}
        cursor-pointer
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ left: -6 }}
      />
      
      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ right: -6 }}
      />
      
      {/* 헤더 */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StateIcon className={`w-4 h-4 ${style.iconColor}`} />
            <span className={`text-sm font-medium ${style.text}`}>
              {data.label || '모델'}
            </span>
          </div>
          
          {/* 상태 배지 */}
          <div className={`px-2 py-1 text-xs rounded-full ${style.bg} ${style.text} border ${style.border}`}>
            {getStateLabel(data.state)}
          </div>
        </div>
        
        {/* 모델 타입 */}
        <div className="mt-1">
          <span className="text-xs text-gray-500">
            {data.modelType === 'neural-network' ? '신경망' : data.modelType}
          </span>
        </div>
      </div>
      
      {/* 본문 */}
      <div className="p-3 space-y-2">
        {/* 모델 구조 정보 */}
        {data.inputShape && data.outputUnits && (
          <div className="text-xs text-gray-600">
            <div className="flex justify-between">
              <span>입력:</span>
              <span className="font-mono">{data.inputShape.join('×')}</span>
            </div>
            <div className="flex justify-between">
              <span>출력:</span>
              <span className="font-mono">{data.outputUnits}</span>
            </div>
            <div className="flex justify-between">
              <span>레이어:</span>
              <span className="font-mono">{data.layers?.length || 0}</span>
            </div>
          </div>
        )}
        
        {/* 학습 진행 상황 */}
        {data.state === 'training' && data.trainingProgress && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-yellow-600">
              <Clock className="w-3 h-3" />
              <span>에포크 {data.trainingProgress.epoch}/{data.trainingProgress.totalEpochs}</span>
            </div>
            
            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(data.trainingProgress.epoch / data.trainingProgress.totalEpochs) * 100}%` 
                }}
              />
            </div>
            
            {/* 손실값 */}
            {data.trainingProgress.loss !== undefined && (
              <div className="text-xs text-gray-600">
                Loss: {data.trainingProgress.loss.toFixed(4)}
              </div>
            )}
          </div>
        )}
        
        {/* 학습 완료 지표 */}
        {data.state === 'trained' && data.metrics && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-green-600">
              <BarChart3 className="w-3 h-3" />
              <span>학습 완료</span>
            </div>
            
            <div className="text-xs text-gray-600 space-y-0.5">
              <div className="flex justify-between">
                <span>Loss:</span>
                <span className="font-mono">{data.metrics.loss?.toFixed(4)}</span>
              </div>
              {data.metrics.accuracy && (
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-mono">{(data.metrics.accuracy * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 오류 메시지 */}
        {data.state === 'error' && data.error && (
          <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
            {data.error}
          </div>
        )}
      </div>
      
      {/* 빠른 액션 버튼들 */}
      {isHovered && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          {data.state === 'definition' && (
            <button
              onClick={(e) => handleQuickAction('configure', e)}
              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
              title="설정"
            >
              <Settings className="w-3 h-3" />
            </button>
          )}
          
          {data.state === 'configured' && (
            <button
              onClick={(e) => handleQuickAction('train', e)}
              className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg"
              title="학습 시작"
            >
              <Play className="w-3 h-3" />
            </button>
          )}
          
          {data.state === 'training' && (
            <button
              onClick={(e) => handleQuickAction('stop', e)}
              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              title="학습 중지"
            >
              <Square className="w-3 h-3" />
            </button>
          )}
          
          {(data.state === 'trained' || data.state === 'error') && (
            <button
              onClick={(e) => handleQuickAction('reset', e)}
              className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors shadow-lg"
              title="초기화"
            >
              <Zap className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ModelNode

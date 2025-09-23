import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { 
  Circle, 
  Box, 
  Brain, 
  Layers, 
  Shuffle, 
  Droplets,
  Settings,
  Zap,
  Hash,
  Eye,
  Grid3x3,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { LayerNodeData, LayerNodeType } from '@/types/LayerEditor'

/**
 * 레이어 타입별 아이콘 매핑
 */
const getLayerIcon = (layerType: LayerNodeType) => {
  switch (layerType) {
    case 'input':
    case 'output':
      return Circle
    case 'dense':
      return Brain
    case 'conv2d':
    case 'conv1d':
      return Layers
    case 'lstm':
      return Shuffle
    case 'dropout':
      return Droplets
    case 'flatten':
      return Box
    case 'batchNorm':
      return Zap
    case 'layerNorm':
      return Hash
    case 'attention':
      return Eye
    case 'embedding':
      return Grid3x3
    case 'maxPool2d':
    case 'avgPool2d':
      return Minimize2
    case 'globalMaxPool2d':
    case 'globalAvgPool2d':
      return Maximize2
    default:
      return Settings
  }
}

/**
 * 레이어 타입별 스타일 설정
 */
const getLayerStyle = (layerType: LayerNodeType, isSelected: boolean) => {
  const baseStyle = "transition-all duration-200 hover:shadow-lg"
  const selectedStyle = isSelected ? "ring-2 ring-blue-400 ring-opacity-50" : ""
  
  switch (layerType) {
    case 'input':
      return {
        container: `${baseStyle} ${selectedStyle} w-16 h-16 rounded-full border-2 border-green-400 bg-green-50 flex items-center justify-center`,
        text: 'text-green-700',
        icon: 'text-green-500'
      }
    case 'output':
      return {
        container: `${baseStyle} ${selectedStyle} w-16 h-16 rounded-full border-2 border-red-400 bg-red-50 flex items-center justify-center`,
        text: 'text-red-700',
        icon: 'text-red-500'
      }
    case 'dense':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[120px] rounded-lg border-2 border-blue-300 bg-blue-50 p-3`,
        text: 'text-blue-700',
        icon: 'text-blue-500'
      }
    case 'conv2d':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[120px] rounded-lg border-2 border-purple-300 bg-purple-50 p-3`,
        text: 'text-purple-700',
        icon: 'text-purple-500'
      }
    case 'lstm':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[120px] rounded-lg border-2 border-orange-300 bg-orange-50 p-3`,
        text: 'text-orange-700',
        icon: 'text-orange-500'
      }
    case 'dropout':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[120px] rounded-lg border-2 border-gray-300 bg-gray-50 p-3`,
        text: 'text-gray-700',
        icon: 'text-gray-500'
      }
    case 'flatten':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[120px] rounded-lg border-2 border-indigo-300 bg-indigo-50 p-3`,
        text: 'text-indigo-700',
        icon: 'text-indigo-500'
      }
    default:
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[120px] rounded-lg border-2 border-gray-300 bg-gray-50 p-3`,
        text: 'text-gray-700',
        icon: 'text-gray-500'
      }
  }
}

/**
 * 레이어 파라미터 표시 컴포넌트
 */
const LayerParams: React.FC<{ data: LayerNodeData }> = ({ data }) => {
  const params: string[] = []
  
  if (data.units) params.push(`${data.units} units`)
  if (data.filters) params.push(`${data.filters} filters`)
  if (data.kernelSize) {
    const kernel = Array.isArray(data.kernelSize) 
      ? `${data.kernelSize[0]}×${data.kernelSize[1]}`
      : `${data.kernelSize}×${data.kernelSize}`
    params.push(`${kernel} kernel`)
  }
  if (data.rate) params.push(`${(data.rate * 100).toFixed(0)}% rate`)
  if (data.activation && data.layerType !== 'dropout' && data.layerType !== 'flatten') {
    params.push(data.activation)
  }
  
  if (params.length === 0) return null
  
  return (
    <div className="text-xs text-gray-600 mt-1">
      {params.join(', ')}
    </div>
  )
}

/**
 * 레이어 노드 컴포넌트
 */
const LayerNode: React.FC<NodeProps<LayerNodeData>> = ({ data, selected }) => {
  const Icon = getLayerIcon(data.layerType)
  const style = getLayerStyle(data.layerType, selected || false)
  
  // 입력/출력 노드는 원형으로 간단하게 표시
  if (data.layerType === 'input' || data.layerType === 'output') {
    return (
      <div className={style.container}>
        {/* 입력 노드는 출력 핸들만, 출력 노드는 입력 핸들만 */}
        {data.layerType === 'input' && (
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-green-500 border-2 border-white"
            style={{ right: -6 }}
          />
        )}
        
        {data.layerType === 'output' && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-red-500 border-2 border-white"
            style={{ left: -6 }}
          />
        )}
        
        <Icon className={`w-6 h-6 ${style.icon}`} />
      </div>
    )
  }
  
  // 일반 레이어 노드는 사각형으로 상세 정보 표시
  return (
    <div className={style.container}>
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
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ right: -6 }}
      />
      
      {/* 레이어 정보 */}
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${style.icon}`} />
        <span className={`text-sm font-medium ${style.text}`}>
          {data.label}
        </span>
      </div>
      
      {/* 레이어 파라미터 */}
      <LayerParams data={data} />
    </div>
  )
}

export default LayerNode

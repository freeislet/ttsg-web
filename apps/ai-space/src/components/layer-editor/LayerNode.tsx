import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
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
  Maximize2,
} from 'lucide-react'
import { LayerNodeData, LayerNodeType } from '@/types/LayerEditor'
import { useLayerEditor } from './LayerEditor'

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
  const baseStyle = 'transition-all duration-200 hover:shadow-lg'
  const selectedStyle = isSelected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''

  switch (layerType) {
    case 'input':
      return {
        container: `${baseStyle} ${selectedStyle} w-16 h-16 rounded-full border-2 border-green-400 bg-green-50 flex items-center justify-center`,
        text: 'text-green-700',
        icon: 'text-green-500',
      }
    case 'output':
      return {
        container: `${baseStyle} ${selectedStyle} w-16 h-16 rounded-full border-2 border-red-400 bg-red-50 flex items-center justify-center`,
        text: 'text-red-700',
        icon: 'text-red-500',
      }
    case 'dense':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[180px] max-w-[220px] rounded-lg border-2 border-blue-300 bg-blue-50 p-3`,
        text: 'text-blue-700',
        icon: 'text-blue-500',
      }
    case 'conv2d':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[180px] max-w-[220px] rounded-lg border-2 border-purple-300 bg-purple-50 p-3`,
        text: 'text-purple-700',
        icon: 'text-purple-500',
      }
    case 'lstm':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[180px] max-w-[220px] rounded-lg border-2 border-orange-300 bg-orange-50 p-3`,
        text: 'text-orange-700',
        icon: 'text-orange-500',
      }
    case 'dropout':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[180px] max-w-[220px] rounded-lg border-2 border-gray-300 bg-gray-50 p-3`,
        text: 'text-gray-700',
        icon: 'text-gray-500',
      }
    case 'flatten':
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[180px] max-w-[220px] rounded-lg border-2 border-indigo-300 bg-indigo-50 p-3`,
        text: 'text-indigo-700',
        icon: 'text-indigo-500',
      }
    default:
      return {
        container: `${baseStyle} ${selectedStyle} min-w-[180px] max-w-[220px] rounded-lg border-2 border-gray-300 bg-gray-50 p-3`,
        text: 'text-gray-700',
        icon: 'text-gray-500',
      }
  }
}

/**
 * 레이어 파라미터 입력 폼 컴포넌트
 */
const LayerParamsForm: React.FC<{ 
  data: LayerNodeData
  onChange: (updates: Partial<LayerNodeData>) => void
}> = ({ data, onChange }) => {
  const handleChange = (field: keyof LayerNodeData, value: any) => {
    onChange({ [field]: value })
  }

  const renderField = (field: keyof LayerNodeData, value: any, label: string) => {
    if (field === 'label' || field === 'layerType' || field === 'layerIndex') return null

    switch (typeof value) {
      case 'number':
        return (
          <div key={field} className="mb-2">
            <label className="block text-xs text-gray-600 mb-1">{label}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(field, Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              min={field === 'rate' ? 0 : 1}
              max={field === 'rate' ? 1 : undefined}
              step={field === 'rate' ? 0.1 : 1}
            />
          </div>
        )
      case 'string':
        if (field === 'activation') {
          const activations = ['relu', 'sigmoid', 'tanh', 'softmax', 'linear', 'elu', 'selu']
          return (
            <div key={field} className="mb-2">
              <label className="block text-xs text-gray-600 mb-1">{label}</label>
              <select
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {activations.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>
          )
        } else if (field === 'padding') {
          return (
            <div key={field} className="mb-2">
              <label className="block text-xs text-gray-600 mb-1">{label}</label>
              <select
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="valid">valid</option>
                <option value="same">same</option>
              </select>
            </div>
          )
        } else {
          return (
            <div key={field} className="mb-2">
              <label className="block text-xs text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          )
        }
      default:
        return null
    }
  }

  // 현재 레이어 타입에 해당하는 필드들만 표시
  const relevantFields = Object.entries(data).filter(([key, value]) => {
    if (key === 'label' || key === 'layerType' || key === 'layerIndex') return false
    return value !== undefined && value !== null
  })

  if (relevantFields.length === 0) return null

  return (
    <div className="mt-2 pt-2 border-t border-gray-200">
      {relevantFields.map(([field, value]) => {
        const label = field.charAt(0).toUpperCase() + field.slice(1)
        return renderField(field as keyof LayerNodeData, value, label)
      })}
    </div>
  )
}

/**
 * 레이어 노드 컴포넌트
 */
const LayerNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as LayerNodeData
  const Icon = getLayerIcon(nodeData.layerType)
  const style = getLayerStyle(nodeData.layerType, selected || false)
  const { updateNodeData } = useLayerEditor()

  // 노드 데이터 업데이트 핸들러
  const handleDataChange = (updates: Partial<LayerNodeData>) => {
    if (id) {
      updateNodeData(id, updates)
    }
  }

  // 입력/출력 노드는 원형으로 간단하게 표시
  if (nodeData.layerType === 'input' || nodeData.layerType === 'output') {
    return (
      <div className={style.container}>
        {/* 입력 노드는 아래쪽 핸들만, 출력 노드는 위쪽 핸들만 */}
        {nodeData.layerType === 'input' && (
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-green-500 border-2 border-white"
            style={{ bottom: -6 }}
          />
        )}

        {nodeData.layerType === 'output' && (
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-red-500 border-2 border-white"
            style={{ top: -6 }}
          />
        )}

        <Icon className={`w-6 h-6 ${style.icon}`} />
      </div>
    )
  }

  // 일반 레이어 노드는 사각형으로 상세 정보 표시
  return (
    <div className={style.container}>
      {/* 입력 핸들 (위쪽) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ top: -6 }}
      />

      {/* 출력 핸들 (아래쪽) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ bottom: -6 }}
      />

      {/* 레이어 정보 */}
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${style.icon}`} />
        <span className={`text-sm font-medium ${style.text}`}>{nodeData.label}</span>
      </div>

      {/* 레이어 파라미터 폼 */}
      <LayerParamsForm data={nodeData} onChange={handleDataChange} />
    </div>
  )
}

export default LayerNode

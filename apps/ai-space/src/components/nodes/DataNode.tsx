import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { DataNodeData } from '@/types'
import { modelActions } from '@/stores/modelStore'
import { Database, Upload, BarChart3 } from 'lucide-react'

const DataNode: React.FC<NodeProps<DataNodeData>> = ({ id, data, selected }) => {
  const handleDataTypeChange = (dataType: DataNodeData['dataType']) => {
    modelActions.updateNode(id, { dataType })
  }

  const handleShapeChange = (index: number, value: number) => {
    const newShape = [...data.shape]
    newShape[index] = value
    const samples = index === 0 ? value : data.samples
    const features = index === 1 ? value : data.features
    
    modelActions.updateNode(id, { 
      shape: newShape,
      samples,
      features
    })
  }

  const getDataTypeColor = () => {
    switch (data.dataType) {
      case 'training':
        return 'text-green-600'
      case 'validation':
        return 'text-blue-600'
      case 'test':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const getDataTypeIcon = () => {
    switch (data.dataType) {
      case 'training':
        return <Upload className="w-4 h-4 text-green-600" />
      case 'validation':
        return <BarChart3 className="w-4 h-4 text-blue-600" />
      case 'test':
        return <Database className="w-4 h-4 text-orange-600" />
      default:
        return <Database className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[220px] bg-yellow-50 border-yellow-300
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        transition-all duration-200
      `}
    >
      {/* 노드 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-sm text-yellow-800">{data.label}</h3>
        </div>
        <div className="flex items-center gap-1">
          {getDataTypeIcon()}
          <span className={`text-xs ${getDataTypeColor()}`}>
            {data.dataType}
          </span>
        </div>
      </div>

      {/* 데이터 타입 선택 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-yellow-700 mb-1">데이터 타입</label>
        <select
          value={data.dataType}
          onChange={(e) => handleDataTypeChange(e.target.value as DataNodeData['dataType'])}
          className="w-full px-2 py-1 text-xs border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
        >
          <option value="training">훈련 데이터</option>
          <option value="validation">검증 데이터</option>
          <option value="test">테스트 데이터</option>
        </select>
      </div>

      {/* 데이터 형태 설정 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-yellow-700 mb-1">데이터 형태</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-yellow-600 mb-1">샘플 수</label>
            <input
              type="number"
              min="1"
              max="100000"
              value={data.shape[0]}
              onChange={(e) => handleShapeChange(0, parseInt(e.target.value) || 1)}
              className="w-full px-2 py-1 text-xs border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs text-yellow-600 mb-1">특성 수</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={data.shape[1]}
              onChange={(e) => handleShapeChange(1, parseInt(e.target.value) || 1)}
              className="w-full px-2 py-1 text-xs border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* 데이터 통계 */}
      <div className="mb-3 p-2 bg-yellow-100 rounded">
        <div className="text-xs font-medium text-yellow-700 mb-1">데이터 정보</div>
        <div className="space-y-1 text-xs text-yellow-600">
          <div className="flex justify-between">
            <span>형태:</span>
            <span>[{data.shape.join(', ')}]</span>
          </div>
          <div className="flex justify-between">
            <span>총 요소:</span>
            <span>{data.shape.reduce((a, b) => a * b, 1).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>메모리:</span>
            <span>~{Math.round(data.shape.reduce((a, b) => a * b, 1) * 4 / 1024 / 1024)}MB</span>
          </div>
        </div>
      </div>

      {/* 데이터 로드 상태 */}
      {data.data ? (
        <div className="mb-2 flex items-center gap-2 text-xs text-green-600">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span>데이터 로드됨</span>
        </div>
      ) : (
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <span>데이터 없음</span>
        </div>
      )}

      {/* 데이터 생성/로드 버튼 */}
      <button
        onClick={() => {
          // 시뮬레이션된 데이터 생성
          const x = Array.from({ length: data.samples }, () => 
            Array.from({ length: data.features }, () => Math.random())
          )
          const y = Array.from({ length: data.samples }, () => 
            Array.from({ length: 10 }, () => Math.random())
          )
          modelActions.updateNode(id, { data: { x, y } })
        }}
        className="w-full px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 transition-colors"
      >
        {data.data ? '데이터 재생성' : '샘플 데이터 생성'}
      </button>

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-yellow-400 border-2 border-white"
      />
    </div>
  )
}

export default DataNode

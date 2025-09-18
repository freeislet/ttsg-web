import React, { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { TrainingDataNodeData } from '@/types'
import { Database, Upload, BarChart3, RefreshCw, Eye, Zap } from 'lucide-react'

/**
 * 훈련 데이터 노드 컴포넌트
 */
const TrainingDataNode: React.FC<NodeProps<TrainingDataNodeData>> = ({ id, data, selected }) => {
  const [showStats, setShowStats] = useState(false)

  // 데이터 타입 변경
  const handleDataTypeChange = (dataType: TrainingDataNodeData['dataType']) => {
    // TODO: 상태 관리 시스템에 연결 (Valtio 사용)
    console.log('데이터 타입 변경:', dataType)
  }

  // 데이터 형태 변경
  const handleShapeChange = (
    field: 'samples' | 'inputFeatures' | 'outputFeatures',
    value: number
  ) => {
    // TODO: 상태 관리 시스템에 연결
    console.log('데이터 형태 변경:', field, value)
  }

  // 샘플 데이터 생성
  const generateSampleData = () => {
    // TODO: 실제 데이터 생성 로직 구현
    console.log('샘플 데이터 생성')
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

  // 메모리 사용량 계산
  const calculateMemoryUsage = () => {
    const totalElements = data.samples * (data.inputFeatures + data.outputFeatures)
    return Math.round((totalElements * 4) / 1024 / 1024) // 4바이트 float32 기준
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[280px] bg-yellow-50 border-yellow-300
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        transition-all duration-200
        text-yellow-800
      `}
    >
      {/* 노드 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-sm">{data.label}</h3>
        </div>
        <div className="flex items-center gap-1">
          {getDataTypeIcon()}
          <span className="text-xs">{data.dataType}</span>
        </div>
      </div>

      {/* 데이터 타입 선택 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-yellow-700 mb-1">데이터 타입</label>
        <select
          value={data.dataType}
          onChange={(e) => handleDataTypeChange(e.target.value as TrainingDataNodeData['dataType'])}
          className="w-full px-2 py-1 text-xs border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
        >
          <option value="training">훈련 데이터</option>
          <option value="validation">검증 데이터</option>
          <option value="test">테스트 데이터</option>
        </select>
      </div>

      {/* 데이터 형태 설정 */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-yellow-700 mb-2">데이터 형태</label>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-yellow-600 mb-1">샘플 수</label>
            <input
              type="number"
              min="1"
              max="100000"
              value={data.samples}
              onChange={(e) => handleShapeChange('samples', parseInt(e.target.value) || 1)}
              className="w-full px-2 py-1 text-xs border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-yellow-600 mb-1">입력 특성</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={data.inputFeatures}
                onChange={(e) => handleShapeChange('inputFeatures', parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 text-xs border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-xs text-yellow-600 mb-1">출력 특성</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={data.outputFeatures}
                onChange={(e) => handleShapeChange('outputFeatures', parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 text-xs border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 데이터 정보 */}
      <div className="mb-3 p-2 bg-yellow-100 rounded">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-yellow-700">데이터 정보</span>
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-xs text-yellow-600 hover:text-yellow-800"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1 text-xs text-yellow-600">
          <div className="flex justify-between">
            <span>입력 형태:</span>
            <span>
              [{data.samples}, {data.inputFeatures}]
            </span>
          </div>
          <div className="flex justify-between">
            <span>출력 형태:</span>
            <span>
              [{data.samples}, {data.outputFeatures}]
            </span>
          </div>
          <div className="flex justify-between">
            <span>총 요소:</span>
            <span>
              {(data.samples * (data.inputFeatures + data.outputFeatures)).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>예상 메모리:</span>
            <span>~{calculateMemoryUsage()}MB</span>
          </div>
        </div>

        {showStats && data.dataStats && (
          <div className="mt-2 pt-2 border-t border-yellow-200 space-y-1 text-xs text-yellow-600">
            {data.dataStats.inputMean && (
              <div>
                평균: [
                {data.dataStats.inputMean
                  .slice(0, 3)
                  .map((v) => v.toFixed(2))
                  .join(', ')}
                ...]
              </div>
            )}
            {data.dataStats.inputStd && (
              <div>
                표준편차: [
                {data.dataStats.inputStd
                  .slice(0, 3)
                  .map((v) => v.toFixed(2))
                  .join(', ')}
                ...]
              </div>
            )}
          </div>
        )}
      </div>

      {/* 데이터 로드 상태 */}
      <div className="mb-3">
        {data.data ? (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>데이터 로드됨</span>
            <span className="text-yellow-600">({data.data.inputs.length} 샘플)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <span>데이터 없음</span>
          </div>
        )}
      </div>

      {/* 데이터 생성/로드 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={generateSampleData}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 transition-colors"
        >
          <Zap className="w-3 h-3" />
          {data.data ? '재생성' : '생성'}
        </button>

        <button
          onClick={() => console.log('데이터 새로고침')}
          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* 데이터 형태 출력 - 모델 정의의 inputShape로 연결 */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs text-yellow-700">데이터 형태:</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono">[{data.shape.join(', ')}]</span>
            <Handle
              type="source"
              position={Position.Right}
              id="dataShape"
              className="w-2 h-2 bg-yellow-500 border border-white relative"
              style={{ position: 'relative', right: -8, top: 0 }}
            />
          </div>
        </div>
      </div>

      {/* 출력 클래스 수 - 모델 정의의 outputUnits로 연결 */}
      <div className="relative mt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-yellow-700">출력 클래스:</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono">{data.outputClasses || 10}</span>
            <Handle
              type="source"
              position={Position.Right}
              id="outputClasses"
              className="w-2 h-2 bg-yellow-500 border border-white relative"
              style={{ position: 'relative', right: -8, top: 0 }}
            />
          </div>
        </div>
      </div>

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        id="data-output"
        className="w-3 h-3 bg-yellow-400 border-2 border-white"
        style={{ top: '50%' }}
      />
    </div>
  )
}

export default TrainingDataNode

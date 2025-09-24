import React from 'react'
import { Node } from '@xyflow/react'
import { Trash2, Settings, Info } from 'lucide-react'
import { LayerNodeData } from '@/types/LayerEditor'

/**
 * 레이어 속성 패널 Props
 */
interface LayerPropertiesPanelProps {
  node: Node<LayerNodeData>
  onUpdate: (data: Partial<LayerNodeData>) => void
  onRemove: () => void
}

/**
 * 레이어 속성 패널 컴포넌트
 */
const LayerPropertiesPanel: React.FC<LayerPropertiesPanelProps> = ({
  node,
  onUpdate,
  onRemove,
}) => {
  const { data } = node

  /**
   * 속성 값 변경 핸들러
   */
  const handleChange = (field: keyof LayerNodeData, value: any) => {
    onUpdate({ [field]: value })
  }

  /**
   * 입력/출력 노드는 편집 불가
   */
  if (data.layerType === 'input' || data.layerType === 'output') {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-gray-800">
            {data.layerType === 'input' ? '입력 노드' : '출력 노드'}
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          {data.layerType === 'input'
            ? '입력 노드는 데이터 연결에 의해 자동으로 shape이 결정됩니다.'
            : '출력 노드는 모델의 최종 출력을 나타냅니다.'}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-800">레이어 속성</h3>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          title="레이어 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 기본 정보 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">레이어 이름</label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">레이어 타입</label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
            {data.layerType.charAt(0).toUpperCase() + data.layerType.slice(1)}
          </div>
        </div>

        {/* Dense 레이어 설정 */}
        {data.layerType === 'dense' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유닛 수</label>
              <input
                type="number"
                min="1"
                value={data.units || 64}
                onChange={(e) => handleChange('units', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">활성화 함수</label>
              <select
                value={data.activation || 'relu'}
                onChange={(e) => handleChange('activation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relu">ReLU</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="tanh">Tanh</option>
                <option value="softmax">Softmax</option>
                <option value="linear">Linear</option>
              </select>
            </div>
          </>
        )}

        {/* Conv2D 레이어 설정 */}
        {data.layerType === 'conv2d' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">필터 수</label>
              <input
                type="number"
                min="1"
                value={data.filters || 32}
                onChange={(e) => handleChange('filters', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">커널 크기</label>
              <input
                type="number"
                min="1"
                value={Array.isArray(data.kernelSize) ? data.kernelSize[0] : data.kernelSize || 3}
                onChange={(e) => {
                  const size = parseInt(e.target.value)
                  handleChange('kernelSize', size)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">패딩</label>
              <select
                value={data.padding || 'same'}
                onChange={(e) => handleChange('padding', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="same">Same</option>
                <option value="valid">Valid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">활성화 함수</label>
              <select
                value={data.activation || 'relu'}
                onChange={(e) => handleChange('activation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relu">ReLU</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="tanh">Tanh</option>
                <option value="linear">Linear</option>
              </select>
            </div>
          </>
        )}

        {/* LSTM 레이어 설정 */}
        {data.layerType === 'lstm' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유닛 수</label>
              <input
                type="number"
                min="1"
                value={data.units || 50}
                onChange={(e) => handleChange('units', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">활성화 함수</label>
              <select
                value={data.activation || 'tanh'}
                onChange={(e) => handleChange('activation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tanh">Tanh</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="relu">ReLU</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="returnSequences"
                checked={data.returnSequences || false}
                onChange={(e) => handleChange('returnSequences', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="returnSequences" className="text-sm text-gray-700">
                시퀀스 반환
              </label>
            </div>
          </>
        )}

        {/* Dropout 레이어 설정 */}
        {data.layerType === 'dropout' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">드롭아웃 비율</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={data.rate || 0.2}
              onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">0.0 ~ 1.0 사이의 값 (0.2 = 20% 드롭아웃)</p>
          </div>
        )}

        {/* Flatten 레이어는 설정 없음 */}
        {data.layerType === 'flatten' && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <Info className="w-4 h-4 inline mr-2" />
            Flatten 레이어는 추가 설정이 필요하지 않습니다. 다차원 입력을 1차원으로 평탄화합니다.
          </div>
        )}
      </div>

      {/* 레이어 정보 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">레이어 정보</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>ID: {node.id}</div>
          <div>타입: {data.layerType}</div>
          {data.layerIndex !== undefined && <div>순서: {data.layerIndex}</div>}
        </div>
      </div>
    </div>
  )
}

export default LayerPropertiesPanel

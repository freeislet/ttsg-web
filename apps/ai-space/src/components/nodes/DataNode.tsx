import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Database, RefreshCw } from 'lucide-react'
import * as tf from '@tensorflow/tfjs'

/**
 * 훈련 데이터 노드 데이터 인터페이스
 */
export interface DataNodeData {
  label: string
  samples: number
  inputFeatures: number
  outputFeatures: number
  dataType: 'training' | 'validation' | 'test'
  inputShape: number[]
  outputShape: number[]
}

/**
 * 훈련 데이터 노드 Props
 */
export interface DataNodeProps extends NodeProps<DataNodeData> {
  // 추가 props가 필요한 경우 여기에 정의
}

/**
 * 훈련 데이터 노드 컴포넌트
 */
export class DataNode extends React.Component<DataNodeProps> {
  private trainX?: tf.Tensor
  private trainY?: tf.Tensor
  
  /**
   * 데이터 생성
   */
  private handleGenerateData = (): void => {
    const { data } = this.props
    
    try {
      // 기존 데이터 정리
      this.disposeData()
      
      // 새 데이터 생성
      this.trainX = tf.randomNormal([data.samples, ...data.inputShape])
      this.trainY = tf.randomNormal([data.samples, ...data.outputShape])
      
      console.log(`✅ Data generated: ${data.samples} samples`)
      this.forceUpdate()
      
    } catch (error) {
      console.error(`❌ Failed to generate data: ${error}`)
    }
  }
  
  /**
   * 데이터 정리
   */
  private disposeData = (): void => {
    if (this.trainX) {
      this.trainX.dispose()
      this.trainX = undefined
    }
    if (this.trainY) {
      this.trainY.dispose()
      this.trainY = undefined
    }
  }
  
  /**
   * 설정 변경 핸들러
   */
  private handleConfigChange = (field: keyof DataNodeData, value: any): void => {
    // TODO: 상태 관리 시스템과 연결
    console.log(`Config changed: ${field} = ${value}`)
  }
  
  /**
   * 컴포넌트 언마운트 시 메모리 정리
   */
  componentWillUnmount(): void {
    this.disposeData()
  }
  
  render(): React.ReactNode {
    const { data, selected } = this.props
    const hasData = !!(this.trainX && this.trainY)
    
    return (
      <div className={`
        bg-white border-2 rounded-lg shadow-lg min-w-[280px] max-w-[380px]
        ${selected ? 'border-yellow-500 shadow-yellow-200' : 'border-gray-300'}
        transition-all duration-200
      `}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <h3 className="font-semibold text-sm">{data.label}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                hasData ? 'bg-green-400' : 'bg-gray-400'
              }`} />
              <span className="text-xs opacity-80">{data.dataType}</span>
            </div>
          </div>
        </div>
        
        {/* 본문 */}
        <div className="p-4 space-y-4">
          {/* 데이터 상태 */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-gray-700 mb-2">데이터 정보</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">샘플 수:</span>
                <span className="font-mono">{data.samples.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">입력 형태:</span>
                <span className="font-mono">[{data.inputShape.join(', ')}]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">출력 형태:</span>
                <span className="font-mono">[{data.outputShape.join(', ')}]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상태:</span>
                <span className={`font-medium ${hasData ? 'text-green-600' : 'text-gray-600'}`}>
                  {hasData ? '생성됨' : '미생성'}
                </span>
              </div>
              {hasData && (
                <div className="flex justify-between">
                  <span className="text-gray-600">메모리:</span>
                  <span className="font-mono">
                    {((this.trainX!.size + this.trainY!.size) * 4 / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* 데이터 설정 */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">데이터 설정</h4>
            <div className="space-y-3">
              {/* 샘플 수 */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">샘플 수</label>
                <input
                  type="number"
                  value={data.samples}
                  onChange={(e) => this.handleConfigChange('samples', parseInt(e.target.value) || 1000)}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-yellow-500"
                  min="10"
                  max="100000"
                />
              </div>
              
              {/* 입력 특성 수 */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">입력 특성 수</label>
                <input
                  type="number"
                  value={data.inputFeatures}
                  onChange={(e) => this.handleConfigChange('inputFeatures', parseInt(e.target.value) || 10)}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-yellow-500"
                  min="1"
                  max="1000"
                />
              </div>
              
              {/* 출력 특성 수 */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">출력 특성 수</label>
                <input
                  type="number"
                  value={data.outputFeatures}
                  onChange={(e) => this.handleConfigChange('outputFeatures', parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-yellow-500"
                  min="1"
                  max="1000"
                />
              </div>
              
              {/* 데이터 타입 */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">데이터 타입</label>
                <select
                  value={data.dataType}
                  onChange={(e) => this.handleConfigChange('dataType', e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-yellow-500"
                >
                  <option value="training">훈련 데이터</option>
                  <option value="validation">검증 데이터</option>
                  <option value="test">테스트 데이터</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={this.handleGenerateData}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-medium bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              {hasData ? '데이터 재생성' : '데이터 생성'}
            </button>
          </div>
        </div>
        
        {/* 핸들 */}
        <Handle
          type="source"
          position={Position.Right}
          id="data-output"
          className="w-3 h-3 bg-yellow-500 border-2 border-white"
          style={{ right: -6 }}
        />
      </div>
    )
  }
}

/**
 * 함수형 컴포넌트로 내보내기
 */
const DataNodeComponent = React.forwardRef<DataNode, DataNodeProps>((props, ref) => {
  return <DataNode {...props} ref={ref} />
})

DataNodeComponent.displayName = 'DataNode'

export default DataNodeComponent

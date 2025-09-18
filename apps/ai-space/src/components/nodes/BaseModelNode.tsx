import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ModelBase } from '@/models/ModelBase'

/**
 * 베이스 모델 노드 데이터 인터페이스
 */
export interface BaseModelNodeData {
  label: string
  modelId: string
  modelType: string
}

/**
 * 베이스 모델 노드 Props
 */
export interface BaseModelNodeProps<T extends ModelBase = ModelBase> extends NodeProps<BaseModelNodeData> {
  model?: T
}

/**
 * 베이스 모델 노드 컴포넌트
 * 모든 모델 노드의 공통 UI와 로직을 제공
 */
export abstract class BaseModelNode<T extends ModelBase = ModelBase> extends React.Component<BaseModelNodeProps<T>> {
  
  /**
   * 모델별 특화 컨트롤 렌더링 (하위 클래스에서 구현)
   */
  abstract renderModelControls(): React.ReactNode
  
  /**
   * 모델별 상태 정보 렌더링 (하위 클래스에서 구현)
   */
  abstract renderModelStatus(): React.ReactNode
  
  /**
   * 모델 생성 핸들러
   */
  protected handleCreateModel = async (): Promise<void> => {
    const { model } = this.props
    if (!model) return
    
    try {
      await model.createModel()
      console.log(`✅ Model created: ${model.id}`)
      this.forceUpdate() // 상태 업데이트를 위한 리렌더링
    } catch (error) {
      console.error(`❌ Failed to create model: ${error}`)
    }
  }
  
  /**
   * 공통 렌더링
   */
  render(): React.ReactNode {
    const { data, selected, model } = this.props
    
    return (
      <div className={`
        bg-white border-2 rounded-lg shadow-lg min-w-[280px] max-w-[400px]
        ${selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-300'}
        transition-all duration-200
      `}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{data.label}</h3>
            <div className="flex items-center gap-2">
              {/* 모델 상태 표시 */}
              <div className={`w-2 h-2 rounded-full ${
                model?.tfModel ? 'bg-green-400' : 'bg-gray-400'
              }`} />
              <span className="text-xs opacity-80">
                {model?.modelType || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
        
        {/* 본문 */}
        <div className="p-4 space-y-4">
          {/* 모델 상태 정보 */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-gray-700 mb-2">모델 상태</h4>
            {this.renderModelStatus()}
          </div>
          
          {/* 모델별 컨트롤 */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">모델 설정</h4>
            {this.renderModelControls()}
          </div>
          
          {/* 공통 액션 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={this.handleCreateModel}
              disabled={!!model?.tfModel}
              className={`
                flex-1 px-3 py-2 rounded text-xs font-medium transition-colors
                ${model?.tfModel 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              {model?.tfModel ? '모델 생성됨' : '모델 생성'}
            </button>
          </div>
        </div>
        
        {/* 핸들 */}
        <Handle
          type="source"
          position={Position.Right}
          id="model-output"
          className="w-3 h-3 bg-blue-500 border-2 border-white"
          style={{ right: -6 }}
        />
      </div>
    )
  }
}

/**
 * 함수형 컴포넌트 래퍼
 */
export function createModelNodeComponent<T extends ModelBase>(
  ModelNodeClass: new (props: BaseModelNodeProps<T>) => BaseModelNode<T>
) {
  return React.forwardRef<BaseModelNode<T>, BaseModelNodeProps<T>>((props, ref) => {
    return <ModelNodeClass {...props} ref={ref} />
  })
}

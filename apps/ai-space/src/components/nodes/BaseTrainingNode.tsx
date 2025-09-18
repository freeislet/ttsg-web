import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ModelBase } from '@/models/ModelBase'

/**
 * 베이스 학습 노드 데이터 인터페이스
 */
export interface BaseTrainingNodeData {
  label: string
  modelId: string
  isTraining: boolean
  trainingProgress?: {
    epoch: number
    totalEpochs: number
    loss: number
    accuracy?: number
  }
}

/**
 * 베이스 학습 노드 Props
 */
export interface BaseTrainingNodeProps<T extends ModelBase = ModelBase> extends NodeProps<BaseTrainingNodeData> {
  model?: T
}

/**
 * 베이스 학습 노드 컴포넌트
 * 모든 학습 노드의 공통 UI와 로직을 제공
 */
export abstract class BaseTrainingNode<T extends ModelBase = ModelBase> extends React.Component<BaseTrainingNodeProps<T>> {
  
  /**
   * 모델별 학습 설정 렌더링 (하위 클래스에서 구현)
   */
  abstract renderTrainingControls(): React.ReactNode
  
  /**
   * 학습 시작 핸들러 (하위 클래스에서 구현)
   */
  abstract handleStartTraining(): Promise<void>
  
  /**
   * 학습 중지 핸들러
   */
  protected handleStopTraining = (): void => {
    // TODO: 학습 중지 로직 구현
    console.log('Training stopped')
  }
  
  /**
   * 진행률 계산
   */
  private getProgress(): number {
    const { data } = this.props
    if (!data.trainingProgress) return 0
    return (data.trainingProgress.epoch / data.trainingProgress.totalEpochs) * 100
  }
  
  /**
   * 공통 렌더링
   */
  render(): React.ReactNode {
    const { data, selected, model } = this.props
    const progress = this.getProgress()
    
    return (
      <div className={`
        bg-white border-2 rounded-lg shadow-lg min-w-[300px] max-w-[420px]
        ${selected ? 'border-green-500 shadow-green-200' : 'border-gray-300'}
        transition-all duration-200
      `}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{data.label}</h3>
            <div className="flex items-center gap-2">
              {/* 학습 상태 표시 */}
              <div className={`w-2 h-2 rounded-full ${
                data.isTraining ? 'bg-yellow-400 animate-pulse' : 
                model?.isTrained ? 'bg-green-400' : 'bg-gray-400'
              }`} />
              <span className="text-xs opacity-80">
                {data.isTraining ? '학습중' : model?.isTrained ? '완료' : '대기'}
              </span>
            </div>
          </div>
        </div>
        
        {/* 본문 */}
        <div className="p-4 space-y-4">
          {/* 학습 진행 상황 */}
          {data.isTraining && data.trainingProgress && (
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="text-xs font-medium text-gray-700 mb-2">학습 진행 상황</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Epoch {data.trainingProgress.epoch}/{data.trainingProgress.totalEpochs}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Loss: {data.trainingProgress.loss.toFixed(4)}</span>
                  {data.trainingProgress.accuracy && (
                    <span>Accuracy: {(data.trainingProgress.accuracy * 100).toFixed(1)}%</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 모델별 학습 설정 */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">학습 설정</h4>
            {this.renderTrainingControls()}
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {data.isTraining ? (
              <button
                onClick={this.handleStopTraining}
                className="flex-1 px-3 py-2 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                학습 중지
              </button>
            ) : (
              <button
                onClick={this.handleStartTraining}
                disabled={!model?.isCompiled}
                className={`
                  flex-1 px-3 py-2 rounded text-xs font-medium transition-colors
                  ${model?.isCompiled
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {model?.isCompiled ? '학습 시작' : '모델 컴파일 필요'}
              </button>
            )}
          </div>
        </div>
        
        {/* 핸들 */}
        <Handle
          type="target"
          position={Position.Left}
          id="model-input"
          className="w-3 h-3 bg-green-500 border-2 border-white"
          style={{ left: -6 }}
        />
        
        <Handle
          type="source"
          position={Position.Right}
          id="training-output"
          className="w-3 h-3 bg-green-500 border-2 border-white"
          style={{ right: -6 }}
        />
      </div>
    )
  }
}

/**
 * 함수형 컴포넌트 래퍼
 */
export function createTrainingNodeComponent<T extends ModelBase>(
  TrainingNodeClass: new (props: BaseTrainingNodeProps<T>) => BaseTrainingNode<T>
) {
  return React.forwardRef<BaseTrainingNode<T>, BaseTrainingNodeProps<T>>((props, ref) => {
    return <TrainingNodeClass {...props} ref={ref} />
  })
}

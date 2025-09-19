import React from 'react'
import { BaseTrainingNode, BaseTrainingNodeProps } from './BaseTrainingNode'
import { NNModel, NNTrainingConfig } from '@/models/NNModel'
import * as tf from '@tensorflow/tfjs'

/**
 * 신경망 학습 노드 컴포넌트
 */
export class NNTrainingNode extends BaseTrainingNode<NNModel> {
  private trainingConfig: NNTrainingConfig = {
    optimizer: 'adam',
    learningRate: 0.001,
    loss: 'mse',
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
  }

  /**
   * 학습 시작 핸들러
   */
  async handleStartTraining(): Promise<void> {
    const { model } = this.props
    if (!model || !model.tfModel) {
      console.error('Model not available for training')
      return
    }

    try {
      // 모델 컴파일 (아직 컴파일되지 않은 경우)
      if (!model.isCompiled) {
        await model.compile(this.trainingConfig)
      }

      // 더미 데이터 생성 (실제로는 데이터 노드에서 가져와야 함)
      const config = model.getConfig()
      const batchSize = this.trainingConfig.batchSize
      const inputShape = config.inputShape
      const outputUnits = config.outputUnits

      const trainX = tf.randomNormal([batchSize, ...inputShape])
      const trainY = tf.randomNormal([batchSize, outputUnits])

      console.log(`🏃 Starting training for model: ${model.id}`)

      // 학습 실행
      await model.train(trainX, trainY, this.trainingConfig)

      // 메모리 정리
      trainX.dispose()
      trainY.dispose()

      console.log(`✅ Training completed for model: ${model.id}`)
      this.forceUpdate()
    } catch (error) {
      console.error(`❌ Training failed: ${error}`)
    }
  }

  /**
   * 설정 변경 핸들러
   */
  private handleConfigChange = (field: keyof NNTrainingConfig, value: any): void => {
    this.trainingConfig = { ...this.trainingConfig, [field]: value }
    this.forceUpdate()
  }

  /**
   * 학습 설정 렌더링
   */
  renderTrainingControls(): React.ReactNode {
    const { model } = this.props

    return (
      <div className="space-y-3">
        {/* 옵티마이저 설정 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">옵티마이저</label>
            <select
              value={this.trainingConfig.optimizer}
              onChange={(e) => this.handleConfigChange('optimizer', e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-green-500"
            >
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="rmsprop">RMSprop</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">학습률</label>
            <input
              type="number"
              value={this.trainingConfig.learningRate}
              onChange={(e) =>
                this.handleConfigChange('learningRate', parseFloat(e.target.value) || 0.001)
              }
              className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-green-500"
              min="0.0001"
              max="1"
              step="0.0001"
            />
          </div>
        </div>

        {/* 손실 함수 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">손실 함수</label>
          <select
            value={this.trainingConfig.loss}
            onChange={(e) => this.handleConfigChange('loss', e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-green-500"
          >
            <option value="mse">Mean Squared Error</option>
            <option value="binaryCrossentropy">Binary Crossentropy</option>
            <option value="categoricalCrossentropy">Categorical Crossentropy</option>
          </select>
        </div>

        {/* 에포크 및 배치 크기 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">에포크</label>
            <input
              type="number"
              value={this.trainingConfig.epochs}
              onChange={(e) => this.handleConfigChange('epochs', parseInt(e.target.value) || 50)}
              className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-green-500"
              min="1"
              max="1000"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">배치 크기</label>
            <input
              type="number"
              value={this.trainingConfig.batchSize}
              onChange={(e) => this.handleConfigChange('batchSize', parseInt(e.target.value) || 32)}
              className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-green-500"
              min="1"
              max="512"
            />
          </div>
        </div>

        {/* 검증 분할 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            검증 분할 ({(this.trainingConfig.validationSplit! * 100).toFixed(0)}%)
          </label>
          <input
            type="range"
            value={this.trainingConfig.validationSplit}
            onChange={(e) => this.handleConfigChange('validationSplit', parseFloat(e.target.value))}
            className="w-full"
            min="0"
            max="0.5"
            step="0.05"
          />
        </div>

        {/* 모델 상태 정보 */}
        {model && (
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">모델 상태:</span>
                <span
                  className={`font-medium ${
                    model.isTrained
                      ? 'text-green-600'
                      : model.isCompiled
                        ? 'text-blue-600'
                        : 'text-gray-600'
                  }`}
                >
                  {model.isTrained ? '학습 완료' : model.isCompiled ? '컴파일됨' : '준비 중'}
                </span>
              </div>

              {model.isTrained && model.getTrainingResult() && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">최종 손실:</span>
                    <span className="font-mono text-xs">
                      {model.getTrainingResult()!.finalLoss.toFixed(4)}
                    </span>
                  </div>
                  {model.getTrainingResult()!.finalAccuracy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">최종 정확도:</span>
                      <span className="font-mono text-xs">
                        {(model.getTrainingResult()!.finalAccuracy! * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}

/**
 * 함수형 컴포넌트로 내보내기
 */
const NNTrainingNodeComponent = React.forwardRef<NNTrainingNode, BaseTrainingNodeProps<NNModel>>(
  (props, ref) => {
    return <NNTrainingNode {...props} ref={ref} />
  }
)

NNTrainingNodeComponent.displayName = 'NNTrainingNode'

export default NNTrainingNodeComponent

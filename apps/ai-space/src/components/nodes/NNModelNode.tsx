import React from 'react'
import { BaseModelNode, BaseModelNodeProps } from './BaseModelNode'
import { NNModel, LayerConfig } from '@/models/NNModel'
import { Plus, Trash2, Settings } from 'lucide-react'

/**
 * 신경망 모델 노드 컴포넌트
 */
export class NNModelNode extends BaseModelNode<NNModel> {
  /**
   * 레이어 추가
   */
  private handleAddLayer = (): void => {
    const { model } = this.props
    if (!model) return

    const config = model.getConfig()
    const newLayer: LayerConfig = {
      type: 'dense',
      units: 32,
      activation: 'relu',
    }

    config.layers.push(newLayer)
    // TODO: 모델 설정 업데이트 로직
    this.forceUpdate()
  }

  /**
   * 레이어 제거
   */
  private handleRemoveLayer = (index: number): void => {
    const { model } = this.props
    if (!model) return

    const config = model.getConfig()
    if (config.layers.length > 1) {
      config.layers.splice(index, 1)
      // TODO: 모델 설정 업데이트 로직
      this.forceUpdate()
    }
  }

  /**
   * 레이어 설정 변경
   */
  private handleLayerChange = (index: number, field: keyof LayerConfig, value: any): void => {
    const { model } = this.props
    if (!model) return

    const config = model.getConfig()
    config.layers[index] = { ...config.layers[index], [field]: value }
    // TODO: 모델 설정 업데이트 로직
    this.forceUpdate()
  }

  /**
   * 모델 상태 정보 렌더링
   */
  renderModelStatus(): React.ReactNode {
    const { model } = this.props
    if (!model) {
      return <div className="text-xs text-gray-500">모델이 연결되지 않음</div>
    }

    const config = model.getConfig()

    return (
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">입력 형태:</span>
          <span className="font-mono">[{config.inputShape.join(', ')}]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">출력 유닛:</span>
          <span className="font-mono">{config.outputUnits}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">레이어 수:</span>
          <span className="font-mono">{config.layers.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">메모리:</span>
          <span className="font-mono">{(model.getMemoryUsage() / 1024 / 1024).toFixed(1)}MB</span>
        </div>
      </div>
    )
  }

  /**
   * 모델별 컨트롤 렌더링
   */
  renderModelControls(): React.ReactNode {
    const { model } = this.props
    if (!model) {
      return <div className="text-xs text-gray-500">모델 설정을 불러올 수 없음</div>
    }

    const config = model.getConfig()

    return (
      <div className="space-y-3">
        {/* 기본 설정 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">출력 유닛</label>
            <input
              type="number"
              value={config.outputUnits}
              onChange={(e) => {
                config.outputUnits = parseInt(e.target.value) || 1
                this.forceUpdate()
              }}
              className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
              min="1"
            />
          </div>
        </div>

        {/* 레이어 설정 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-600">레이어 구성</label>
            <button
              onClick={this.handleAddLayer}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
              title="레이어 추가"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {config.layers.map((layer, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">레이어 {index + 1}</span>
                  {config.layers.length > 1 && (
                    <button
                      onClick={() => this.handleRemoveLayer(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="레이어 제거"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <select
                      value={layer.type}
                      onChange={(e) => this.handleLayerChange(index, 'type', e.target.value)}
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="dense">Dense</option>
                      <option value="dropout">Dropout</option>
                      <option value="batchNormalization">BatchNorm</option>
                    </select>
                  </div>

                  {layer.type === 'dense' && (
                    <>
                      <div>
                        <input
                          type="number"
                          value={layer.units || 32}
                          onChange={(e) =>
                            this.handleLayerChange(index, 'units', parseInt(e.target.value) || 32)
                          }
                          placeholder="Units"
                          className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={layer.activation || 'relu'}
                          onChange={(e) =>
                            this.handleLayerChange(index, 'activation', e.target.value)
                          }
                          className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
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

                  {layer.type === 'dropout' && (
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={layer.rate || 0.2}
                        onChange={(e) =>
                          this.handleLayerChange(index, 'rate', parseFloat(e.target.value) || 0.2)
                        }
                        placeholder="Dropout Rate"
                        className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

/**
 * 함수형 컴포넌트로 내보내기
 */
const NNModelNodeComponent = React.forwardRef<NNModelNode, BaseModelNodeProps<NNModel>>(
  (props, ref) => {
    return <NNModelNode {...props} ref={ref} />
  }
)

NNModelNodeComponent.displayName = 'NNModelNode'

export default NNModelNodeComponent

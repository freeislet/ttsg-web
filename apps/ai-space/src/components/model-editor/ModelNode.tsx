import React, { useState, useMemo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import {
  Brain,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Edit3,
  Play,
  Database,
  Settings,
  ChevronDown,
  ChevronUp,
  Target,
  Eye,
  Loader2,
} from 'lucide-react'
import { ModelNodeData, ModelNodeState, TrainingConfig } from '@/types/ModelNode'
import { DataNodeData } from '@/types/DataNode'
import { LayerEditor } from '@/components/layer-editor'
import { useModelStore } from '@/stores/modelStore'
import { NNModel } from '@/models/NNModel'
import { createNeuralNetworkConfig } from '@/models/training'
import { getPredictionConfig } from '@/data/presets'
import { generateModelPredictions } from '@/utils/modelPrediction'
import * as tf from '@tensorflow/tfjs'

/**
 * 상태별 스타일 설정
 */
const getStateStyle = (state: ModelNodeState) => {
  switch (state) {
    case 'definition':
      return {
        border: 'border-gray-300',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        icon: Brain,
        iconColor: 'text-gray-500',
      }
    case 'configured':
      return {
        border: 'border-blue-300',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: Brain,
        iconColor: 'text-blue-500',
      }
    case 'training':
      return {
        border: 'border-yellow-300',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        icon: Clock,
        iconColor: 'text-yellow-500',
      }
    case 'trained':
      return {
        border: 'border-green-300',
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: CheckCircle,
        iconColor: 'text-green-500',
      }
    case 'error':
      return {
        border: 'border-red-300',
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: AlertCircle,
        iconColor: 'text-red-500',
      }
    default:
      return {
        border: 'border-gray-300',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        icon: Brain,
        iconColor: 'text-gray-500',
      }
  }
}

/**
 * 상태별 라벨 텍스트
 */
const getStateLabel = (state: ModelNodeState) => {
  switch (state) {
    case 'definition':
      return '모델 정의'
    case 'configured':
      return '설정 완료'
    case 'training':
      return '학습 중'
    case 'trained':
      return '학습 완료'
    case 'error':
      return '오류'
    default:
      return '알 수 없음'
  }
}

/**
 * 통합 모델 노드 컴포넌트
 */
const ModelNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as ModelNodeData
  const [isLayerEditorOpen, setIsLayerEditorOpen] = useState(false)
  const [isTrainingConfigOpen, setIsTrainingConfigOpen] = useState(false)
  const { updateNodeData, nodes, edges } = useModelStore()
  const style = getStateStyle(nodeData.state)
  const StateIcon = style.icon

  // 기본 학습 설정값 (loss 함수는 데이터셋에 따라 자동 추론)
  const defaultTrainingConfig: TrainingConfig = {
    optimizer: 'adam',
    loss: '', // 비워두면 데이터셋에 따라 자동 추론
    metrics: ['accuracy'],
    epochs: 10,
    batchSize: 32,
    validationSplit: 0.2,
    learningRate: 0.001,
  }

  // 현재 학습 설정 (기본값 사용하거나 저장된 값 사용)
  const currentTrainingConfig = nodeData.trainingConfig || defaultTrainingConfig

  // 연결된 데이터 노드 정보 계산
  const connectedDataInfo = useMemo(() => {
    // 현재 모델 노드로 연결되는 엣지 찾기
    const incomingEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === 'data-input'
    )

    if (incomingEdges.length === 0) {
      return null
    }

    // 연결된 데이터 노드 찾기
    const connectedDataNode = nodes.find(
      (node) => node.type === 'data' && incomingEdges.some((edge) => edge.source === node.id)
    )

    if (!connectedDataNode) {
      return null
    }

    const dataNodeData = connectedDataNode.data as DataNodeData
    return {
      name: dataNodeData.selectedPresetId || '데이터셋',
      inputShape: dataNodeData.inputShape,
      outputShape: dataNodeData.outputShape,
      samples: dataNodeData.samples || 0,
    }
  }, [id, nodes, edges])

  /**
   * 데이터 타입에 따른 적절한 loss 함수 추론
   */
  const inferLossFunctionFromDataset = (dataset: any): string => {
    if (!dataset || !dataset.outputShape) {
      return 'categoricalCrossentropy' // 기본값
    }

    const outputUnits = dataset.outputShape.reduce((a: number, b: number) => a * b, 1)

    // 출력 유닛 수에 따라 분류/회귀 문제 판단
    if (outputUnits === 1) {
      // 1개 출력 = 회귀 문제 또는 이진 분류
      // Car MPG, Linear regression 등
      console.log('📊 Inferred loss function: meanSquaredError (regression problem)')
      return 'meanSquaredError'
    } else if (outputUnits > 1) {
      // 여러 개 출력 = 다중 분류 문제
      // Iris, MNIST 등
      console.log(
        `📊 Inferred loss function: categoricalCrossentropy (${outputUnits}-class classification)`
      )
      return 'categoricalCrossentropy'
    }

    return 'categoricalCrossentropy'
  }

  /**
   * 레이어 설정 저장 핸들러
   */
  const handleLayersSave = (
    layers: import('@/types/ModelNode').LayerConfig[],
    modelNodeId?: string
  ) => {
    // modelNodeId가 제공되면 해당 ID 사용, 아니면 현재 노드 ID 사용
    const targetNodeId = modelNodeId || id
    updateNodeData(targetNodeId, { layers })
    console.log('Updated layers for node:', targetNodeId, layers)
  }

  /**
   * 학습 설정 업데이트
   */
  const updateTrainingConfig = (config: Partial<TrainingConfig>) => {
    const updatedConfig = { ...currentTrainingConfig, ...config }
    updateNodeData(id, { trainingConfig: updatedConfig })
  }

  /**
   * 연결된 데이터 노드에서 데이터셋 가져오기
   */
  const getConnectedDataset = () => {
    // 현재 모델 노드로 연결되는 엣지 찾기
    const incomingEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === 'data-input'
    )

    if (incomingEdges.length === 0) {
      return null
    }

    // 연결된 데이터 노드 찾기
    const connectedDataNode = nodes.find(
      (node) => node.type === 'data' && incomingEdges.some((edge) => edge.source === node.id)
    )

    if (!connectedDataNode) {
      return null
    }

    const dataNodeData = connectedDataNode.data as DataNodeData
    const dataset = dataNodeData.dataset

    if (!dataset) {
      return null
    }

    return dataset
  }

  /**
   * 예측 생성 시작
   */
  const handleGeneratePredictions = async () => {
    if (nodeData.state !== 'trained') {
      console.warn('Model must be trained before generating predictions')
      return
    }

    // 연결된 데이터셋 확인
    const dataset = getConnectedDataset()
    if (!dataset) {
      console.warn('No dataset connected for predictions')
      return
    }

    // 연결된 데이터 노드 정보 가져오기
    const connectedDataNode = nodes.find(
      (node) => node.type === 'data' && edges.some((edge) => edge.source === node.id && edge.target === id)
    )
    
    if (!connectedDataNode) {
      console.warn('Connected data node not found')
      return
    }

    const dataNodeData = connectedDataNode.data as DataNodeData
    const datasetId = dataNodeData.selectedPresetId

    if (!datasetId) {
      console.warn('Dataset ID not found')
      return
    }

    try {
      // 예측 생성 상태로 설정
      updateNodeData(id, {
        isGeneratingPredictions: true,
        error: undefined,
      })

      console.log('🔮 Generating predictions for dataset:', datasetId)

      // 현재 학습된 모델 인스턴스 가져오기
      const { getModelInstance } = useModelStore.getState()
      const modelInstance = getModelInstance(id)
      
      if (!modelInstance || !modelInstance.tfModel) {
        throw new Error('학습된 모델 인스턴스를 찾을 수 없습니다')
      }

      const predictionConfig = getPredictionConfig(datasetId)
      const defaultSamples = predictionConfig?.defaultSamples

      console.log('🔮 Using trained model for predictions:', {
        modelType: nodeData.modelType,
        layers: nodeData.layers?.length,
        datasetId,
        sampleCount: defaultSamples?.count || 10
      })

      // 실제 모델 예측 수행
      const predictions = await generateModelPredictions(
        modelInstance.tfModel,
        dataset,
        datasetId,
        {
          sampleCount: defaultSamples?.count || 10,
          useTestSet: defaultSamples?.useTestSet ?? true,
          shuffled: defaultSamples?.shuffled ?? true,
        }
      )

      // 예측 결과 저장
      updateNodeData(id, {
        predictions: predictions,
        isGeneratingPredictions: false,
        lastPredictionTime: new Date(),
      })

      console.log('✅ Predictions generated successfully:', predictions.length)
      
    } catch (error) {
      console.error('❌ Prediction generation failed:', error)
      updateNodeData(id, {
        isGeneratingPredictions: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }


  /**
   * 모델 학습 시작
   */
  const handleStartTraining = async () => {
    if (!nodeData.layers || nodeData.layers.length === 0) {
      console.warn('No layers defined for training')
      return
    }

    if (!nodeData.inputShape || !nodeData.outputUnits) {
      console.warn('Input shape or output units not defined')
      return
    }

    // 연결된 데이터셋 확인
    const dataset = getConnectedDataset()
    if (!dataset) {
      console.warn('No dataset connected for training')
      updateNodeData(id, {
        state: 'error',
        error: '데이터셋이 연결되지 않았습니다. 데이터 노드를 연결해주세요.',
      })
      return
    }

    // 데이터셋 유효성 검사
    if (!dataset.inputs || !dataset.labels) {
      console.warn('Dataset inputs or labels are missing')
      updateNodeData(id, {
        state: 'error',
        error: '데이터셋에 입력 또는 레이블 데이터가 없습니다.',
      })
      return
    }

    try {
      // TensorFlow.js 백엔드 초기화 확인
      await tf.ready()

      if (!tf.getBackend()) {
        console.warn('TensorFlow.js backend not available, initializing...')
        await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'))
      }

      console.log('🔧 TensorFlow.js backend:', tf.getBackend())

      // 상태를 학습 중으로 변경
      updateNodeData(id, {
        state: 'training',
        trainingProgress: {
          epoch: 0,
          totalEpochs: currentTrainingConfig.epochs,
          loss: 0,
          isTraining: true,
          startTime: new Date(),
        },
        error: undefined, // 이전 오류 삭제
      })

      console.log('🚀 Starting model training for node:', id)
      console.log('📊 Dataset info:', {
        inputShape: dataset.inputs.shape,
        labelShape: dataset.labels.shape,
        sampleCount: dataset.sampleCount,
      })

      // NNModel 인스턴스 생성 (타입 안전성을 위해 명시적 변환)
      const nnModel = new NNModel({
        inputShape: nodeData.inputShape,
        outputUnits: nodeData.outputUnits,
        layers: nodeData.layers as any, // LayerConfig 타입 호환성을 위한 임시 변환
        name: nodeData.label || 'Model',
      })

      // 데이터셋에 따라 적절한 loss 함수 자동 추론
      const inferredLoss = inferLossFunctionFromDataset(dataset)

      // 추론된 loss 함수를 우선 사용, 사용자 설정이 없으면 추론된 값 사용
      const finalLoss = currentTrainingConfig.loss || inferredLoss
      console.log(
        `🎯 Final loss function: ${finalLoss} (user: ${currentTrainingConfig.loss || 'auto'}, inferred: ${inferredLoss})`
      )

      // TensorFlow.js에서 인식하는 loss 함수 이름 매핑 및 검증
      const getTensorFlowLoss = (lossName: string): string => {
        // TensorFlow.js에서 사용하는 정확한 이름들
        const validLosses: Record<string, string> = {
          meanSquaredError: 'meanSquaredError',
          categoricalCrossentropy: 'categoricalCrossentropy',
          binaryCrossentropy: 'binaryCrossentropy',
          // 별칭들도 지원
          mse: 'meanSquaredError',
          categorical_crossentropy: 'categoricalCrossentropy',
          binary_crossentropy: 'binaryCrossentropy',
        }

        const mappedLoss = validLosses[lossName] || lossName
        console.log(`🔧 Loss mapping: ${lossName} -> ${mappedLoss}`)
        return mappedLoss
      }

      const tensorflowLoss = getTensorFlowLoss(finalLoss)

      const modelTrainingConfig = createNeuralNetworkConfig({
        optimizer: currentTrainingConfig.optimizer,
        learningRate: currentTrainingConfig.learningRate || 0.001,
        loss: tensorflowLoss as any,
        metrics: currentTrainingConfig.metrics,
        epochs: currentTrainingConfig.epochs,
        batchSize: currentTrainingConfig.batchSize,
        validationSplit: currentTrainingConfig.validationSplit,
      })

      // 진행 상황 콜백 함수
      const onProgress = (epoch: number, logs: any) => {
        console.log(`📈 Epoch ${epoch + 1}:`, logs)
        updateNodeData(id, {
          trainingProgress: {
            epoch: epoch + 1,
            totalEpochs: currentTrainingConfig.epochs,
            loss: logs.loss || 0,
            accuracy: logs.accuracy,
            valLoss: logs.val_loss,
            valAccuracy: logs.val_accuracy,
            isTraining: true,
            startTime: nodeData.trainingProgress?.startTime || new Date(),
          },
        })
      }

      // 실제 모델 학습 실행
      const { model: trainedModel, result } = await nnModel.createAndTrain(dataset, modelTrainingConfig, onProgress)

      // 학습된 모델 인스턴스를 스토어에 저장
      const { setModelInstance } = useModelStore.getState()
      setModelInstance(id, {
        tfModel: trainedModel, // 학습된 TensorFlow.js 모델 인스턴스
        nnModel: nnModel, // NNModel 인스턴스
        dataset: dataset, // 학습에 사용된 데이터셋
        trainingConfig: modelTrainingConfig,
        trainingResult: result,
      })


      // 학습 완료 상태로 업데이트
      updateNodeData(id, {
        state: 'trained',
        trainingProgress: {
          epoch: result.epochs,
          totalEpochs: currentTrainingConfig.epochs,
          loss: result.finalMetrics.loss || 0,
          accuracy: result.finalMetrics.accuracy,
          valLoss: result.finalMetrics.valLoss,
          valAccuracy: result.finalMetrics.valAccuracy,
          isTraining: false,
          startTime: nodeData.trainingProgress?.startTime || new Date(),
          endTime: new Date(),
        },
        metrics: {
          loss: result.finalMetrics.loss || 0,
          accuracy: result.finalMetrics.accuracy,
          valLoss: result.finalMetrics.valLoss,
          valAccuracy: result.finalMetrics.valAccuracy,
          trainTime: result.duration,
        },
        lossHistory: result.history.loss,
        accuracyHistory: result.history.accuracy,
      })

      console.log('✅ Training completed for node:', id)
      console.log('📊 Final metrics:', result.finalMetrics)
    } catch (error) {
      console.error('❌ Training failed:', error)
      updateNodeData(id, {
        state: 'error',
        error: error instanceof Error ? error.message : String(error),
        trainingProgress: {
          ...nodeData.trainingProgress,
          isTraining: false,
        },
      })
    }
  }

  return (
    <div
      className={`
        relative min-w-[200px] max-w-[280px] rounded-lg border-2 shadow-lg transition-all duration-200
        ${style.border} ${style.bg}
        ${selected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        hover:shadow-xl cursor-pointer
      `}
    >
      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        id="model-output"
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ right: -6 }}
      />

      {/* 헤더 */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StateIcon className={`w-4 h-4 ${style.iconColor}`} />
            <span className={`text-sm font-medium ${style.text}`}>{nodeData.label || '모델'}</span>
          </div>

          {/* 상태 배지 */}
          <div
            className={`px-2 py-1 text-xs rounded-full ${style.bg} ${style.text} border ${style.border}`}
          >
            {getStateLabel(nodeData.state)}
          </div>
        </div>

        {/* 모델 타입 */}
        <div className="mt-1">
          <span className="text-xs text-gray-500">
            {nodeData.modelType === 'neural-network' ? '신경망' : String(nodeData.modelType)}
          </span>
        </div>

        {/* 데이터 연결 섹션 */}
        <div className="mt-2 relative">
          <div className="flex items-center gap-2 relative">
            <Database className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">데이터</span>
            {/* 데이터 입력 핸들 - 데이터 레벨과 정렬 */}
            <Handle
              type="target"
              position={Position.Left}
              id="data-input"
              className="w-2 h-2 bg-purple-500 border border-white !absolute !left-[-10px] !top-[1px]"
            />
          </div>

          {/* 데이터 연결 정보 표시 */}
          {connectedDataInfo ? (
            <div className="mt-1 text-xs text-gray-600 bg-purple-50 p-2 rounded border border-purple-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-purple-700">연결된 데이터</span>
                <span className="text-purple-600">{connectedDataInfo.name}</span>
              </div>
              {connectedDataInfo.samples > 0 && (
                <div className="flex justify-between">
                  <span>샘플 수:</span>
                  <span className="font-mono text-purple-700">
                    {connectedDataInfo.samples.toLocaleString()}
                  </span>
                </div>
              )}
              {connectedDataInfo.inputShape && (
                <div className="flex justify-between">
                  <span>Input Shape:</span>
                  <span className="font-mono text-purple-700">
                    {connectedDataInfo.inputShape.join('×')}
                  </span>
                </div>
              )}
              {connectedDataInfo.outputShape && (
                <div className="flex justify-between">
                  <span>Output Shape:</span>
                  <span className="font-mono text-purple-700">
                    {connectedDataInfo.outputShape.join('×')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-1 text-xs text-gray-400 italic">데이터 노드를 연결하세요</div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="p-3 space-y-2">
        {/* 모델 구조 정보 */}
        <div className="text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span>레이어:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono">{nodeData.layers?.length || 0}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLayerEditorOpen(true)
                }}
                className="p-0.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                title="레이어 구성 편집"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 모델 구조 요약 정보 */}
        {nodeData.layers && nodeData.layers.length > 0 && (
          <div className="mt-2 space-y-1">
            {/* Input Layer */}
            {nodeData.inputShape && (
              <div className="text-xs bg-blue-50 border border-blue-200 px-2 py-1 rounded flex justify-between">
                <span className="font-medium text-blue-700">Input</span>
                <span className="text-blue-600">{nodeData.inputShape.join('×')}</span>
              </div>
            )}

            {/* Hidden Layers */}
            {nodeData.layers.slice(0, 3).map((layer: any, index: number) => {
              // activation 함수 정보 추출
              const getLayerDetails = (layer: any) => {
                const details = []

                if (layer.units) details.push(`${layer.units} units`)
                if (layer.filters) details.push(`${layer.filters} filters`)
                if (layer.rate) details.push(`${(layer.rate * 100).toFixed(0)}%`)
                if (layer.activation && layer.activation !== 'linear') {
                  details.push(`${layer.activation}`)
                }

                return details.join(' • ')
              }

              return (
                <div
                  key={index}
                  className="text-xs bg-gray-100 px-2 py-1 rounded flex justify-between"
                >
                  <span className="font-medium capitalize">{layer.type}</span>
                  <span className="text-gray-500">{getLayerDetails(layer)}</span>
                </div>
              )
            })}

            {nodeData.layers.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{nodeData.layers.length - 3} more hidden layers
              </div>
            )}

            {/* Output Layer */}
            {nodeData.outputUnits && (
              <div className="text-xs bg-green-50 border border-green-200 px-2 py-1 rounded flex justify-between">
                <span className="font-medium text-green-700">Output</span>
                <span className="text-green-600">
                  {nodeData.outputUnits} {nodeData.outputUnits === 1 ? 'unit' : 'units'}
                  {nodeData.outputUnits === 1 ? ' (sigmoid)' : ' (softmax)'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 학습 파라미터 설정 */}
        {nodeData.state === 'definition' && nodeData.layers && nodeData.layers.length > 0 && (
          <div className="mt-2 space-y-2">
            {/* 학습 설정 토글 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsTrainingConfigOpen(!isTrainingConfigOpen)
              }}
              className="w-full px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                학습 설정
              </div>
              {isTrainingConfigOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {/* 학습 설정 패널 */}
            {isTrainingConfigOpen && (
              <div className="space-y-2 p-2 bg-gray-50 rounded border">
                {/* Optimizer */}
                <div className="grid grid-cols-2 gap-1 items-center">
                  <label className="text-xs text-gray-600">Optimizer:</label>
                  <select
                    value={currentTrainingConfig.optimizer}
                    onChange={(e) => updateTrainingConfig({ optimizer: e.target.value as any })}
                    className="text-xs border rounded px-1 py-0.5"
                  >
                    <option value="adam">Adam</option>
                    <option value="sgd">SGD</option>
                    <option value="rmsprop">RMSprop</option>
                  </select>
                </div>

                {/* Loss Function */}
                <div className="grid grid-cols-2 gap-1 items-center">
                  <label className="text-xs text-gray-600">Loss:</label>
                  <select
                    value={currentTrainingConfig.loss}
                    onChange={(e) => updateTrainingConfig({ loss: e.target.value as any })}
                    className="text-xs border rounded px-1 py-0.5"
                  >
                    <option value="categoricalCrossentropy">Categorical</option>
                    <option value="binaryCrossentropy">Binary</option>
                    <option value="meanSquaredError">MSE</option>
                  </select>
                </div>

                {/* Epochs */}
                <div className="grid grid-cols-2 gap-1 items-center">
                  <label className="text-xs text-gray-600">Epochs:</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={currentTrainingConfig.epochs}
                    onChange={(e) =>
                      updateTrainingConfig({ epochs: parseInt(e.target.value) || 10 })
                    }
                    className="text-xs border rounded px-1 py-0.5 w-full"
                  />
                </div>

                {/* Batch Size */}
                <div className="grid grid-cols-2 gap-1 items-center">
                  <label className="text-xs text-gray-600">Batch Size:</label>
                  <input
                    type="number"
                    min="1"
                    max="512"
                    value={currentTrainingConfig.batchSize}
                    onChange={(e) =>
                      updateTrainingConfig({ batchSize: parseInt(e.target.value) || 32 })
                    }
                    className="text-xs border rounded px-1 py-0.5 w-full"
                  />
                </div>

                {/* Learning Rate */}
                <div className="grid grid-cols-2 gap-1 items-center">
                  <label className="text-xs text-gray-600">Learn Rate:</label>
                  <input
                    type="number"
                    min="0.0001"
                    max="1"
                    step="0.0001"
                    value={currentTrainingConfig.learningRate}
                    onChange={(e) =>
                      updateTrainingConfig({ learningRate: parseFloat(e.target.value) || 0.001 })
                    }
                    className="text-xs border rounded px-1 py-0.5 w-full"
                  />
                </div>

                {/* Validation Split */}
                <div className="grid grid-cols-2 gap-1 items-center">
                  <label className="text-xs text-gray-600">Val Split:</label>
                  <input
                    type="number"
                    min="0"
                    max="0.5"
                    step="0.1"
                    value={currentTrainingConfig.validationSplit}
                    onChange={(e) =>
                      updateTrainingConfig({ validationSplit: parseFloat(e.target.value) || 0.2 })
                    }
                    className="text-xs border rounded px-1 py-0.5 w-full"
                  />
                </div>
              </div>
            )}

            {/* 학습 시작 버튼 */}
            {connectedDataInfo && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartTraining()
                }}
                className="w-full px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={nodeData.state !== 'definition'}
              >
                <Play className="w-3 h-3" />
                모델 학습 시작
              </button>
            )}

            {/* 데이터 연결 필요 메시지 */}
            {!connectedDataInfo && (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                ⚠️ 학습을 위해 데이터 노드를 연결하세요
              </div>
            )}
          </div>
        )}

        {/* 학습 진행 상황 */}
        {nodeData.state === 'training' && nodeData.trainingProgress && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-yellow-600">
              <Clock className="w-3 h-3" />
              <span>
                에포크 {nodeData.trainingProgress.epoch}/{nodeData.trainingProgress.totalEpochs}
              </span>
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(nodeData.trainingProgress.epoch / nodeData.trainingProgress.totalEpochs) * 100}%`,
                }}
              />
            </div>

            {/* 손실값 */}
            {nodeData.trainingProgress.loss !== undefined && (
              <div className="text-xs text-gray-600">
                Loss: {nodeData.trainingProgress.loss.toFixed(4)}
              </div>
            )}
          </div>
        )}

        {/* 학습 완료 지표 */}
        {nodeData.state === 'trained' && nodeData.metrics && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-green-600">
              <BarChart3 className="w-3 h-3" />
              <span>학습 완료</span>
            </div>

            <div className="text-xs text-gray-600 space-y-0.5">
              <div className="flex justify-between">
                <span>Loss:</span>
                <span className="font-mono">{nodeData.metrics.loss?.toFixed(4)}</span>
              </div>
              {nodeData.metrics.accuracy && (
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-mono">{(nodeData.metrics.accuracy * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* 예측 섹션 */}
            <div className="space-y-1 pt-1 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Target className="w-3 h-3" />
                  <span>예측</span>
                </div>
                
                {/* 예측 생성 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGeneratePredictions()
                  }}
                  disabled={nodeData.isGeneratingPredictions}
                  className="p-1 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                  title="예측 결과 생성"
                >
                  {nodeData.isGeneratingPredictions ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Target className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* 예측 결과 미리보기 */}
              {nodeData.predictions && nodeData.predictions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">
                    {nodeData.predictions.length}개 샘플 예측 완료
                    {nodeData.lastPredictionTime && (
                      <span className="ml-1">
                        ({new Date(nodeData.lastPredictionTime).toLocaleTimeString()})
                      </span>
                    )}
                  </div>
                  
                  {/* 첫 번째 예측 결과 미리보기 */}
                  <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
                    <div className="font-medium text-blue-700 mb-1">샘플 예측:</div>
                    {(() => {
                      const firstPrediction = nodeData.predictions[0]
                      const datasetId = connectedDataInfo?.name?.toLowerCase()
                      
                      if (datasetId === 'mnist') {
                        return (
                          <div className="flex justify-between items-center">
                            <span>예측: {firstPrediction.predictedClass}</span>
                            <span>신뢰도: {((firstPrediction.confidence || 0) * 100).toFixed(1)}%</span>
                          </div>
                        )
                      } else if (datasetId?.includes('iris')) {
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>예측: {firstPrediction.predictedClass}</span>
                              <span>신뢰도: {((firstPrediction.confidence || 0) * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        )
                      } else if (datasetId?.includes('car') || datasetId?.includes('mpg')) {
                        return (
                          <div className="flex justify-between">
                            <span>예측 연비: {firstPrediction.predictedClass} MPG</span>
                            {firstPrediction.error && (
                              <span>오차: ±{firstPrediction.error.toFixed(1)}</span>
                            )}
                          </div>
                        )
                      } else {
                        return (
                          <div className="flex justify-between">
                            <span>예측값: {String(firstPrediction.predictedClass).substring(0, 10)}</span>
                            <span>신뢰도: {((firstPrediction.confidence || 0) * 100).toFixed(1)}%</span>
                          </div>
                        )
                      }
                    })()}
                  </div>

                  {/* 상세보기 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // 속성 패널에서 상세 예측 결과 보기 (추후 구현)
                      console.log('Show detailed predictions in properties panel')
                    }}
                    className="w-full px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    상세 결과 보기 ({nodeData.predictions.length})
                  </button>
                </div>
              )}

              {/* 예측 결과가 없을 때 */}
              {!nodeData.predictions && !nodeData.isGeneratingPredictions && (
                <div className="text-xs text-gray-400 italic">
                  예측 버튼을 클릭하여 테스트해보세요
                </div>
              )}
            </div>
          </div>
        )}

        {/* 오류 메시지 */}
        {nodeData.state === 'error' && nodeData.error && (
          <div className="text-xs text-red-600 bg-red-100 p-2 rounded">{nodeData.error}</div>
        )}
      </div>

      {/* 레이어 에디터 팝업 */}
      <LayerEditor
        isOpen={isLayerEditorOpen}
        onClose={() => setIsLayerEditorOpen(false)}
        initialLayers={nodeData.layers || []}
        onSave={handleLayersSave}
        modelNodeId={id}
      />
    </div>
  )
}

export default ModelNode

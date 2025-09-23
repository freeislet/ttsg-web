import { LayerConfig as UILayerConfig } from '@/types/ModelNode'
import { LayerConfig as ModelLayerConfig } from '@/models'
import { LayerNodeData } from '@/types/LayerEditor'

/**
 * 레이어 에디터의 LayerNodeData를 UI LayerConfig로 변환
 */
export function layerNodeDataToUILayerConfig(layerData: LayerNodeData): UILayerConfig {
  const config: UILayerConfig = {
    type: layerData.layerType as any
  }

  // 레이어 타입별 속성 매핑
  switch (layerData.layerType) {
    case 'dense':
      if (layerData.units) config.units = layerData.units
      if (layerData.activation) config.activation = layerData.activation
      break
      
    case 'conv2d':
      if (layerData.filters) config.filters = layerData.filters
      if (layerData.kernelSize) config.kernelSize = layerData.kernelSize
      if (layerData.activation) config.activation = layerData.activation
      if (layerData.padding) config.padding = layerData.padding
      if (layerData.strides) config.strides = layerData.strides
      break
      
    case 'lstm':
      if (layerData.units) config.units = layerData.units
      if (layerData.activation) config.activation = layerData.activation
      if (layerData.returnSequences !== undefined) config.returnSequences = layerData.returnSequences
      break
      
    case 'dropout':
      if (layerData.rate) config.rate = layerData.rate
      break
      
    case 'flatten':
      // Flatten 레이어는 추가 속성이 없음
      break
  }

  return config
}

/**
 * UI LayerConfig를 레이어 에디터의 LayerNodeData로 변환
 */
export function uiLayerConfigToLayerNodeData(
  config: UILayerConfig, 
  index: number
): LayerNodeData {
  const layerData: LayerNodeData = {
    label: config.type.charAt(0).toUpperCase() + config.type.slice(1),
    layerType: config.type as any,
    layerIndex: index
  }

  // 레이어 타입별 속성 매핑
  switch (config.type) {
    case 'dense':
      layerData.units = config.units
      layerData.activation = config.activation
      break
      
    case 'conv2d':
      layerData.filters = config.filters
      layerData.kernelSize = config.kernelSize
      layerData.activation = config.activation
      layerData.padding = config.padding
      layerData.strides = config.strides
      break
      
    case 'lstm':
      layerData.units = config.units
      layerData.activation = config.activation
      layerData.returnSequences = config.returnSequences
      break
      
    case 'dropout':
      layerData.rate = config.rate
      break
      
    case 'flatten':
      // Flatten 레이어는 추가 속성이 없음
      break
  }

  return layerData
}

/**
 * UI LayerConfig를 TensorFlow.js 모델 LayerConfig로 변환
 */
export function uiLayerConfigToModelLayerConfig(config: UILayerConfig): ModelLayerConfig {
  // UI LayerConfig와 Model LayerConfig가 동일한 구조를 가지므로 직접 변환
  return {
    type: config.type,
    units: config.units,
    activation: config.activation,
    filters: config.filters,
    kernelSize: config.kernelSize,
    padding: config.padding,
    strides: config.strides,
    returnSequences: config.returnSequences,
    rate: config.rate
  } as ModelLayerConfig
}

/**
 * TensorFlow.js 모델 LayerConfig를 UI LayerConfig로 변환
 */
export function modelLayerConfigToUILayerConfig(config: ModelLayerConfig): UILayerConfig {
  // Model LayerConfig와 UI LayerConfig가 동일한 구조를 가지므로 직접 변환
  return config as UILayerConfig
}

/**
 * 레이어 배열을 TensorFlow.js 모델 생성용으로 변환
 */
export function convertLayersForModel(layers: UILayerConfig[]): ModelLayerConfig[] {
  return layers.map(uiLayerConfigToModelLayerConfig)
}

/**
 * 레이어 에디터 데이터를 모델 생성용 설정으로 변환
 */
export function convertLayerEditorDataToModelConfig(
  layerNodes: LayerNodeData[],
  inputShape: number[],
  outputUnits: number
) {
  // 입력/출력 노드 제외하고 히든 레이어만 추출
  const hiddenLayers = layerNodes
    .filter(node => node.layerType !== 'input' && node.layerType !== 'output')
    .sort((a, b) => (a.layerIndex || 0) - (b.layerIndex || 0))
    .map(layerNodeDataToUILayerConfig)

  return {
    inputShape,
    outputUnits,
    layers: convertLayersForModel(hiddenLayers),
    name: 'Neural Network Model'
  }
}

/**
 * 데이터 타입에 따른 기본 손실 함수 추론
 */
export function inferLossFunction(outputUnits: number, datasetType?: string): string {
  // 이진 분류
  if (outputUnits === 1) {
    return 'binaryCrossentropy'
  }
  
  // 다중 분류
  if (outputUnits > 1) {
    // MNIST, Iris 등 분류 문제
    if (datasetType && ['mnist', 'iris'].includes(datasetType)) {
      return 'categoricalCrossentropy'
    }
    return 'categoricalCrossentropy'
  }
  
  // 회귀 문제 (출력이 1개이지만 연속값)
  if (datasetType && ['car-mpg', 'linear', 'sine', 'quadratic', 'gaussian'].includes(datasetType)) {
    return 'meanSquaredError'
  }
  
  return 'meanSquaredError'
}

/**
 * 데이터 타입에 따른 기본 메트릭 추론
 */
export function inferMetrics(outputUnits: number, datasetType?: string): string[] {
  // 분류 문제
  if (outputUnits > 1 || (outputUnits === 1 && datasetType && ['mnist', 'iris'].includes(datasetType))) {
    return ['accuracy']
  }
  
  // 회귀 문제
  return ['meanAbsoluteError']
}

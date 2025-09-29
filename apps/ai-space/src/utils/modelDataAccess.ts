import { ModelNode } from '@/types/ModelNode'
import { dataRegistry } from '@/data'

/**
 * 모델 노드에서 데이터셋 정보를 효율적으로 가져오는 유틸리티 함수들
 */

/**
 * 모델에 연결된 데이터셋 정보 가져오기 (캐시 우선)
 */
export function getModelDataset(modelNode: ModelNode) {
  // 1. 캐시된 연결 정보에서 먼저 확인
  if (modelNode.data.connectedDataNode?.dataset) {
    console.log(`🚀 Using cached dataset for model: ${modelNode.id}`)
    return modelNode.data.connectedDataNode.dataset
  }

  // 2. 캐시된 데이터셋 ID로 레지스트리에서 조회
  if (modelNode.data.connectedDataNode?.datasetId) {
    const registryDataset = dataRegistry.getById(modelNode.data.connectedDataNode.datasetId)
    if (registryDataset) {
      console.log(`📊 Using registry dataset for model: ${modelNode.id}`)
      return registryDataset
    }
  }

  console.log(`❌ No dataset found for model: ${modelNode.id}`)
  return null
}

/**
 * 모델의 입력 Shape 가져오기 (캐시 우선)
 */
export function getModelInputShape(modelNode: ModelNode): number[] | null {
  // 1. 모델 노드에서 직접 확인
  if (modelNode.data.inputShape) {
    return modelNode.data.inputShape
  }

  // 2. 캐시된 연결 데이터에서 확인
  if (modelNode.data.connectedDataNode?.inputShape) {
    return modelNode.data.connectedDataNode.inputShape
  }

  return null
}

/**
 * 모델의 출력 유닛 수 가져오기 (캐시 우선)
 */
export function getModelOutputUnits(modelNode: ModelNode): number | null {
  // 1. 모델 노드에서 직접 확인
  if (modelNode.data.outputUnits) {
    return modelNode.data.outputUnits
  }

  // 2. 캐시된 연결 데이터에서 확인
  if (modelNode.data.connectedDataNode?.outputUnits) {
    return modelNode.data.connectedDataNode.outputUnits
  }

  return null
}

/**
 * 연결된 데이터셋의 예측 설정 가져오기
 */
export function getModelPredictionConfig(modelNode: ModelNode) {
  const dataset = getModelDataset(modelNode)
  if (!dataset) return null

  // dataRegistry에서 예측 설정 조회
  if (modelNode.data.connectedDataNode?.datasetId) {
    const registryDesc = dataRegistry.getById(modelNode.data.connectedDataNode.datasetId)
    return registryDesc?.prediction || null
  }

  return null
}

/**
 * 연결된 데이터셋의 시각화 설정 가져오기
 */
export function getModelVisualizationConfigs(modelNode: ModelNode) {
  if (modelNode.data.connectedDataNode?.datasetId) {
    const registryDesc = dataRegistry.getById(modelNode.data.connectedDataNode.datasetId)
    return registryDesc?.visualizations || []
  }

  return []
}

/**
 * 모델의 데이터 연결 상태 확인
 */
export function isModelDataConnected(modelNode: ModelNode): boolean {
  return !!(
    modelNode.data.connectedDataNode?.isConnected &&
    modelNode.data.connectedDataNode?.datasetId
  )
}

/**
 * 캐시된 데이터의 유효성 확인
 */
export function isModelDataCacheValid(modelNode: ModelNode): boolean {
  const connectedData = modelNode.data.connectedDataNode
  if (!connectedData || !connectedData.lastUpdated) {
    return false
  }

  // 5초 이내의 캐시는 유효한 것으로 간주
  const cacheAge = Date.now() - connectedData.lastUpdated.getTime()
  return cacheAge < 5000
}

/**
 * 모델의 데이터 연결 요약 정보 (UI 표시용)
 */
export function getModelDataSummary(modelNode: ModelNode) {
  const connectedData = modelNode.data.connectedDataNode
  
  if (!connectedData || !connectedData.isConnected) {
    return {
      status: 'disconnected',
      message: '데이터가 연결되지 않음',
      datasetName: null,
      inputShape: null,
      outputUnits: null,
      samples: null,
    }
  }

  const isValid = isModelDataCacheValid(modelNode)
  
  return {
    status: isValid ? 'connected' : 'stale',
    message: isValid ? '데이터 연결됨' : '캐시된 데이터 (오래됨)',
    datasetName: connectedData.name,
    datasetId: connectedData.datasetId,
    inputShape: connectedData.inputShape,
    outputUnits: connectedData.outputUnits,
    samples: connectedData.samples,
    features: connectedData.features,
    lastUpdated: connectedData.lastUpdated,
  }
}

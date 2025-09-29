import { DatasetDesc, VisualizationConfig, PredictionConfig } from './types'
import { dataRegistry } from './registry'

/**
 * 레지스트리 기반 데이터셋 관리
 * - 각 데이터셋 파일에서 자신을 등록
 * - 이 파일은 헬퍼 함수들만 제공
 */

/**
 * 모든 데이터셋 프리셋 가져오기 (레지스트리 기반)
 */
export function getDataPresets(): DatasetDesc[] {
  return dataRegistry.all()
}

/**
 * ID로 데이터셋 프리셋 가져오기
 */
export function getDataPreset(id: string): DatasetDesc | undefined {
  return dataRegistry.getById(id)
}

/**
 * 카테고리별 데이터셋 프리셋 가져오기
 */
export function getPresetsByCategory(category: 'sample' | 'computed'): DatasetDesc[] {
  return dataRegistry.byCategory(category)
}

/**
 * 태그별 데이터셋 프리셋 가져오기
 */
export function getPresetsByTag(tag: string): DatasetDesc[] {
  return dataRegistry.byTag(tag)
}

/**
 * 난이도별 데이터셋 프리셋 가져오기
 */
export function getPresetsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): DatasetDesc[] {
  return dataRegistry.byDifficulty(difficulty)
}

/**
 * 데이터셋의 기본 시각화 설정 가져오기
 */
export function getDefaultVisualization(presetId: string): VisualizationConfig | undefined {
  const preset = dataRegistry.getById(presetId)
  return preset?.visualizations?.[0]
}

/**
 * 데이터셋의 모든 시각화 설정 가져오기
 */
export function getVisualizationConfigs(presetId: string): VisualizationConfig[] {
  const preset = dataRegistry.getById(presetId)
  return preset?.visualizations || []
}

/**
 * 데이터셋의 예측 설정 가져오기
 */
export function getPredictionConfig(presetId: string): PredictionConfig | undefined {
  const preset = dataRegistry.getById(presetId)
  return preset?.prediction
}

/**
 * 예측 표시 설정 가져오기
 */
export function getPredictionDisplayConfig(presetId: string) {
  const config = getPredictionConfig(presetId)
  return config?.display
}

/**
 * 예측 입력 설정 가져오기
 */
export function getPredictionInputConfig(presetId: string) {
  const config = getPredictionConfig(presetId)
  return config?.input
}

// 레거시 DATA_PRESETS 배열은 제거됨 - 각 데이터셋 파일에서 dataRegistry.register() 사용
// 레거시 DATA_PRESETS_MAP은 제거됨 - dataRegistry.getById() 사용

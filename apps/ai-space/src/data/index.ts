/**
 * 데이터 모듈 통합 export
 */

// 타입들
export type {
  DataCategory,
  IDataset,
  DataLoader,
  DatasetDesc,
  ComputedDataFunction,
  ComputedDataConfig,
  DataViewMode,
  DataNodeState,
  FunctionInfo,
  DatasetStats,
  VisualizationConfig,
  PredictionConfig,
  VisualizationType,
  ChartType,
  AxisConfig,
  ChartConfig,
} from './types'

// 레지스트리
export { DataRegistry, dataRegistry } from './registry'

// 헬퍼 함수들 (레지스트리 기반)
export {
  getPresetsByCategory,
  getPresetsByTag,
  getPresetsByDifficulty,
  getDataPresets,
  getDataPreset,
  getDefaultVisualization,
  getVisualizationConfigs,
  getPredictionConfig,
  getPredictionDisplayConfig,
  getPredictionInputConfig,
} from './presets'

// 데이터셋 로더들
export {
  BaseDataset,
  loadMNIST,
  loadIris,
  loadCarMPG,
  IRIS_CLASSES,
  COMPUTED_FUNCTIONS,
  createComputedDataLoader,
  loadLinearData,
  loadSineData,
  getFunctionsByCategory,
} from './datasets'

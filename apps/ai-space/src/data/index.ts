/**
 * 데이터 모듈 통합 export
 */

// 타입들
export type {
  DataCategory,
  IDataset,
  DataLoader,
  DataPreset,
  DatasetDesc,
  ComputedDataFunction,
  ComputedDataConfig,
  DataViewMode,
  DataNodeState,
  FunctionInfo,
  DatasetStats,
  VisualizationType,
  ChartType,
  AxisConfig,
  ChartConfig,
  VisualizationConfig,
} from './types'

// 레지스트리
export { DataRegistry, dataRegistry } from './registry'

// 프리셋들 (레거시 호환성)
export {
  DATA_PRESETS,
  DATA_PRESETS_MAP,
  getPresetsByCategory,
  getPresetsByTag,
  getPresetsByDifficulty,
  getDataPresets,
  getDataPreset,
  getDefaultVisualization,
  getVisualizationConfigs,
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

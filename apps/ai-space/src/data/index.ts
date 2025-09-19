/**
 * 데이터 모듈 통합 export
 */

// 타입들
export type {
  DataCategory,
  IDataset,
  DataLoader,
  DataPreset,
  ComputedDataFunction,
  ComputedDataConfig,
  DataViewMode,
  DataNodeState,
  FunctionInfo,
  DatasetStats
} from './types'

// 프리셋들
export {
  DATA_PRESETS,
  DATA_PRESETS_MAP,
  getPresetsByCategory,
  getPresetsByTag,
  getPresetsByDifficulty,
  getDataPresets,
  getDataPreset
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
  getFunctionsByCategory
} from './datasets'

import { DataPresetConfig } from '@/types/DataTypes'

/**
 * 사전 정의된 데이터셋 프리셋 배열
 */
export const DATA_PRESETS: DataPresetConfig[] = [
  {
    id: 'cars-mpg',
    name: 'Cars MPG Dataset',
    description: '자동차 연비 예측 데이터셋 (마력, 무게 등 → MPG)',
    url: 'https://storage.googleapis.com/tfjs-tutorials/carsData.json',
    inputColumns: ['Horsepower', 'Weight'],
    outputColumns: ['Miles_per_Gallon'],
    sampleSize: 392
  },
  
  {
    id: 'iris',
    name: 'Iris Flower Dataset',
    description: '붓꽃 분류 데이터셋 (꽃잎/꽃받침 크기 → 품종)',
    url: '/data/iris.json',
    inputColumns: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
    outputColumns: ['species'],
    sampleSize: 150
  },
  
  {
    id: 'housing',
    name: 'Boston Housing Dataset',
    description: '보스턴 주택 가격 예측 데이터셋',
    url: '/data/housing.json',
    inputColumns: ['crime_rate', 'rooms', 'age', 'distance'],
    outputColumns: ['price'],
    sampleSize: 506
  }
]

/**
 * ID를 키로 하는 프리셋 맵
 */
export const DATA_PRESETS_MAP: Record<string, DataPresetConfig> = DATA_PRESETS.reduce(
  (map, preset) => {
    map[preset.id] = preset
    return map
  },
  {} as Record<string, DataPresetConfig>
)

/**
 * 프리셋 목록 반환
 */
export const getDataPresets = (): DataPresetConfig[] => {
  return DATA_PRESETS
}

/**
 * 특정 프리셋 반환
 */
export const getDataPreset = (id: string): DataPresetConfig | undefined => {
  return DATA_PRESETS_MAP[id]
}

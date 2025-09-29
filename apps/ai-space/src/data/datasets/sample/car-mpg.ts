import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from '../BaseDataset'
import { IDataset, ProgressCallback } from '../../types'
import { dataRegistry } from '../../registry'

/**
 * Car MPG 데이터 인터페이스
 */
interface CarData {
  mpg: number
  horsepower: number
}

/**
 * Car MPG 데이터셋 클래스
 */
class CarMPGDataset extends BaseDataset {
  readonly inputs: tf.Tensor
  readonly labels: tf.Tensor
  readonly inputShape: number[] = [1]
  readonly outputShape: number[] = [1]
  readonly inputColumns: string[] = ['horsepower']
  readonly outputColumns: string[] = ['mpg']
  readonly sampleCount: number

  /**
   * 전체 입력/레이블 텐서를 받아 데이터셋 생성
   * 분할 정보는 모델 학습 단계에서 처리함
   */
  constructor(inputs: tf.Tensor, labels: tf.Tensor) {
    super()
    this.inputs = inputs
    this.labels = labels
    this.sampleCount = inputs.shape[0]
  }
}

/**
 * 자동차 데이터 다운로드 및 정제
 */
async function getData(): Promise<CarData[]> {
  console.log('📥 Downloading car MPG data...')

  try {
    const carsDataResponse = await fetch(
      'https://storage.googleapis.com/tfjs-tutorials/carsData.json'
    )

    if (!carsDataResponse.ok) {
      throw new Error(`HTTP error! status: ${carsDataResponse.status}`)
    }

    const carsData = await carsDataResponse.json()

    // 필요한 변수만 추출하고 결측값 제거
    const cleaned = carsData
      .map((car: any) => ({
        mpg: car.Miles_per_Gallon,
        horsepower: car.Horsepower,
      }))
      .filter((car: CarData) => car.mpg != null && car.horsepower != null)

    console.log(`✅ Downloaded and cleaned ${cleaned.length} car records`)

    return cleaned
  } catch (error) {
    console.error('❌ Failed to download car data:', error)
    throw error
  }
}

/**
 * 데이터를 텐서로 변환하고 정규화
 */
function convertToTensors(data: CarData[]): { inputs: tf.Tensor; labels: tf.Tensor } {
  return tf.tidy(() => {
    // 데이터 셔플
    tf.util.shuffle(data)

    // 특성과 레이블 분리
    const inputs = data.map((d) => d.horsepower)
    const labels = data.map((d) => d.mpg)

    // 텐서 생성
    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1])
    const labelTensor = tf.tensor2d(labels, [labels.length, 1])

    // 입력 데이터 정규화 (0-1 범위로)
    const inputMax = inputTensor.max()
    const inputMin = inputTensor.min()
    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin))

    // 레이블 데이터 정규화 (0-1 범위로)
    const labelMax = labelTensor.max()
    const labelMin = labelTensor.min()
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin))

    return { inputs: normalizedInputs, labels: normalizedLabels }
  })
}

/**
 * Car MPG 데이터셋 로더
 */
export async function loadCarMPG(onProgress?: ProgressCallback): Promise<IDataset> {
  console.log('🚗 Loading Car MPG dataset...')
  onProgress?.(0, 'initializing', 'Car MPG 데이터셋 초기화...')

  try {
    // 데이터 다운로드
    onProgress?.(20, 'downloading', '데이터 다운로드 중...')
    const data = await getData()

    // 텐서로 변환
    onProgress?.(60, 'processing', '데이터 변환 중...')
    const { inputs, labels } = convertToTensors(data)

    onProgress?.(90, 'creating', '데이터셋 생성 중...')
    const dataset = new CarMPGDataset(inputs, labels)

    onProgress?.(100, 'completed', '로딩 완료!')
    console.log('✅ Car MPG dataset loaded successfully')
    console.log('📈 Task: Predict MPG from Horsepower (regression)')

    return dataset
  } catch (error) {
    console.error('❌ Failed to load Car MPG dataset:', error)
    throw error
  }
}

// 레지스트리 등록
dataRegistry.register({
  id: 'car-mpg',
  name: 'Car MPG Prediction',
  description: '자동차 연비 예측 데이터셋 (마력 → MPG 예측)',
  category: 'sample',
  loader: loadCarMPG,
  tags: ['regression', 'tabular', 'beginner'],
  difficulty: 'beginner',
  estimatedSize: '15KB',
  visualizations: [
    {
      type: 'scatter',
      title: '마력 vs 연비',
      description: '자동차 마력과 연비 간의 관계',
      chartConfig: {
        type: 'scatter',
        xAxis: { column: 'horsepower', label: '마력 (HP)', type: 'continuous' },
        yAxis: { column: 'mpg', label: '연비 (MPG)', type: 'continuous' },
        title: '마력과 연비의 상관관계',
      },
    },
    {
      type: 'chart',
      title: '연비 분포',
      description: '자동차 연비 히스토그램',
      chartConfig: {
        type: 'histogram',
        xAxis: { column: 'mpg', label: '연비 (MPG)', type: 'continuous' },
        yAxis: { column: 'count', label: '빈도', type: 'continuous' },
        title: '자동차 연비 분포',
      },
    },
    {
      type: 'table',
      title: '데이터 테이블',
      description: '자동차 특성 및 연비 정보',
    },
  ],
  prediction: {
    display: {
      type: 'tabular',
      title: '자동차 연비 예측 결과',
      description: '자동차 특성에 따른 연비(MPG) 예측 결과',
      columns: [
        { key: 'horsepower', label: '마력 (HP)', type: 'number', format: { precision: 0 } },
        {
          key: 'predicted_mpg',
          label: '예측 연비 (MPG)',
          type: 'number',
          format: { precision: 1 },
        },
        { key: 'actual_mpg', label: '실제 연비 (MPG)', type: 'number', format: { precision: 1 } },
        { key: 'error', label: '오차', type: 'number', format: { precision: 2 } },
      ],
      sampleLimit: 20,
      supportsRealtime: true,
    },
    input: {
      type: 'form',
      title: '자동차 특성 입력',
      description: '자동차의 마력을 입력하여 연비를 예측해보세요',
      formFields: [
        {
          key: 'horsepower',
          label: '마력 (HP)',
          type: 'number',
          min: 40,
          max: 250,
          step: 5,
          defaultValue: 120,
        },
      ],
    },
    defaultSamples: { count: 20, useTestSet: true, shuffled: true },
  },
})

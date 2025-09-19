import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from '../BaseDataset'
import { IDataset } from '../../types'

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
  
  readonly trainInputs: tf.Tensor
  readonly trainLabels: tf.Tensor
  readonly testInputs: tf.Tensor
  readonly testLabels: tf.Tensor
  readonly trainCount: number
  readonly testCount: number
  
  constructor(
    trainInputs: tf.Tensor,
    trainLabels: tf.Tensor,
    testInputs: tf.Tensor,
    testLabels: tf.Tensor
  ) {
    super()
    
    this.trainInputs = trainInputs
    this.trainLabels = trainLabels
    this.testInputs = testInputs
    this.testLabels = testLabels
    
    this.trainCount = trainInputs.shape[0]
    this.testCount = testInputs.shape[0]
    this.sampleCount = this.trainCount + this.testCount
    
    // 전체 데이터 결합
    this.inputs = tf.concat([trainInputs, testInputs], 0)
    this.labels = tf.concat([trainLabels, testLabels], 0)
  }
}

/**
 * 자동차 데이터 다운로드 및 정제
 */
async function getData(): Promise<CarData[]> {
  console.log('📥 Downloading car MPG data...')
  
  try {
    const carsDataResponse = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json')
    
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
function convertToTensors(data: CarData[], testSplit: number = 0.2): [tf.Tensor, tf.Tensor, tf.Tensor, tf.Tensor] {
  return tf.tidy(() => {
    // 데이터 셔플
    tf.util.shuffle(data)
    
    // 특성과 레이블 분리
    const inputs = data.map(d => d.horsepower)
    const labels = data.map(d => d.mpg)
    
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
    
    // 훈련/테스트 분할
    const numTestExamples = Math.round(data.length * testSplit)
    const numTrainExamples = data.length - numTestExamples
    
    const trainInputs = normalizedInputs.slice([0, 0], [numTrainExamples, 1])
    const testInputs = normalizedInputs.slice([numTrainExamples, 0], [numTestExamples, 1])
    const trainLabels = normalizedLabels.slice([0, 0], [numTrainExamples, 1])
    const testLabels = normalizedLabels.slice([numTrainExamples, 0], [numTestExamples, 1])
    
    return [trainInputs, trainLabels, testInputs, testLabels]
  })
}

/**
 * Car MPG 데이터셋 로더
 */
export async function loadCarMPG(): Promise<IDataset> {
  console.log('🚗 Loading Car MPG dataset...')
  
  try {
    // 데이터 다운로드
    const data = await getData()
    
    // 텐서로 변환 및 분할
    const [trainInputs, trainLabels, testInputs, testLabels] = convertToTensors(data, 0.2)
    
    const dataset = new CarMPGDataset(trainInputs, trainLabels, testInputs, testLabels)
    
    console.log('✅ Car MPG dataset loaded successfully')
    console.log(`📊 Train samples: ${dataset.trainCount}, Test samples: ${dataset.testCount}`)
    console.log('📈 Task: Predict MPG from Horsepower (regression)')
    
    return dataset
    
  } catch (error) {
    console.error('❌ Failed to load Car MPG dataset:', error)
    throw error
  }
}

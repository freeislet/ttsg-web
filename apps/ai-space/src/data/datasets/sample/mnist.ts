import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from '../BaseDataset'
import { IDataset } from '../../types'
import { 
  fetchAndDecompress, 
  parseIDXImages, 
  parseIDXLabels, 
  getCacheKey, 
  loadFromCache, 
  saveToCache, 
  isCacheExpired 
} from '../../../utils/dataLoader'

// MNIST 데이터 상수
const IMAGE_HEIGHT = 28
const IMAGE_WIDTH = 28
const IMAGE_FLAT_SIZE = IMAGE_HEIGHT * IMAGE_WIDTH
const LABEL_FLAT_SIZE = 10

// MNIST 데이터 URL (TensorFlow Datasets 공식)
const MNIST_BASE_URL = 'https://storage.googleapis.com/cvdf-datasets/mnist/'
const MNIST_TRAIN_IMAGES = 'train-images-idx3-ubyte.gz'
const MNIST_TRAIN_LABELS = 'train-labels-idx1-ubyte.gz'
const MNIST_TEST_IMAGES = 't10k-images-idx3-ubyte.gz'
const MNIST_TEST_LABELS = 't10k-labels-idx1-ubyte.gz'

/**
 * MNIST 데이터셋 클래스
 */
class MNISTDataset extends BaseDataset {
  readonly inputs: tf.Tensor
  readonly labels: tf.Tensor
  readonly inputShape: number[] = [28, 28, 1]
  readonly outputShape: number[] = [10]
  readonly inputColumns: string[] = ['pixel']
  readonly outputColumns: string[] = ['digit']
  readonly sampleCount: number

  readonly trainInputs: tf.Tensor
  readonly trainLabels: tf.Tensor
  readonly testInputs: tf.Tensor
  readonly testLabels: tf.Tensor
  readonly trainCount: number
  readonly testCount: number

  constructor(
    trainImages: tf.Tensor,
    trainLabels: tf.Tensor,
    testImages: tf.Tensor,
    testLabels: tf.Tensor
  ) {
    super()

    // 훈련 및 테스트 데이터 저장
    this.trainInputs = trainImages
    this.trainLabels = trainLabels
    this.testInputs = testImages
    this.testLabels = testLabels

    this.trainCount = trainImages.shape[0]
    this.testCount = testImages.shape[0]
    this.sampleCount = this.trainCount + this.testCount

    // 전체 데이터 결합
    this.inputs = tf.concat([trainImages, testImages], 0)
    this.labels = tf.concat([trainLabels, testLabels], 0)
  }

  dispose(): void {
    super.dispose()
    // 추가 정리 작업이 필요한 경우 여기에 구현
  }
}


/**
 * 실제 MNIST 데이터를 URL에서 로드하는 클래스
 */
class MNISTDataLoader {
  private trainImages: Float32Array[] | null = null
  private trainLabels: Uint8Array[] | null = null
  private testImages: Float32Array[] | null = null
  private testLabels: Uint8Array[] | null = null

  async load(): Promise<void> {
    console.log('🌐 Loading MNIST data from official sources...')
    
    try {
      // 병렬로 모든 파일 로드
      const [trainImagesData, trainLabelsData, testImagesData, testLabelsData] = await Promise.all([
        this.loadFile(MNIST_BASE_URL + MNIST_TRAIN_IMAGES, 'train_images'),
        this.loadFile(MNIST_BASE_URL + MNIST_TRAIN_LABELS, 'train_labels'),
        this.loadFile(MNIST_BASE_URL + MNIST_TEST_IMAGES, 'test_images'),
        this.loadFile(MNIST_BASE_URL + MNIST_TEST_LABELS, 'test_labels')
      ])

      // IDX 파일 파싱
      this.trainImages = parseIDXImages(trainImagesData)
      this.trainLabels = parseIDXLabels(trainLabelsData, LABEL_FLAT_SIZE)
      this.testImages = parseIDXImages(testImagesData)
      this.testLabels = parseIDXLabels(testLabelsData, LABEL_FLAT_SIZE)

      console.log('✅ MNIST data loaded successfully')
      console.log(`📊 Train: ${this.trainImages.length} images, Test: ${this.testImages.length} images`)
    } catch (error) {
      console.error('❌ Failed to load MNIST data:', error)
      throw error
    }
  }

  private async loadFile(url: string, type: string): Promise<ArrayBuffer> {
    const cacheKey = getCacheKey(url)
    
    // 캐시 확인
    if (!isCacheExpired(cacheKey)) {
      const cached = loadFromCache(cacheKey)
      if (cached) {
        console.log(`💾 Using cached ${type} data`)
        return cached
      }
    }

    // 새로 다운로드
    console.log(`📥 Downloading ${type} from ${url}`)
    const buffer = await fetchAndDecompress(url)
    
    // 캐시 저장
    saveToCache(cacheKey, buffer)
    
    return buffer
  }

  getTrainData(): { images: Float32Array[], labels: Uint8Array[] } {
    if (!this.trainImages || !this.trainLabels) {
      throw new Error('Data not loaded. Call load() first.')
    }
    return { images: this.trainImages, labels: this.trainLabels }
  }

  getTestData(): { images: Float32Array[], labels: Uint8Array[] } {
    if (!this.testImages || !this.testLabels) {
      throw new Error('Data not loaded. Call load() first.')
    }
    return { images: this.testImages, labels: this.testLabels }
  }
}

/**
 * MNIST 데이터셋 로더 (실제 URL에서 로드)
 */
export async function loadMNIST(): Promise<IDataset> {
  console.log('🚀 Loading MNIST dataset from remote URLs...')

  try {
    const loader = new MNISTDataLoader()
    await loader.load()

    const trainData = loader.getTrainData()
    const testData = loader.getTestData()

    // 이미지 텐서 생성 (4D: [batch, height, width, channels])
    const trainImagesTensor = tf.tensor4d(
      trainData.images.reduce((acc, img) => acc.concat(Array.from(img)), [] as number[]),
      [trainData.images.length, IMAGE_HEIGHT, IMAGE_WIDTH, 1]
    )

    const testImagesTensor = tf.tensor4d(
      testData.images.reduce((acc, img) => acc.concat(Array.from(img)), [] as number[]),
      [testData.images.length, IMAGE_HEIGHT, IMAGE_WIDTH, 1]
    )

    // 라벨 텐서 생성 (이미 원-핫 인코딩됨)
    const trainLabelsTensor = tf.tensor2d(
      trainData.labels.reduce((acc, label) => acc.concat(Array.from(label)), [] as number[]),
      [trainData.labels.length, LABEL_FLAT_SIZE]
    ).toFloat()

    const testLabelsTensor = tf.tensor2d(
      testData.labels.reduce((acc, label) => acc.concat(Array.from(label)), [] as number[]),
      [testData.labels.length, LABEL_FLAT_SIZE]
    ).toFloat()

    const dataset = new MNISTDataset(
      trainImagesTensor,
      trainLabelsTensor,
      testImagesTensor,
      testLabelsTensor
    )

    console.log('✅ MNIST dataset loaded successfully')
    console.log(`📊 Train samples: ${dataset.trainCount}, Test samples: ${dataset.testCount}`)

    return dataset
  } catch (error) {
    console.error('❌ Failed to load MNIST dataset:', error)
    // 실패 시 폴백으로 샘플 데이터 생성
    console.log('🔄 Falling back to sample data...')
    return loadMNISTSample()
  }
}

/**
 * 폴백용 샘플 MNIST 데이터 생성
 */
function generateSampleMNISTData(numSamples: number): {
  images: Float32Array[]
  labels: number[]
} {
  const images: Float32Array[] = []
  const labels: number[] = []

  for (let i = 0; i < numSamples; i++) {
    const image = new Float32Array(IMAGE_FLAT_SIZE)
    const digit = i % 10
    
    for (let j = 0; j < IMAGE_FLAT_SIZE; j++) {
      const row = Math.floor(j / IMAGE_WIDTH)
      const col = j % IMAGE_WIDTH
      
      if (row >= 8 && row <= 20 && col >= 8 && col <= 20) {
        switch (digit) {
          case 0:
            const centerX = 14, centerY = 14
            const distance = Math.sqrt((row - centerY) ** 2 + (col - centerX) ** 2)
            image[j] = distance >= 4 && distance <= 6 ? 0.8 + Math.random() * 0.2 : Math.random() * 0.1
            break
          case 1:
            image[j] = col >= 13 && col <= 15 ? 0.8 + Math.random() * 0.2 : Math.random() * 0.1
            break
          default:
            image[j] = Math.random() > 0.7 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.1
        }
      } else {
        image[j] = Math.random() * 0.1
      }
    }
    
    images.push(image)
    labels.push(digit)
  }

  return { images, labels }
}

/**
 * 폴백용 샘플 MNIST 데이터셋 로더
 */
async function loadMNISTSample(): Promise<IDataset> {
  console.log('📊 Generating sample MNIST data...')
  
  const trainData = generateSampleMNISTData(1000)
  const testData = generateSampleMNISTData(200)

  const trainImagesTensor = tf.tensor4d(
    trainData.images.reduce((acc, img) => acc.concat(Array.from(img)), [] as number[]),
    [trainData.images.length, IMAGE_HEIGHT, IMAGE_WIDTH, 1]
  )

  const trainLabelsTensor = tf
    .oneHot(tf.tensor1d(trainData.labels, 'int32'), LABEL_FLAT_SIZE)
    .toFloat()

  const testImagesTensor = tf.tensor4d(
    testData.images.reduce((acc, img) => acc.concat(Array.from(img)), [] as number[]),
    [testData.images.length, IMAGE_HEIGHT, IMAGE_WIDTH, 1]
  )

  const testLabelsTensor = tf.oneHot(tf.tensor1d(testData.labels, 'int32'), LABEL_FLAT_SIZE).toFloat()

  return new MNISTDataset(
    trainImagesTensor,
    trainLabelsTensor,
    testImagesTensor,
    testLabelsTensor
  )
}

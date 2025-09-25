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

// Fashion-MNIST 데이터 상수
const IMAGE_HEIGHT = 28
const IMAGE_WIDTH = 28
const IMAGE_FLAT_SIZE = IMAGE_HEIGHT * IMAGE_WIDTH
const LABEL_FLAT_SIZE = 10

// Fashion-MNIST 데이터 URL (공식 소스)
const FASHION_MNIST_BASE_URL = 'http://fashion-mnist.s3-website.eu-central-1.amazonaws.com/'
const FASHION_MNIST_TRAIN_IMAGES = 'train-images-idx3-ubyte.gz'
const FASHION_MNIST_TRAIN_LABELS = 'train-labels-idx1-ubyte.gz'
const FASHION_MNIST_TEST_IMAGES = 't10k-images-idx3-ubyte.gz'
const FASHION_MNIST_TEST_LABELS = 't10k-labels-idx1-ubyte.gz'

// Fashion-MNIST 클래스 레이블
const FASHION_CLASSES = [
  'T-shirt/top',
  'Trouser',
  'Pullover',
  'Dress',
  'Coat',
  'Sandal',
  'Shirt',
  'Sneaker',
  'Bag',
  'Ankle boot'
]

/**
 * Fashion-MNIST 데이터셋 클래스
 */
class FashionMNISTDataset extends BaseDataset {
  readonly inputs: tf.Tensor
  readonly labels: tf.Tensor
  readonly inputShape: number[] = [28, 28, 1]
  readonly outputShape: number[] = [10]
  readonly inputColumns: string[] = ['pixel']
  readonly outputColumns: string[] = ['fashion_class']
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
 * 실제 Fashion-MNIST 데이터를 URL에서 로드하는 클래스
 */
class FashionMNISTDataLoader {
  private trainImages: Float32Array[] | null = null
  private trainLabels: Uint8Array[] | null = null
  private testImages: Float32Array[] | null = null
  private testLabels: Uint8Array[] | null = null

  async load(): Promise<void> {
    console.log('👗 Loading Fashion-MNIST data from official sources...')
    
    try {
      // 병렬로 모든 파일 로드
      const [trainImagesData, trainLabelsData, testImagesData, testLabelsData] = await Promise.all([
        this.loadFile(FASHION_MNIST_BASE_URL + FASHION_MNIST_TRAIN_IMAGES, 'train_images'),
        this.loadFile(FASHION_MNIST_BASE_URL + FASHION_MNIST_TRAIN_LABELS, 'train_labels'),
        this.loadFile(FASHION_MNIST_BASE_URL + FASHION_MNIST_TEST_IMAGES, 'test_images'),
        this.loadFile(FASHION_MNIST_BASE_URL + FASHION_MNIST_TEST_LABELS, 'test_labels')
      ])

      // IDX 파일 파싱
      this.trainImages = parseIDXImages(trainImagesData)
      this.trainLabels = parseIDXLabels(trainLabelsData, LABEL_FLAT_SIZE)
      this.testImages = parseIDXImages(testImagesData)
      this.testLabels = parseIDXLabels(testLabelsData, LABEL_FLAT_SIZE)

      console.log('✅ Fashion-MNIST data loaded successfully')
      console.log(`👗 Train: ${this.trainImages.length} images, Test: ${this.testImages.length} images`)
    } catch (error) {
      console.error('❌ Failed to load Fashion-MNIST data:', error)
      throw error
    }
  }

  private async loadFile(url: string, type: string): Promise<ArrayBuffer> {
    const cacheKey = getCacheKey(url, 'fashion-mnist')
    
    // 캐시 확인
    if (!isCacheExpired(cacheKey)) {
      const cached = loadFromCache(cacheKey)
      if (cached) {
        console.log(`💾 Using cached Fashion-MNIST ${type} data`)
        return cached
      }
    }

    // 새로 다운로드
    console.log(`📥 Downloading Fashion-MNIST ${type} from ${url}`)
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
 * Fashion-MNIST 샘플 데이터 생성 (폴백용)
 */
function generateSampleFashionMNISTData(numSamples: number): {
  images: Float32Array[]
  labels: number[]
} {
  const images: Float32Array[] = []
  const labels: number[] = []

  for (let i = 0; i < numSamples; i++) {
    const image = new Float32Array(IMAGE_FLAT_SIZE)
    const classIndex = i % 10 // 0-9 클래스 순환
    
    // 각 패션 아이템별로 간단한 패턴 생성
    for (let j = 0; j < IMAGE_FLAT_SIZE; j++) {
      const row = Math.floor(j / IMAGE_WIDTH)
      const col = j % IMAGE_WIDTH
      
      // 중앙 영역에 클래스별 패턴 생성
      if (row >= 6 && row <= 22 && col >= 6 && col <= 22) {
        switch (classIndex) {
          case 0: // T-shirt/top - 상의 형태
            if ((row <= 10 && col >= 10 && col <= 18) || (row >= 10 && row <= 18 && col >= 8 && col <= 20)) {
              image[j] = 0.7 + Math.random() * 0.3
            } else {
              image[j] = Math.random() * 0.1
            }
            break
          case 1: // Trouser - 바지 형태
            if (row >= 12 && ((col >= 8 && col <= 12) || (col >= 16 && col <= 20))) {
              image[j] = 0.7 + Math.random() * 0.3
            } else {
              image[j] = Math.random() * 0.1
            }
            break
          case 2: // Pullover - 풀오버 형태
            if ((row <= 12 && col >= 9 && col <= 19) || (row >= 12 && row <= 20 && col >= 7 && col <= 21)) {
              image[j] = 0.6 + Math.random() * 0.4
            } else {
              image[j] = Math.random() * 0.1
            }
            break
          case 5: // Sandal - 샌들 형태
            if (row >= 18 && ((col >= 8 && col <= 12) || (col >= 16 && col <= 20))) {
              image[j] = 0.8 + Math.random() * 0.2
            } else {
              image[j] = Math.random() * 0.1
            }
            break
          case 7: // Sneaker - 운동화 형태
            if (row >= 16 && col >= 8 && col <= 20) {
              image[j] = 0.7 + Math.random() * 0.3
            } else {
              image[j] = Math.random() * 0.1
            }
            break
          case 8: // Bag - 가방 형태
            if ((row >= 8 && row <= 20 && col >= 10 && col <= 18) || (row >= 6 && row <= 10 && col >= 12 && col <= 16)) {
              image[j] = 0.6 + Math.random() * 0.4
            } else {
              image[j] = Math.random() * 0.1
            }
            break
          default: // 기타 아이템들은 랜덤 패턴
            image[j] = Math.random() > 0.6 ? 0.5 + Math.random() * 0.5 : Math.random() * 0.2
        }
      } else {
        // 배경 노이즈
        image[j] = Math.random() * 0.1
      }
    }
    
    images.push(image)
    labels.push(classIndex)
  }

  return { images, labels }
}

/**
 * Fashion-MNIST 데이터셋 로더 (실제 URL에서 로드)
 */
export async function loadFashionMNIST(): Promise<IDataset> {
  console.log('🚀 Loading Fashion-MNIST dataset from remote URLs...')

  try {
    const loader = new FashionMNISTDataLoader()
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

    const dataset = new FashionMNISTDataset(
      trainImagesTensor,
      trainLabelsTensor,
      testImagesTensor,
      testLabelsTensor
    )

    console.log('✅ Fashion-MNIST dataset loaded successfully')
    console.log(`👗 Train samples: ${dataset.trainCount}, Test samples: ${dataset.testCount}`)
    console.log(`📋 Classes: ${FASHION_CLASSES.join(', ')}`)

    return dataset
  } catch (error) {
    console.error('❌ Failed to load Fashion-MNIST dataset:', error)
    // 실패 시 폴백으로 샘플 데이터 생성
    console.log('🔄 Falling back to sample data...')
    return loadFashionMNISTSample()
  }
}

/**
 * 폴백용 샘플 Fashion-MNIST 데이터셋 로더
 */
async function loadFashionMNISTSample(): Promise<IDataset> {
  console.log('👗 Generating sample Fashion-MNIST data...')
  
  const trainData = generateSampleFashionMNISTData(1000)
  const testData = generateSampleFashionMNISTData(200)

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

  return new FashionMNISTDataset(
    trainImagesTensor,
    trainLabelsTensor,
    testImagesTensor,
    testLabelsTensor
  )
}

/**
 * Fashion-MNIST 클래스 이름 가져오기
 */
export function getFashionMNISTClasses(): string[] {
  return [...FASHION_CLASSES]
}

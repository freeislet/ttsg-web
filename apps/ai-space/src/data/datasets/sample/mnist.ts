import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from '../BaseDataset'
import { IDataset, ProgressCallback } from '../../types'

// MNIST 데이터 상수
const IMAGE_HEIGHT = 28
const IMAGE_WIDTH = 28
const NUM_CLASSES = 10
const NUM_DATASET_ELEMENTS = 65000
const NUM_TRAIN_ELEMENTS = 55000
const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS

// MNIST 이미지 스프라이트 URL (TensorFlow.js 예제에서 사용하는 방식)
const MNIST_IMAGES_SPRITE_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png'
const MNIST_LABELS_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8'

/**
 * MNIST 데이터셋 클래스 (TensorFlow.js 예제 방식)
 */
class MNISTDataset extends BaseDataset {
  readonly inputs: tf.Tensor
  readonly labels: tf.Tensor
  readonly trainInputs: tf.Tensor
  readonly trainLabels: tf.Tensor
  readonly testInputs: tf.Tensor
  readonly testLabels: tf.Tensor
  readonly trainCount: number
  readonly testCount: number

  // BaseDataset 추상 속성 구현
  readonly inputShape = [28, 28, 1]
  readonly outputShape = [10]
  readonly inputColumns = ['pixel']
  readonly outputColumns = ['digit']
  readonly sampleCount: number

  constructor(
    inputs: tf.Tensor,
    labels: tf.Tensor,
    trainInputs: tf.Tensor,
    trainLabels: tf.Tensor,
    testInputs: tf.Tensor,
    testLabels: tf.Tensor
  ) {
    super()
    this.inputs = inputs
    this.labels = labels
    this.trainInputs = trainInputs
    this.trainLabels = trainLabels
    this.testInputs = testInputs
    this.testLabels = testLabels
    this.trainCount = trainInputs.shape[0]
    this.testCount = testInputs.shape[0]
    this.sampleCount = this.trainCount + this.testCount
  }

  getTrainBatch(batchSize: number = 32): { inputs: tf.Tensor; labels: tf.Tensor } {
    const indices = tf.randomUniform([batchSize], 0, this.trainCount, 'int32')
    return {
      inputs: tf.gather(this.trainInputs, indices),
      labels: tf.gather(this.trainLabels, indices)
    }
  }

  getTestBatch(batchSize: number = 32): { inputs: tf.Tensor; labels: tf.Tensor } {
    const indices = tf.randomUniform([batchSize], 0, this.testCount, 'int32')
    return {
      inputs: tf.gather(this.testInputs, indices),
      labels: tf.gather(this.testLabels, indices)
    }
  }

  dispose(): void {
    this.inputs.dispose()
    this.labels.dispose()
    this.trainInputs.dispose()
    this.trainLabels.dispose()
    this.testInputs.dispose()
    this.testLabels.dispose()
  }
}

/**
 * 이미지 스프라이트에서 개별 이미지 추출
 */
function loadImageFromSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  index: number
): Float32Array {
  const imagesPerRow = img.width / IMAGE_WIDTH
  const row = Math.floor(index / imagesPerRow)
  const col = index % imagesPerRow

  ctx.drawImage(
    img,
    col * IMAGE_WIDTH, row * IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_HEIGHT,
    0, 0, IMAGE_WIDTH, IMAGE_HEIGHT
  )

  const imageData = ctx.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)
  const data = new Float32Array(IMAGE_HEIGHT * IMAGE_WIDTH)
  
  for (let i = 0; i < data.length; i++) {
    // RGBA에서 R 채널만 사용하고 0-1로 정규화
    data[i] = imageData.data[i * 4] / 255
  }
  
  return data
}

/**
 * MNIST 데이터셋 로더 (TensorFlow.js 예제 방식)
 */
export async function loadMNIST(onProgress?: ProgressCallback): Promise<IDataset> {
  console.log('🎯 Loading MNIST dataset from image sprite...')
  onProgress?.(0, 'initializing', 'MNIST 데이터셋 초기화...')
  
  try {
    // 이미지 스프라이트 로드
    onProgress?.(10, 'downloading', '이미지 스프라이트 다운로드 중...')
    const img = new Image()
    const imgLoadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.crossOrigin = 'anonymous'
      img.src = MNIST_IMAGES_SPRITE_PATH
    })
    await imgLoadPromise

    // 라벨 데이터 로드
    onProgress?.(20, 'downloading', '라벨 데이터 다운로드 중...')
    const labelsResponse = await fetch(MNIST_LABELS_PATH)
    if (!labelsResponse.ok) {
      throw new Error(`라벨 데이터 로드 실패: ${labelsResponse.status}`)
    }
    const labelsBuffer = await labelsResponse.arrayBuffer()
    const labels = new Uint8Array(labelsBuffer)

    // 캔버스 설정
    const canvas = document.createElement('canvas')
    canvas.width = IMAGE_WIDTH
    canvas.height = IMAGE_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas context 생성 실패')
    }

    // 이미지 데이터 추출
    onProgress?.(30, 'processing', '이미지 데이터 추출 중...')
    const imageData = new Float32Array(NUM_DATASET_ELEMENTS * IMAGE_HEIGHT * IMAGE_WIDTH)
    
    for (let i = 0; i < NUM_DATASET_ELEMENTS; i++) {
      const imagePixels = loadImageFromSprite(ctx, img, i)
      imageData.set(imagePixels, i * IMAGE_HEIGHT * IMAGE_WIDTH)
      
      if (i % 1000 === 0) {
        const progress = 30 + Math.round((i / NUM_DATASET_ELEMENTS) * 40)
        onProgress?.(progress, 'processing', `이미지 처리 중... ${i}/${NUM_DATASET_ELEMENTS}`)
      }
    }

    // 텐서 생성
    onProgress?.(70, 'converting', '텐서 변환 중...')
    const imagesTensor = tf.tensor4d(imageData, [NUM_DATASET_ELEMENTS, IMAGE_HEIGHT, IMAGE_WIDTH, 1])
    const labelsTensor = tf.oneHot(Array.from(labels), NUM_CLASSES)

    // 훈련/테스트 분할
    onProgress?.(80, 'splitting', '데이터 분할 중...')
    const trainInputs = imagesTensor.slice([0, 0, 0, 0], [NUM_TRAIN_ELEMENTS, IMAGE_HEIGHT, IMAGE_WIDTH, 1])
    const trainLabels = labelsTensor.slice([0, 0], [NUM_TRAIN_ELEMENTS, NUM_CLASSES])
    const testInputs = imagesTensor.slice([NUM_TRAIN_ELEMENTS, 0, 0, 0], [NUM_TEST_ELEMENTS, IMAGE_HEIGHT, IMAGE_WIDTH, 1])
    const testLabels = labelsTensor.slice([NUM_TRAIN_ELEMENTS, 0], [NUM_TEST_ELEMENTS, NUM_CLASSES])

    // 데이터셋 생성
    onProgress?.(90, 'creating', '데이터셋 생성 중...')
    const dataset = new MNISTDataset(
      imagesTensor,
      labelsTensor,
      trainInputs,
      trainLabels,
      testInputs,
      testLabels
    )

    onProgress?.(100, 'completed', '로딩 완료!')
    console.log('✅ MNIST dataset loaded successfully')
    console.log(`📊 Train samples: ${dataset.trainCount}, Test samples: ${dataset.testCount}`)
    
    return dataset
    
  } catch (error) {
    console.error('❌ Failed to load MNIST dataset:', error)
    throw error
  }
}

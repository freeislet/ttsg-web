import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from './BaseDataset'
import { IDataset } from '../types'

// MNIST 데이터 상수
const BASE_URL = 'https://storage.googleapis.com/cvdf-datasets/mnist/'
const TRAIN_IMAGES_FILE = 'train-images-idx3-ubyte'
const TRAIN_LABELS_FILE = 'train-labels-idx1-ubyte'
const TEST_IMAGES_FILE = 't10k-images-idx3-ubyte'
const TEST_LABELS_FILE = 't10k-labels-idx1-ubyte'
const IMAGE_HEADER_MAGIC_NUM = 2051
const IMAGE_HEADER_BYTES = 16
const IMAGE_HEIGHT = 28
const IMAGE_WIDTH = 28
const IMAGE_FLAT_SIZE = IMAGE_HEIGHT * IMAGE_WIDTH
const LABEL_HEADER_MAGIC_NUM = 2049
const LABEL_HEADER_BYTES = 8
const LABEL_FLAT_SIZE = 10

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
 * 브라우저에서 파일 다운로드 및 압축 해제
 */
async function fetchAndDecompress(filename: string): Promise<ArrayBuffer> {
  const url = `${BASE_URL}${filename}.gz`
  
  console.log(`📥 Downloading MNIST data: ${filename}`)
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }
    
    const compressedData = await response.arrayBuffer()
    
    // 브라우저에서 gzip 압축 해제
    const decompressedData = await decompressGzip(compressedData)
    
    console.log(`✅ Downloaded and decompressed: ${filename}`)
    return decompressedData
    
  } catch (error) {
    console.error(`❌ Failed to download ${filename}:`, error)
    throw error
  }
}

/**
 * Gzip 압축 해제 (브라우저 환경)
 */
async function decompressGzip(compressedData: ArrayBuffer): Promise<ArrayBuffer> {
  // DecompressionStream API 사용 (최신 브라우저)
  if ('DecompressionStream' in window) {
    const stream = new DecompressionStream('gzip')
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()
    
    writer.write(new Uint8Array(compressedData))
    writer.close()
    
    const chunks: Uint8Array[] = []
    let done = false
    
    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        chunks.push(value)
      }
    }
    
    // 청크들을 하나의 ArrayBuffer로 결합
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }
    
    return result.buffer
  } else {
    // 폴백: pako 라이브러리 사용 (필요시 설치)
    throw new Error('Gzip decompression not supported in this browser')
  }
}

/**
 * 헤더 값 로드
 */
function loadHeaderValues(buffer: ArrayBuffer, headerLength: number): number[] {
  const view = new DataView(buffer)
  const headerValues: number[] = []
  
  for (let i = 0; i < headerLength / 4; i++) {
    // 빅엔디안으로 저장된 데이터 읽기
    headerValues[i] = view.getUint32(i * 4, false)
  }
  
  return headerValues
}

/**
 * 이미지 데이터 로드
 */
async function loadImages(filename: string): Promise<Float32Array[]> {
  const buffer = await fetchAndDecompress(filename)
  const view = new DataView(buffer)
  
  const headerValues = loadHeaderValues(buffer, IMAGE_HEADER_BYTES)
  
  if (headerValues[0] !== IMAGE_HEADER_MAGIC_NUM) {
    throw new Error(`Invalid image file magic number: ${headerValues[0]}`)
  }
  
  const numImages = headerValues[1]
  const height = headerValues[2]
  const width = headerValues[3]
  
  if (height !== IMAGE_HEIGHT || width !== IMAGE_WIDTH) {
    throw new Error(`Unexpected image dimensions: ${height}x${width}`)
  }
  
  const images: Float32Array[] = []
  let offset = IMAGE_HEADER_BYTES
  
  for (let i = 0; i < numImages; i++) {
    const image = new Float32Array(IMAGE_FLAT_SIZE)
    
    for (let j = 0; j < IMAGE_FLAT_SIZE; j++) {
      // 0-255 값을 0-1로 정규화
      image[j] = view.getUint8(offset++) / 255.0
    }
    
    images.push(image)
  }
  
  console.log(`📊 Loaded ${images.length} images`)
  return images
}

/**
 * 레이블 데이터 로드
 */
async function loadLabels(filename: string): Promise<number[]> {
  const buffer = await fetchAndDecompress(filename)
  const view = new DataView(buffer)
  
  const headerValues = loadHeaderValues(buffer, LABEL_HEADER_BYTES)
  
  if (headerValues[0] !== LABEL_HEADER_MAGIC_NUM) {
    throw new Error(`Invalid label file magic number: ${headerValues[0]}`)
  }
  
  const numLabels = headerValues[1]
  const labels: number[] = []
  let offset = LABEL_HEADER_BYTES
  
  for (let i = 0; i < numLabels; i++) {
    labels.push(view.getUint8(offset++))
  }
  
  console.log(`🏷️ Loaded ${labels.length} labels`)
  return labels
}

/**
 * MNIST 데이터셋 로더
 */
export async function loadMNIST(): Promise<IDataset> {
  console.log('🚀 Loading MNIST dataset...')
  
  try {
    // 병렬로 모든 파일 다운로드
    const [trainImages, trainLabels, testImages, testLabels] = await Promise.all([
      loadImages(TRAIN_IMAGES_FILE),
      loadLabels(TRAIN_LABELS_FILE),
      loadImages(TEST_IMAGES_FILE),
      loadLabels(TEST_LABELS_FILE)
    ])
    
    // 텐서로 변환
    const trainImagesTensor = tf.tensor4d(
      trainImages.reduce((acc, img) => acc.concat(Array.from(img)), [] as number[]),
      [trainImages.length, IMAGE_HEIGHT, IMAGE_WIDTH, 1]
    )
    
    const trainLabelsTensor = tf.oneHot(
      tf.tensor1d(trainLabels, 'int32'),
      LABEL_FLAT_SIZE
    ).toFloat()
    
    const testImagesTensor = tf.tensor4d(
      testImages.reduce((acc, img) => acc.concat(Array.from(img)), [] as number[]),
      [testImages.length, IMAGE_HEIGHT, IMAGE_WIDTH, 1]
    )
    
    const testLabelsTensor = tf.oneHot(
      tf.tensor1d(testLabels, 'int32'),
      LABEL_FLAT_SIZE
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
    throw error
  }
}

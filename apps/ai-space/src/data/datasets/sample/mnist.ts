import * as tf from '@tensorflow/tfjs'
import { BaseDataset } from '../BaseDataset'
import { IDataset } from '../../types'

// MNIST 데이터 상수
const IMAGE_HEIGHT = 28
const IMAGE_WIDTH = 28
const IMAGE_FLAT_SIZE = IMAGE_HEIGHT * IMAGE_WIDTH
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
 * 로컬 샘플 MNIST 데이터 생성 (CORS 문제 해결)
 */
function generateSampleMNISTData(numSamples: number): {
  images: Float32Array[]
  labels: number[]
} {
  const images: Float32Array[] = []
  const labels: number[] = []

  for (let i = 0; i < numSamples; i++) {
    // 간단한 패턴으로 샘플 이미지 생성
    const image = new Float32Array(IMAGE_FLAT_SIZE)
    const digit = i % 10 // 0-9 숫자 순환
    
    // 각 숫자별로 간단한 패턴 생성
    for (let j = 0; j < IMAGE_FLAT_SIZE; j++) {
      const row = Math.floor(j / IMAGE_WIDTH)
      const col = j % IMAGE_WIDTH
      
      // 중앙 영역에 숫자별 패턴 생성
      if (row >= 8 && row <= 20 && col >= 8 && col <= 20) {
        // 숫자별 간단한 패턴
        switch (digit) {
          case 0: // 원형 패턴
            const centerX = 14, centerY = 14
            const distance = Math.sqrt((row - centerY) ** 2 + (col - centerX) ** 2)
            image[j] = distance >= 4 && distance <= 6 ? 0.8 + Math.random() * 0.2 : Math.random() * 0.1
            break
          case 1: // 세로선 패턴
            image[j] = col >= 13 && col <= 15 ? 0.8 + Math.random() * 0.2 : Math.random() * 0.1
            break
          case 2: // 지그재그 패턴
            image[j] = (row <= 10 && col >= 10) || (row >= 18 && col <= 18) || (row >= 10 && row <= 18 && col >= 10 && col <= 18) ? 0.7 + Math.random() * 0.3 : Math.random() * 0.1
            break
          default: // 기타 숫자들은 랜덤 패턴
            image[j] = Math.random() > 0.7 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.1
        }
      } else {
        // 배경 노이즈
        image[j] = Math.random() * 0.1
      }
    }
    
    images.push(image)
    labels.push(digit)
  }

  return { images, labels }
}

/**
 * MNIST 데이터셋 로더 (로컬 샘플 데이터 사용)
 */
export async function loadMNIST(): Promise<IDataset> {
  console.log('🚀 Loading MNIST sample dataset...')

  try {
    // 로컬 샘플 데이터 생성
    console.log('📊 Generating sample MNIST data...')
    const trainData = generateSampleMNISTData(1000) // 1000개 훈련 샘플
    const testData = generateSampleMNISTData(200)   // 200개 테스트 샘플

    // 텐서로 변환
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

    const dataset = new MNISTDataset(
      trainImagesTensor,
      trainLabelsTensor,
      testImagesTensor,
      testLabelsTensor
    )

    console.log('✅ MNIST sample dataset loaded successfully')
    console.log(`📊 Train samples: ${dataset.trainCount}, Test samples: ${dataset.testCount}`)

    return dataset
  } catch (error) {
    console.error('❌ Failed to load MNIST dataset:', error)
    throw error
  }
}

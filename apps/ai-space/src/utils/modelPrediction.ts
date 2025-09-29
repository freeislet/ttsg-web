import * as tf from '@tensorflow/tfjs'
import { PredictionResult } from '@/types/ModelNode'
import { IDataset } from '@/data/types'
import { dataRegistry } from '@/data'

/**
 * 모델 예측을 수행하고 결과를 반환하는 유틸리티
 */
export class ModelPredictor {
  private model: tf.LayersModel
  private datasetId: string

  constructor(model: tf.LayersModel, datasetId: string) {
    this.model = model
    this.datasetId = datasetId
  }

  /**
   * 테스트 데이터에서 예측 수행
   */
  async predictOnTestData(
    dataset: IDataset,
    sampleCount: number = 10
  ): Promise<PredictionResult[]> {
    // 테스트 데이터가 있는지 확인
    const useTestSet = dataset.testInputs && dataset.testLabels && !dataset.testInputs.isDisposed
    const targetInputs = useTestSet ? dataset.testInputs : dataset.inputs
    const targetLabels = useTestSet ? dataset.testLabels : dataset.labels

    // 데이터셋 텐서가 dispose되었는지 확인
    if (targetInputs.isDisposed || targetLabels.isDisposed) {
      throw new Error('Target dataset tensors have been disposed. Please reload the dataset.')
    }

    const totalSamples = targetInputs.shape[0]
    const sampleIndices = this.getRandomIndices(totalSamples, Math.min(sampleCount, totalSamples))

    const results: PredictionResult[] = []

    for (const index of sampleIndices) {
      let inputSample: tf.Tensor | null = null
      let labelSample: tf.Tensor | null = null
      let prediction: tf.Tensor | null = null

      try {
        // 안전한 텐서 생성 - 복사본 생성으로 dispose 문제 방지
        inputSample = targetInputs.slice([index, 0], [1, -1])
        labelSample = targetLabels.slice([index, 0], [1, -1])

        // 텐서가 올바르게 생성되었는지 확인
        if (inputSample.isDisposed || labelSample.isDisposed) {
          console.warn(`Skipping index ${index}: tensors disposed during slicing`)
          continue
        }

        prediction = this.model.predict(inputSample) as tf.Tensor
        const predictionArray = await prediction.data()
        const labelArray = await labelSample.data()

        const result = await this.createPredictionResult(
          inputSample,
          Array.from(predictionArray),
          Array.from(labelArray),
          index
        )

        results.push(result)
      } catch (error) {
        console.error(`예측 중 오류 발생 (index: ${index}):`, error)
      } finally {
        // 안전한 메모리 정리
        if (prediction && !prediction.isDisposed) {
          prediction.dispose()
        }
        if (inputSample && !inputSample.isDisposed) {
          inputSample.dispose()
        }
        if (labelSample && !labelSample.isDisposed) {
          labelSample.dispose()
        }
      }
    }

    return results
  }

  /**
   * 전체 데이터에서 샘플링하여 예측 수행
   */
  async predictOnSampleData(
    dataset: IDataset,
    sampleCount: number = 10
  ): Promise<PredictionResult[]> {
    // 데이터셋 텐서가 dispose되었는지 확인
    if (dataset.inputs.isDisposed || dataset.labels.isDisposed) {
      throw new Error('Dataset tensors have been disposed. Please reload the dataset.')
    }

    const totalSamples = dataset.inputs.shape[0]
    const sampleIndices = this.getRandomIndices(totalSamples, Math.min(sampleCount, totalSamples))

    const results: PredictionResult[] = []

    for (const index of sampleIndices) {
      let inputSample: tf.Tensor | null = null
      let labelSample: tf.Tensor | null = null
      let prediction: tf.Tensor | null = null

      try {
        // 안전한 텐서 생성 - 복사본 생성으로 dispose 문제 방지
        inputSample = dataset.inputs.slice([index, 0], [1, -1])
        labelSample = dataset.labels.slice([index, 0], [1, -1])

        // 텐서가 올바르게 생성되었는지 확인
        if (inputSample.isDisposed || labelSample.isDisposed) {
          console.warn(`Skipping index ${index}: tensors disposed during slicing`)
          continue
        }

        prediction = this.model.predict(inputSample) as tf.Tensor
        const predictionArray = await prediction.data()
        const labelArray = await labelSample.data()

        const result = await this.createPredictionResult(
          inputSample,
          Array.from(predictionArray),
          Array.from(labelArray),
          index
        )

        results.push(result)
      } catch (error) {
        console.error(`예측 중 오류 발생 (index: ${index}):`, error)
      } finally {
        // 안전한 메모리 정리
        if (prediction && !prediction.isDisposed) {
          prediction.dispose()
        }
        if (inputSample && !inputSample.isDisposed) {
          inputSample.dispose()
        }
        if (labelSample && !labelSample.isDisposed) {
          labelSample.dispose()
        }
      }
    }

    return results
  }

  /**
   * 단일 입력에 대한 예측 수행 (실시간 예측용)
   */
  async predictSingle(input: tf.Tensor | number[]): Promise<PredictionResult> {
    let inputTensor: tf.Tensor

    if (Array.isArray(input)) {
      inputTensor = tf.tensor(input).expandDims(0)
    } else {
      inputTensor = input.shape.length === 1 ? input.expandDims(0) : input
    }

    try {
      const prediction = this.model.predict(inputTensor) as tf.Tensor
      const predictionArray = await prediction.data()

      const result = await this.createPredictionResult(
        inputTensor,
        Array.from(predictionArray),
        null, // 실시간 예측이므로 실제 라벨 없음
        -1
      )

      prediction.dispose()
      return result
    } finally {
      if (Array.isArray(input)) {
        inputTensor.dispose()
      }
    }
  }

  /**
   * PredictionResult 객체 생성
   */
  private async createPredictionResult(
    inputTensor: tf.Tensor,
    predictionArray: number[],
    labelArray: number[] | null,
    index: number
  ): Promise<PredictionResult> {
    // 데이터셋별 예측 설정 가져오기
    const predictionConfig = dataRegistry.getById(this.datasetId)?.prediction

    // 입력 데이터 처리 (이미지인 경우 픽셀 값 추출)
    const inputData = await inputTensor.data()

    // 예측 클래스 및 신뢰도 계산
    const { predictedClass, confidence } = this.processModelOutput(predictionArray)

    // 실제 클래스 계산 (라벨이 있는 경우)
    let actualClass: string | number | undefined
    if (labelArray) {
      actualClass = this.processLabelOutput(labelArray)
    }

    // 회귀 문제의 경우 오차 계산
    let error: number | undefined
    if (labelArray && this.isRegressionProblem(predictionArray)) {
      error = Math.abs(predictionArray[0] - labelArray[0])
    }

    const result: PredictionResult = {
      input: {
        tensor: inputTensor,
        data: Array.from(inputData),
        shape: inputTensor.shape,
        index,
      },
      output: predictionArray,
      predictedClass,
      confidence,
      actualClass,
      error,
      metadata: {
        datasetId: this.datasetId,
        predictionTime: new Date(),
        config: predictionConfig,
      },
    }

    return result
  }

  /**
   * 모델 출력 처리 (분류/회귀 구분)
   */
  private processModelOutput(output: number[]): {
    predictedClass: string | number
    confidence: number
  } {
    if (output.length === 1) {
      // 회귀 문제 또는 이진 분류
      const value = output[0]
      if (value >= 0 && value <= 1) {
        // 이진 분류 (시그모이드 출력)
        return {
          predictedClass: value > 0.5 ? 1 : 0,
          confidence: Math.max(value, 1 - value),
        }
      } else {
        // 회귀 문제
        return {
          predictedClass: Math.round(value * 100) / 100, // 소수점 둘째 자리까지
          confidence: 1.0, // 회귀는 신뢰도 개념이 다름
        }
      }
    } else {
      // 다중 분류 (소프트맥스 출력)
      const maxIndex = output.indexOf(Math.max(...output))
      const confidence = output[maxIndex]

      // MNIST의 경우 숫자로, Iris의 경우 품종명으로 변환
      let predictedClass: string | number = maxIndex
      if (this.datasetId === 'iris') {
        const irisClasses = ['setosa', 'versicolor', 'virginica']
        predictedClass = irisClasses[maxIndex] || `class_${maxIndex}`
      }

      return { predictedClass, confidence }
    }
  }

  /**
   * 라벨 출력 처리
   */
  private processLabelOutput(labelArray: number[]): string | number {
    if (labelArray.length === 1) {
      return Math.round(labelArray[0] * 100) / 100
    } else {
      // 원-핫 인코딩된 라벨
      const maxIndex = labelArray.indexOf(Math.max(...labelArray))

      if (this.datasetId === 'iris') {
        const irisClasses = ['setosa', 'versicolor', 'virginica']
        return irisClasses[maxIndex] || `class_${maxIndex}`
      }

      return maxIndex
    }
  }

  /**
   * 회귀 문제 여부 판단
   */
  private isRegressionProblem(output: number[]): boolean {
    return output.length === 1 && (output[0] < 0 || output[0] > 1)
  }

  /**
   * 무작위 인덱스 배열 생성
   */
  private getRandomIndices(totalCount: number, sampleCount: number): number[] {
    const indices = Array.from({ length: totalCount }, (_, i) => i)

    // Fisher-Yates 셔플 알고리즘
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }

    return indices.slice(0, sampleCount)
  }

  /**
   * 메모리 정리
   */
  dispose(): void {
    // 모델 자체는 정리하지 않음 (다른 곳에서 사용 중일 수 있음)
    console.log('ModelPredictor disposed')
  }
}

/**
 * 모델과 데이터셋을 사용해서 예측 수행하는 헬퍼 함수
 */
export async function generateModelPredictions(
  model: tf.LayersModel,
  dataset: IDataset,
  datasetId: string,
  options: {
    sampleCount?: number
    useTestSet?: boolean
    shuffled?: boolean
  } = {}
): Promise<PredictionResult[]> {
  const { sampleCount = 10, useTestSet = true, shuffled = true } = options

  const predictor = new ModelPredictor(model, datasetId)

  try {
    let results: PredictionResult[]

    if (useTestSet && dataset.testInputs && dataset.testLabels) {
      results = await predictor.predictOnTestData(dataset, sampleCount)
    } else {
      results = await predictor.predictOnSampleData(dataset, sampleCount)
    }

    // 셔플 옵션이 true이면 결과를 섞음
    if (shuffled) {
      for (let i = results.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[results[i], results[j]] = [results[j], results[i]]
      }
    }

    return results
  } finally {
    predictor.dispose()
  }
}

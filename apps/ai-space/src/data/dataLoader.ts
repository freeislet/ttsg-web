import * as tf from '@tensorflow/tfjs'
import { Dataset, DataPresetConfig, URLDataConfig } from '@/types/DataTypes'

/**
 * URL에서 JSON 데이터 로드
 */
export const loadJSONData = async (url: string): Promise<any[]> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  } catch (error) {
    console.error('Failed to load JSON data:', error)
    throw error
  }
}

/**
 * URL에서 CSV 데이터 로드 (간단한 파서)
 */
export const loadCSVData = async (url: string, hasHeaders: boolean = true): Promise<any[]> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const text = await response.text()
    const lines = text.trim().split('\n')
    
    if (lines.length === 0) {
      throw new Error('Empty CSV file')
    }
    
    const headers = hasHeaders ? lines[0].split(',').map(h => h.trim()) : null
    const dataLines = hasHeaders ? lines.slice(1) : lines
    
    return dataLines.map((line, index) => {
      const values = line.split(',').map(v => v.trim())
      if (headers) {
        const obj: any = {}
        headers.forEach((header, i) => {
          const value = values[i]
          obj[header] = isNaN(Number(value)) ? value : Number(value)
        })
        return obj
      } else {
        return values.map(v => isNaN(Number(v)) ? v : Number(v))
      }
    })
  } catch (error) {
    console.error('Failed to load CSV data:', error)
    throw error
  }
}

/**
 * 프리셋 데이터셋 로드
 */
export const loadPresetDataset = async (config: DataPresetConfig): Promise<Dataset> => {
  try {
    const rawData = await loadJSONData(config.url)
    
    // 입력/출력 데이터 추출
    const inputData = rawData.map(item => 
      config.inputColumns.map(col => {
        const value = item[col]
        return typeof value === 'number' ? value : parseFloat(value) || 0
      })
    )
    
    const outputData = rawData.map(item =>
      config.outputColumns.map(col => {
        const value = item[col]
        return typeof value === 'number' ? value : parseFloat(value) || 0
      })
    )
    
    // 텐서 생성
    const inputs = tf.tensor2d(inputData)
    const outputs = tf.tensor2d(outputData)
    
    // 훈련/테스트 분할 (80/20)
    const trainCount = Math.floor(rawData.length * 0.8)
    const testCount = rawData.length - trainCount
    
    const trainInputs = inputs.slice([0, 0], [trainCount, config.inputColumns.length])
    const trainOutputs = outputs.slice([0, 0], [trainCount, config.outputColumns.length])
    const testInputs = inputs.slice([trainCount, 0], [testCount, config.inputColumns.length])
    const testOutputs = outputs.slice([trainCount, 0], [testCount, config.outputColumns.length])
    
    return {
      id: `preset_${config.type}_${Date.now()}`,
      name: config.name,
      description: config.description,
      
      rawData,
      inputs,
      outputs,
      
      inputShape: [config.inputColumns.length],
      outputShape: [config.outputColumns.length],
      inputColumns: config.inputColumns,
      outputColumns: config.outputColumns,
      
      sampleCount: rawData.length,
      trainCount,
      testCount,
      
      trainInputs,
      trainOutputs,
      testInputs,
      testOutputs
    }
  } catch (error) {
    console.error('Failed to load preset dataset:', error)
    throw error
  }
}

/**
 * URL 데이터셋 로드
 */
export const loadURLDataset = async (config: URLDataConfig): Promise<Dataset> => {
  try {
    const rawData = config.format === 'json' 
      ? await loadJSONData(config.url)
      : await loadCSVData(config.url, config.headers)
    
    // 입력/출력 데이터 추출
    const inputData = rawData.map(item => 
      config.inputColumns.map(col => {
        const value = item[col]
        return typeof value === 'number' ? value : parseFloat(value) || 0
      })
    )
    
    const outputData = rawData.map(item =>
      config.outputColumns.map(col => {
        const value = item[col]
        return typeof value === 'number' ? value : parseFloat(value) || 0
      })
    )
    
    // 텐서 생성
    const inputs = tf.tensor2d(inputData)
    const outputs = tf.tensor2d(outputData)
    
    // 훈련/테스트 분할 (80/20)
    const trainCount = Math.floor(rawData.length * 0.8)
    const testCount = rawData.length - trainCount
    
    const trainInputs = inputs.slice([0, 0], [trainCount, config.inputColumns.length])
    const trainOutputs = outputs.slice([0, 0], [trainCount, config.outputColumns.length])
    const testInputs = inputs.slice([trainCount, 0], [testCount, config.inputColumns.length])
    const testOutputs = outputs.slice([trainCount, 0], [testCount, config.outputColumns.length])
    
    return {
      id: `url_${Date.now()}`,
      name: `Custom Dataset`,
      description: `Loaded from ${config.url}`,
      
      rawData,
      inputs,
      outputs,
      
      inputShape: [config.inputColumns.length],
      outputShape: [config.outputColumns.length],
      inputColumns: config.inputColumns,
      outputColumns: config.outputColumns,
      
      sampleCount: rawData.length,
      trainCount,
      testCount,
      
      trainInputs,
      trainOutputs,
      testInputs,
      testOutputs
    }
  } catch (error) {
    console.error('Failed to load URL dataset:', error)
    throw error
  }
}
